import { expressAuthentication } from "../../src/middlewares/authentication";
import { UserService } from "../../src/services";
import AuthService from "../../src/services/AuthService";

jest.mock("../../src/services");
jest.mock("../../src/services/AuthService");

const mockedUserService = UserService as jest.Mocked<typeof UserService>;
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

const requestWith = (authorization?: string) =>
  (({
    headers: authorization ? { authorization } : {},
  } as unknown) as import("express").Request);

const tokenUser = {
  id: "user-1",
  name: "Ada",
  email: "ada@example.com",
  photo_path: "photo.png",
};

describe("expressAuthentication", () => {
  beforeEach(() => {
    mockedAuthService.authenticateUser.mockResolvedValue(tokenUser);
  });

  describe('securityName "bearer"', () => {
    it("resolves the token user when they also exist in the database", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: "user-1",
      } as never);

      await expect(
        expressAuthentication(requestWith("token"), "bearer")
      ).resolves.toEqual(tokenUser);
      expect(mockedUserService.findUserById).toHaveBeenCalledWith("user-1");
    });

    it("rejects a valid token whose user was never registered", async () => {
      mockedUserService.findUserById.mockResolvedValue(undefined as never);

      await expect(
        expressAuthentication(requestWith("token"), "bearer")
      ).rejects.toThrow("User does not exist in database.");
    });

    it("rejects when no authorization header is present", async () => {
      await expect(
        expressAuthentication(requestWith(), "bearer")
      ).rejects.toThrow("No token provided");
      expect(mockedAuthService.authenticateUser).not.toHaveBeenCalled();
    });

    it("strips the Bearer prefix before verifying the token", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: "user-1",
      } as never);

      await expect(
        expressAuthentication(requestWith("Bearer abc123"), "bearer")
      ).resolves.toEqual(tokenUser);
      expect(mockedAuthService.authenticateUser).toHaveBeenCalledWith("abc123");
    });

    it("passes a bare token through unchanged", async () => {
      mockedUserService.findUserById.mockResolvedValue({
        id: "user-1",
      } as never);

      await expressAuthentication(requestWith("abc123"), "bearer");

      expect(mockedAuthService.authenticateUser).toHaveBeenCalledWith("abc123");
    });
  });

  describe('securityName "bearerLogin"', () => {
    it("resolves the token user without checking the database", async () => {
      await expect(
        expressAuthentication(requestWith("token"), "bearerLogin")
      ).resolves.toEqual(tokenUser);
      expect(mockedUserService.findUserById).not.toHaveBeenCalled();
    });

    it("rejects when no authorization header is present", async () => {
      await expect(
        expressAuthentication(requestWith(), "bearerLogin")
      ).rejects.toThrow("No token provided");
    });
  });

  it("rejects an unrecognised securityName instead of resolving undefined", async () => {
    // Resolving undefined here would read to tsoa as "authenticated, no user data".
    await expect(
      expressAuthentication(requestWith("token"), "somethingElse")
    ).rejects.toThrow("Unknown security definition: somethingElse");
  });
});
