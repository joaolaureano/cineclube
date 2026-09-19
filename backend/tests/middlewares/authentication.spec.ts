import { expressAuthentication } from "../../src/middlewares/authentication";
import { UserService } from "../../src/services";
import AuthService, { SESSION_COOKIE } from "../../src/services/AuthService";

jest.mock("../../src/services");
//so o default e dublado: UnauthorizedError precisa ser a classe real, porque o
//errorhandler decide o 401 por instanceof e a mensagem vai no corpo da resposta
jest.mock("../../src/services/AuthService", () => {
  const actual = jest.requireActual("../../src/services/AuthService");
  return {
    __esModule: true,
    ...actual,
    default: { verifySession: jest.fn() },
  };
});

const mockedUserService = UserService as jest.Mocked<typeof UserService>;
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

const requestWith = (session?: string, authorization?: string) =>
  (({
    cookies: session ? { [SESSION_COOKIE]: session } : {},
    headers: authorization ? { authorization } : {},
  } as unknown) as import("express").Request);

const sessionUser = {
  id: "google:1234567890",
  name: "Ada",
  email: "ada@example.com",
  photo_path: "photo.png",
};

describe("expressAuthentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuthService.verifySession.mockResolvedValue(sessionUser);
  });

  describe('securityName "bearer"', () => {
    it("resolves the session user when they also exist in the database", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: sessionUser.id,
      } as never);

      await expect(
        expressAuthentication(requestWith("sessao-assinada"), "bearer")
      ).resolves.toEqual(sessionUser);
      expect(mockedAuthService.verifySession).toHaveBeenCalledWith(
        "sessao-assinada"
      );
    });

    // O header continua servindo para uso programatico, mas agora tem que
    // carregar uma sessao que nos assinamos.
    it("accepts a bearer header for programmatic access", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: sessionUser.id,
      } as never);

      await expect(
        expressAuthentication(
          requestWith(undefined, "Bearer sessao-assinada"),
          "bearer"
        )
      ).resolves.toEqual(sessionUser);
      expect(mockedAuthService.verifySession).toHaveBeenCalledWith(
        "sessao-assinada"
      );
    });

    it("rejects a request without any session", async () => {
      await expect(
        expressAuthentication(requestWith(), "bearer")
      ).rejects.toThrow("No session");
      expect(mockedAuthService.verifySession).not.toHaveBeenCalled();
    });

    // Assinatura invalida e sessao expirada dao a mesma resposta: distinguir
    // so ajudaria quem esta sondando.
    it("rejects a session that does not verify", async () => {
      mockedAuthService.verifySession.mockRejectedValue(new Error("bad"));

      await expect(
        expressAuthentication(requestWith("forjada"), "bearer")
      ).rejects.toThrow("Invalid session");
    });

    it("rejects a valid session whose user no longer exists", async () => {
      mockedUserService.findUserById.mockResolvedValue(undefined as never);

      await expect(
        expressAuthentication(requestWith("sessao-assinada"), "bearer")
      ).rejects.toThrow("User does not exist in database.");
    });
  });

  //resolver undefined faria o tsoa tratar a requisição como autenticada
  it("rejects an unknown security definition", async () => {
    await expect(
      expressAuthentication(requestWith("sessao"), "bearerLogin")
    ).rejects.toThrow(/Unknown security definition/);
  });
});
