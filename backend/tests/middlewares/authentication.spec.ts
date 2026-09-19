import express from "express";

import { expressAuthentication } from "../../src/middlewares/authentication";
import { SESSION_COOKIE } from "../../src/services/AuthService";

const mockedUserService = { findUserById: jest.fn() };
const mockedAuthService = { verifySession: jest.fn() };

jest.mock("../../src/services", () => ({
  UserService: { findUserById: (...a: unknown[]) => mockedUserService.findUserById(...a) },
}));
jest.mock("../../src/services/AuthService", () => ({
  __esModule: true,
  SESSION_COOKIE: "cineclube_session",
  //a classe e real de proposito: o errorhandler decide o 401 por instanceof,
  //e um dublê quebraria essa checagem sem o teste perceber
  UnauthorizedError: jest.requireActual("../../src/services/AuthService")
    .UnauthorizedError,
  default: { verifySession: (...a: unknown[]) => mockedAuthService.verifySession(...a) },
}));

const requestWith = (
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {}
) => (({ cookies, headers } as unknown) as express.Request);

const sessionUser = {
  id: "google:1234567890",
  name: "Fulano",
  email: "fulano@example.com",
  photo_path: "",
};

describe("expressAuthentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuthService.verifySession.mockResolvedValue(sessionUser);
    mockedUserService.findUserById.mockResolvedValue({ id: sessionUser.id });
  });

  it("authenticates from the session cookie", async () => {
    const request = requestWith({ [SESSION_COOKIE]: "token-assinado" });

    await expect(expressAuthentication(request, "bearer")).resolves.toEqual(
      sessionUser
    );
    expect(mockedAuthService.verifySession).toHaveBeenCalledWith(
      "token-assinado"
    );
  });

  // O header continua servindo para uso programatico, mas agora tem que
  // carregar uma sessao que nos assinamos.
  it("accepts a bearer header for programmatic access", async () => {
    const request = requestWith({}, { authorization: "Bearer token-assinado" });

    await expect(expressAuthentication(request, "bearer")).resolves.toEqual(
      sessionUser
    );
    expect(mockedAuthService.verifySession).toHaveBeenCalledWith(
      "token-assinado"
    );
  });

  it("rejects a request without any session", async () => {
    await expect(expressAuthentication(requestWith(), "bearer")).rejects.toThrow(
      "No session"
    );
    expect(mockedAuthService.verifySession).not.toHaveBeenCalled();
  });

  // Assinatura invalida e sessao expirada dao a mesma resposta: distinguir so
  // ajudaria quem esta sondando.
  it("rejects a session that does not verify", async () => {
    mockedAuthService.verifySession.mockRejectedValue(new Error("bad"));

    await expect(
      expressAuthentication(requestWith({ [SESSION_COOKIE]: "forjado" }), "bearer")
    ).rejects.toThrow("Invalid session");
  });

  it("rejects a valid session whose user no longer exists", async () => {
    mockedUserService.findUserById.mockResolvedValue(undefined);

    await expect(
      expressAuthentication(requestWith({ [SESSION_COOKIE]: "ok" }), "bearer")
    ).rejects.toThrow("User does not exist in database.");
  });

  // Resolver undefined faria o tsoa tratar a requisicao como autenticada.
  it("rejects an unknown security definition", async () => {
    await expect(
      expressAuthentication(requestWith(), "bearerLogin")
    ).rejects.toThrow(/Unknown security definition/);
  });
});
