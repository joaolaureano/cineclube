import AuthService from "../../src/services/AuthService";

const encode = (payload: unknown) =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

describe("AuthService", () => {
  describe("authenticateUser", () => {
    it("decodes a base64url payload into the service's user shape", async () => {
      const token = encode({
        id: "uid-1",
        name: "Jane",
        email: "jane@example.com",
        photo_path: "https://example.com/jane.png",
      });

      await expect(AuthService.authenticateUser(token)).resolves.toEqual({
        id: "uid-1",
        name: "Jane",
        email: "jane@example.com",
        photo_path: "https://example.com/jane.png",
      });
    });

    it("falls back to the id when the payload carries no name", async () => {
      await expect(
        AuthService.authenticateUser(encode({ id: "uid-2" }))
      ).resolves.toEqual({
        id: "uid-2",
        name: "uid-2",
        email: undefined,
        photo_path: "",
      });
    });

    it("treats a token that is not an encoded payload as the user id", async () => {
      await expect(AuthService.authenticateUser("plain-id")).resolves.toEqual({
        id: "plain-id",
        name: "plain-id",
        email: undefined,
        photo_path: "",
      });
    });

    it("rejects a payload that decodes but identifies nobody", async () => {
      await expect(
        AuthService.authenticateUser(encode({ name: "No Id" }))
      ).rejects.toThrow("Token does not identify a user");
    });

    it("rejects a payload that decodes to null", async () => {
      await expect(AuthService.authenticateUser(encode(null))).rejects.toThrow(
        "Token does not identify a user"
      );
    });
  });
});
