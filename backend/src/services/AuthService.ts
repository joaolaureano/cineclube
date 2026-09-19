import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";

import variables from "../config/enviromentVariables";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email?: string;
  photo_path?: string;
}

export const SESSION_COOKIE = "cineclube_session";

/**
 * Falha de autenticacao nao e erro do servidor. Sem um tipo proprio o
 * errorhandler nao consegue distinguir "voce nao esta logado" de "o banco
 * caiu", e os dois virariam 500 - o que esconde a causa de quem chama e faz o
 * cliente tratar sessao expirada como indisponibilidade.
 */
export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

//8 horas: longo o bastante para nao deslogar no meio do uso, curto o bastante
//para um cookie vazado nao valer para sempre. Nao ha refresh - quando expira, o
//usuario passa pelo Google de novo, que e barato porque ele ja esta logado la.
const SESSION_TTL_SECONDS = 8 * 60 * 60;

// O Google publica as chaves publicas dele aqui e as rotaciona sozinho; o jose
// cacheia o resultado no processo, entao um container morno nao refaz a busca a
// cada requisicao.
const googleKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

/**
 * Valida o id_token que o Google Identity Services entrega ao navegador.
 *
 * A verificacao e o ponto todo: sem ela qualquer um monta um JSON e escolhe
 * quem quer ser, que era exatamente o que acontecia antes. Aqui a assinatura e
 * conferida contra as chaves publicas do Google, e `audience` amarra o token a
 * este cliente - um id_token legitimo, emitido para outra aplicacao, nao serve.
 */
const verifyGoogleIdToken = async (
  idToken: string
): Promise<AuthenticatedUser> => {
  const { GOOGLE_CLIENT_ID } = variables;
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID nao configurado");
  }

  const { payload } = await jwtVerify(idToken, googleKeys, {
    issuer: GOOGLE_ISSUERS,
    audience: GOOGLE_CLIENT_ID,
  });

  if (!payload.sub) throw new Error("id_token sem sub");

  //email_verified falso significa que o Google nao confirmou a posse do
  //endereco; aceitar seria deixar entrar quem so afirmou te-lo
  if (payload.email && payload.email_verified === false) {
    throw new Error("e-mail nao verificado pelo Google");
  }

  return {
    //o sub do Google e estavel e unico; o e-mail nao e, porque muda de dono
    id: `google:${payload.sub}`,
    name: (payload.name as string) ?? (payload.email as string) ?? "Usuário",
    email: payload.email as string | undefined,
    //app_user.photo_path é NOT NULL: um provedor que não devolva foto
    //quebraria o INSERT, como aconteceu na validação do primeiro deploy
    photo_path: (payload.picture as string) ?? "",
  };
};

const sessionKey = (): Uint8Array => {
  const { SESSION_SECRET } = variables;
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET nao configurado");
  return new TextEncoder().encode(SESSION_SECRET);
};

/**
 * Emite a sessao da aplicacao. E deliberadamente separada do token do Google:
 * o id_token e prova de identidade de uso unico, e ficar reapresentando-o a
 * cada requisicao amarraria o app ao ciclo de vida dele.
 */
const issueSession = async (user: AuthenticatedUser): Promise<string> => {
  //jose 6 nao tem mais os setters de claim: sub, iat e exp vao no payload
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    photo_path: user.photo_path,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(sessionKey());
};

const verifySession = async (token: string): Promise<AuthenticatedUser> => {
  const { payload } = await jwtVerify(token, sessionKey(), {
    algorithms: ["HS256"],
  });

  if (!payload.sub) throw new Error("sessao sem sub");

  return {
    id: payload.sub,
    name: (payload.name as string) ?? payload.sub,
    email: payload.email as string | undefined,
    photo_path: (payload.photo_path as string) ?? "",
  };
};

export default {
  verifyGoogleIdToken,
  issueSession,
  verifySession,
  SESSION_TTL_SECONDS,
};
