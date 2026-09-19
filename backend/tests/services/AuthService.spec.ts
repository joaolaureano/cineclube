import { SignJWT, exportJWK, generateKeyPair, createLocalJWKSet } from "jose";

const CLIENT_ID = "cliente-de-teste.apps.googleusercontent.com";

// Uma chave RSA nossa faz o papel da chave do Google: emite id_tokens validos e
// invalidos sem rede. So a origem das chaves e trocada - a verificacao de
// assinatura, audience, issuer e expiracao continua sendo a de producao.
let jwks: ReturnType<typeof createLocalJWKSet>;

jest.mock("jose", () => {
  const actual = jest.requireActual("jose");
  return {
    ...actual,
    createRemoteJWKSet: () => (...args: unknown[]) =>
      (jwks as (...a: unknown[]) => unknown)(...args),
  };
});

let key: Awaited<ReturnType<typeof generateKeyPair>>;

const googleToken = async (
  claims: Record<string, unknown>,
  overrides: { aud?: string; iss?: string } = {}
) => {
  const { SignJWT: RealSignJWT } = jest.requireActual("jose");
  const now = Math.floor(Date.now() / 1000);
  return new RealSignJWT({
    iss: overrides.iss ?? "https://accounts.google.com",
    aud: overrides.aud ?? CLIENT_ID,
    iat: now,
    exp: now + 3600,
    ...claims,
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(key.privateKey);
};

beforeAll(async () => {
  const actual = jest.requireActual("jose");
  key = await actual.generateKeyPair("RS256", { extractable: true });
  const jwk = await actual.exportJWK(key.publicKey);

  jwks = actual.createLocalJWKSet({ keys: [{ ...jwk, alg: "RS256" }] });
});

beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
  process.env.SESSION_SECRET = "segredo-de-teste-com-tamanho-suficiente-aqui";
  jest.resetModules();
});

const service = () => {
  let mod: typeof import("../../src/services/AuthService");
  jest.isolateModules(() => {
    mod = require("../../src/services/AuthService");
  });
  return mod!.default;
};

describe("verifyGoogleIdToken", () => {
  it("accepts a token the Google keys actually signed", async () => {
    const token = await googleToken({
      sub: "1234567890",
      name: "Fulano",
      email: "fulano@example.com",
      email_verified: true,
      picture: "https://example.com/f.png",
    });

    await expect(service().verifyGoogleIdToken(token)).resolves.toEqual({
      //o sub prefixado evita colidir com id de outro provedor que entre depois
      id: "google:1234567890",
      name: "Fulano",
      email: "fulano@example.com",
      photo_path: "https://example.com/f.png",
    });
  });

  // O buraco antigo, em uma linha: qualquer JSON em base64 virava identidade.
  it("rejects an unsigned payload, which used to be accepted", async () => {
    const forged = Buffer.from(
      JSON.stringify({ id: "google:1234567890", name: "Invasor" })
    ).toString("base64url");

    await expect(service().verifyGoogleIdToken(forged)).rejects.toThrow();
  });

  // audience amarra o token a este cliente: um id_token legitimo, emitido para
  // outro app, nao pode servir de entrada aqui.
  it("rejects a valid Google token issued for another application", async () => {
    const token = await googleToken(
      { sub: "1234567890", email_verified: true },
      { aud: "outro-app.apps.googleusercontent.com" }
    );

    await expect(service().verifyGoogleIdToken(token)).rejects.toThrow();
  });

  it("rejects a token from an issuer that is not Google", async () => {
    const token = await googleToken(
      { sub: "1234567890", email_verified: true },
      { iss: "https://accounts.evil.example" }
    );

    await expect(service().verifyGoogleIdToken(token)).rejects.toThrow();
  });

  // email_verified falso significa que o Google nao confirmou a posse do
  // endereco: aceitar deixaria entrar quem apenas afirmou te-lo.
  it("rejects an unverified email", async () => {
    const token = await googleToken({
      sub: "1234567890",
      email: "naoconfirmado@example.com",
      email_verified: false,
    });

    await expect(service().verifyGoogleIdToken(token)).rejects.toThrow(
      /verificado/
    );
  });

  it("fails when the client id is not configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    const token = await googleToken({ sub: "1", email_verified: true });

    await expect(service().verifyGoogleIdToken(token)).rejects.toThrow(
      /GOOGLE_CLIENT_ID/
    );
  });
});

describe("session", () => {
  const user = {
    id: "google:1234567890",
    name: "Fulano",
    email: "fulano@example.com",
    photo_path: "",
  };

  it("issues a session that it can verify back", async () => {
    const svc = service();
    const session = await svc.issueSession(user);

    await expect(svc.verifySession(session)).resolves.toEqual(user);
  });

  it("refuses a session signed with another secret", async () => {
    const session = await service().issueSession(user);

    process.env.SESSION_SECRET = "outro-segredo-completamente-diferente-aqui";

    await expect(service().verifySession(session)).rejects.toThrow();
  });

  // Um caractere trocado no payload invalida a assinatura: e isso que impede
  // alguem de editar o proprio cookie e virar outro usuario.
  it("refuses a tampered session", async () => {
    const svc = service();
    const session = await svc.issueSession(user);
    const [header, payload, signature] = session.split(".");

    const forged = Buffer.from(
      JSON.stringify({ ...user, sub: "google:outra-pessoa" })
    ).toString("base64url");

    await expect(
      svc.verifySession(`${header}.${forged}.${signature}`)
    ).rejects.toThrow();
    expect(payload).not.toBe(forged);
  });

  it("refuses an expired session", async () => {
    const svc = service();
    const past = Math.floor(Date.now() / 1000) - 10;

    const { SignJWT: RealSignJWT } = jest.requireActual("jose");
    const expired = await new RealSignJWT({
      sub: user.id,
      iat: past - 3600,
      exp: past,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET));

    await expect(svc.verifySession(expired)).rejects.toThrow();
  });

  it("fails when the session secret is not configured", async () => {
    delete process.env.SESSION_SECRET;

    await expect(service().issueSession(user)).rejects.toThrow(
      /SESSION_SECRET/
    );
  });
});
