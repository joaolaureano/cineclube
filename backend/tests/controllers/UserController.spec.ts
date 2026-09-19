import express from "express";
import { UserController } from "../../src/controllers/UserController";
import UserService from "../../src/services/UserService";
import { MovieUserStatus } from "../../src/enum/MovieUserStatus";

jest.mock("../../src/services/UserService");

const mockedAuth = {
  verifyGoogleIdToken: jest.fn(),
  issueSession: jest.fn(),
};
jest.mock("../../src/services/AuthService", () => ({
  __esModule: true,
  SESSION_COOKIE: "cineclube_session",
  default: {
    verifyGoogleIdToken: (...a: unknown[]) => mockedAuth.verifyGoogleIdToken(...a),
    issueSession: (...a: unknown[]) => mockedAuth.issueSession(...a),
    SESSION_TTL_SECONDS: 28800,
  },
}));

const mockedUserService = UserService as jest.Mocked<typeof UserService>;

const buildRequest = (user?: {
  id: string;
  name?: string;
  email?: string;
  photo_path?: string;
}) => (({ user } as unknown) as express.Request);

const appended: string[] = [];
const authRequest = () =>
  (({
    res: { append: (_: string, value: string) => appended.push(value) },
  } as unknown) as express.Request);

const googleUser = {
  id: "google:1234567890",
  name: "Joao",
  email: "joao@example.com",
  photo_path: "path.png",
};

describe("UserController", () => {
  describe("authenticate", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      appended.length = 0;
      mockedAuth.verifyGoogleIdToken.mockResolvedValue(googleUser);
      mockedAuth.issueSession.mockResolvedValue("sessao-assinada");
    });

    it("returns 400 when no credential is sent", async () => {
      const controller = new UserController();
      const result = await controller.authenticate(
        { credential: "" },
        authRequest()
      );

      expect(result).toEqual({
        success: false,
        message: "Credential is required",
      });
      expect(controller.getStatus()).toBe(400);
    });

    // Credencial que nao vem do Google nao cria sessao nenhuma - e o ponto do
    // desenho: quem entra e quem o Google confirma, nao quem afirma ser.
    it("returns 401 when the google credential does not verify", async () => {
      mockedAuth.verifyGoogleIdToken.mockRejectedValue(new Error("assinatura invalida"));

      const controller = new UserController();
      const result = await controller.authenticate(
        { credential: "forjado" },
        authRequest()
      );

      expect(controller.getStatus()).toBe(401);
      expect(result.success).toBe(false);
      expect(mockedAuth.issueSession).not.toHaveBeenCalled();
      expect(appended).toHaveLength(0);
    });

    it("returns 200 and sets the session cookie when the user already exists", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: googleUser.id,
        name: "Joao",
        photo_path: "path.png",
        randomness: 42,
      } as any);

      const controller = new UserController();
      const result = await controller.authenticate(
        { credential: "id-token-do-google" },
        authRequest()
      );

      expect(result).toMatchObject({
        success: true,
        message: "User already exists.",
      });
      //o ramo de usuario existente nao devolve firstLogin; o cliente le
      //!!undefined, que e false
      expect(result.firstLogin).toBeUndefined();
      expect(controller.getStatus()).toBe(200);
      expect(mockedUserService.createUser).not.toHaveBeenCalled();
    });

    it("creates the user and reports firstLogin on the first visit", async () => {
      mockedUserService.findUserById.mockResolvedValue(undefined);
      mockedUserService.createUser.mockResolvedValue({
        id: googleUser.id,
        name: "Joao",
        photo_path: "path.png",
        randomness: 0,
      } as any);

      const controller = new UserController();
      const result = await controller.authenticate(
        { credential: "id-token-do-google" },
        authRequest()
      );

      expect(mockedUserService.createUser).toHaveBeenCalledWith(googleUser);
      expect(result).toMatchObject({ firstLogin: true, success: true });
      expect(controller.getStatus()).toBe(200);
    });

    // httpOnly e o que impede um XSS de ler a sessao; Secure e SameSite sao o
    // que impedem que ela viaje em texto claro ou num POST de outro site.
    it("sets the cookie httpOnly, Secure and SameSite", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: googleUser.id,
        randomness: 1,
      } as any);

      await new UserController().authenticate(
        { credential: "id-token-do-google" },
        authRequest()
      );

      expect(appended).toHaveLength(1);
      const cookie = appended[0];
      expect(cookie).toContain("cineclube_session=sessao-assinada");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("Secure");
      expect(cookie).toContain("SameSite=Lax");
    });

    it("returns a 500 that does not leak the server's filesystem path", async () => {
      mockedUserService.findUserById.mockRejectedValue(new Error("db down"));

      const controller = new UserController();
      const result = await controller.authenticate(
        { credential: "id-token-do-google" },
        authRequest()
      );

      expect(controller.getStatus()).toBe(500);
      expect(result.success).toBe(false);
      expect(result.details).toBe("db down");
      // The message used to carry __dirname appended to it, exposing an absolute
      // server path to any client that triggered an error.
      expect(result.message).toBe("Internal server error.");
    });
  });

  describe("logout", () => {
    // Limpar so o estado do cliente deixaria a sessao valida para quem ainda
    // tivesse o valor do cookie; Max-Age=0 e o que a apaga de fato.
    it("expires the session cookie", async () => {
      appended.length = 0;
      const result = await new UserController().logout(authRequest());

      expect(result.success).toBe(true);
      expect(appended[0]).toContain("Max-Age=0");
      expect(appended[0]).toContain("HttpOnly");
    });
  });

  describe("setUserMovieStatus", () => {
    it("rejects with 400 when both movie_id and status are missing", async () => {
      const controller = new UserController();

      await expect(
        controller.setUserMovieStatus(
          { movie_id: "", status: undefined as any },
          buildRequest({ id: "u1" })
        )
      ).rejects.toThrow("Não foi possivel associar esse filme e usuário");
      expect(controller.getStatus()).toBe(400);
    });

    it("rejects with 400 when only movie_id is missing", async () => {
      // The guard used to be `!(movie_id || status)`, which rejected only when BOTH
      // were falsy, letting a half-filled request reach the service with an
      // undefined movie_id.
      const controller = new UserController();

      await expect(
        controller.setUserMovieStatus(
          { movie_id: undefined as any, status: MovieUserStatus.NONE },
          buildRequest({ id: "u1" })
        )
      ).rejects.toThrow("Não foi possivel associar esse filme e usuário");
      expect(controller.getStatus()).toBe(400);
      expect(mockedUserService.deleteUserMovie).not.toHaveBeenCalled();
    });

    it("rejects with 400 when only status is missing", async () => {
      const controller = new UserController();

      await expect(
        controller.setUserMovieStatus(
          { movie_id: "10", status: undefined as any },
          buildRequest({ id: "u1" })
        )
      ).rejects.toThrow("Não foi possivel associar esse filme e usuário");
      expect(controller.getStatus()).toBe(400);
    });

    it("WATCHED_AND_LIKED with achievements returned includes them in the body", async () => {
      const achievements = [{ id: 1 }] as any;
      mockedUserService.setMovieStatusWatchedLiked.mockResolvedValue(
        achievements
      );

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.WATCHED_AND_LIKED },
        buildRequest({ id: "u1" })
      );

      expect(mockedUserService.setMovieStatusWatchedLiked).toHaveBeenCalledWith(
        "m1",
        "u1",
        MovieUserStatus.WATCHED_AND_LIKED
      );
      expect(result).toEqual({
        message: "User and movie associated",
        success: true,
        body: { achievements },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("WATCHED_AND_LIKED without achievements omits the body", async () => {
      mockedUserService.setMovieStatusWatchedLiked.mockResolvedValue(undefined);

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.WATCHED_AND_LIKED },
        buildRequest({ id: "u1" })
      );

      expect(result).toEqual({
        message: "User and movie associated",
        success: true,
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("WATCHED_AND_DISLIKED with achievements returned includes them in the body", async () => {
      const achievements = [{ id: 2 }] as any;
      mockedUserService.setMovieStatusWatchedDisliked.mockResolvedValue(
        achievements
      );

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.WATCHED_AND_DISLIKED },
        buildRequest({ id: "u1" })
      );

      expect(
        mockedUserService.setMovieStatusWatchedDisliked
      ).toHaveBeenCalledWith("m1", "u1", MovieUserStatus.WATCHED_AND_DISLIKED);
      expect(result).toEqual({
        message: "User and movie associated",
        success: true,
        body: { achievements },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("WATCHED_AND_DISLIKED without achievements omits the body", async () => {
      mockedUserService.setMovieStatusWatchedDisliked.mockResolvedValue(
        undefined
      );

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.WATCHED_AND_DISLIKED },
        buildRequest({ id: "u1" })
      );

      expect(result).toEqual({
        message: "User and movie associated",
        success: true,
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("DONT_WANT_TO_WATCH associates the movie", async () => {
      mockedUserService.setMovieStatusDontWantWatch.mockResolvedValue(
        undefined as any
      );

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.DONT_WANT_TO_WATCH },
        buildRequest({ id: "u1" })
      );

      expect(
        mockedUserService.setMovieStatusDontWantWatch
      ).toHaveBeenCalledWith("m1", "u1", MovieUserStatus.DONT_WANT_TO_WATCH);
      expect(result).toEqual({
        message: "User and movie associated",
        success: true,
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("NONE resets the status", async () => {
      mockedUserService.deleteUserMovie.mockResolvedValue(undefined as any);

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.NONE },
        buildRequest({ id: "u1" })
      );

      expect(mockedUserService.deleteUserMovie).toHaveBeenCalledWith(
        "m1",
        "u1"
      );
      expect(result).toEqual({
        message: "Status reset successfully",
        success: true,
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("WANT_TO_WATCH associates the movie", async () => {
      mockedUserService.setMovieStatusWantToWatch.mockResolvedValue(
        undefined as any
      );

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.WANT_TO_WATCH },
        buildRequest({ id: "u1" })
      );

      expect(mockedUserService.setMovieStatusWantToWatch).toHaveBeenCalledWith(
        "m1",
        "u1",
        MovieUserStatus.WANT_TO_WATCH
      );
      expect(result).toEqual({
        message: "User and movie associated",
        success: true,
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("falls into the default branch for an unhandled status (e.g. ALREADY_WATCHED)", async () => {
      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.ALREADY_WATCHED },
        buildRequest({ id: "u1" })
      );

      expect(result).toEqual({
        message: "Status does not exists",
        success: false,
      });
      // No branch of the switch calls setStatus for the default case, so it stays unset.
      expect(controller.getStatus()).toBeUndefined();
    });

    it("throws and returns 500 when there is no user on the request", async () => {
      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.NONE },
        buildRequest(undefined)
      );

      expect(mockedUserService.deleteUserMovie).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedUserService.setMovieStatusWantToWatch.mockRejectedValue(
        new Error("db down")
      );

      const controller = new UserController();
      const result = await controller.setUserMovieStatus(
        { movie_id: "m1", status: MovieUserStatus.WANT_TO_WATCH },
        buildRequest({ id: "u1" })
      );

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });

  describe("getUserMoviesByStatus", () => {
    it("returns 400 when status is missing", async () => {
      const controller = new UserController();
      const result = await controller.getUserMoviesByStatus(
        buildRequest({ id: "u1" }),
        ""
      );

      expect(result).toEqual({
        success: false,
        message: "Status is required.",
      });
      expect(controller.getStatus()).toBe(400);
    });

    it("returns the user's movies with 200", async () => {
      const userMovies = [{ id: 1 }] as any;
      mockedUserService.getUserMoviesByStatus.mockResolvedValue(userMovies);

      const controller = new UserController();
      const result = await controller.getUserMoviesByStatus(
        buildRequest({ id: "u1" }),
        "want_to_watch"
      );

      expect(mockedUserService.getUserMoviesByStatus).toHaveBeenCalledWith(
        "want_to_watch",
        "u1"
      );
      expect(result).toEqual({
        success: true,
        message: "Found 1 movies.",
        body: { userMovies },
      });
    });

    it("throws and returns 500 when there is no user on the request", async () => {
      const controller = new UserController();
      const result = await controller.getUserMoviesByStatus(
        buildRequest(undefined),
        "want_to_watch"
      );

      expect(mockedUserService.getUserMoviesByStatus).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedUserService.getUserMoviesByStatus.mockRejectedValue(
        new Error("db down")
      );

      const controller = new UserController();
      const result = await controller.getUserMoviesByStatus(
        buildRequest({ id: "u1" }),
        "want_to_watch"
      );

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });

  describe("setUserPreferences", () => {
    it("rejects (uncaught throw) when tag_ids is missing", async () => {
      const controller = new UserController();

      await expect(
        controller.setUserPreferences(
          { tag_ids: undefined as any },
          buildRequest({ id: "u1" })
        )
      ).rejects.toThrow("Could not find tags");
      expect(controller.getStatus()).toBe(400);
    });

    it("bug: an empty tag_ids array passes the falsy guard ([] is truthy)", async () => {
      mockedUserService.setSignUpPreferences.mockResolvedValue(true as any);

      const controller = new UserController();
      const result = await controller.setUserPreferences(
        { tag_ids: [] },
        buildRequest({ id: "u1" })
      );

      expect(mockedUserService.setSignUpPreferences).toHaveBeenCalledWith(
        "u1",
        []
      );
      expect(result).toEqual({
        message: "Preferences were set",
        success: true,
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("throws and returns 500 when there is no user on the request", async () => {
      const controller = new UserController();
      const result = await controller.setUserPreferences(
        { tag_ids: [1, 2] },
        buildRequest(undefined)
      );

      expect(mockedUserService.setSignUpPreferences).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("throws and returns 500 when the service resolves falsy", async () => {
      mockedUserService.setSignUpPreferences.mockResolvedValue(
        undefined as any
      );

      const controller = new UserController();
      const result = await controller.setUserPreferences(
        { tag_ids: [1, 2] },
        buildRequest({ id: "u1" })
      );

      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedUserService.setSignUpPreferences.mockRejectedValue(
        new Error("db down")
      );

      const controller = new UserController();
      const result = await controller.setUserPreferences(
        { tag_ids: [1, 2] },
        buildRequest({ id: "u1" })
      );

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});
