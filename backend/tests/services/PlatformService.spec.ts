import PlatformService from "../../src/services/PlatformService";
import { getMockRepository, resetRepositories } from "../helpers/typeormMock";

describe("PlatformService", () => {
  beforeEach(() => resetRepositories());

  describe("getPlatforms", () => {
    it("returns every platform from the repository", async () => {
      const platforms = [{ id: 1, name: "Netflix" }];
      getMockRepository("PlatformRepository").find.mockResolvedValue(platforms);

      await expect(PlatformService.getPlatforms()).resolves.toBe(platforms);
    });

    it("propagates repository failures", async () => {
      getMockRepository("PlatformRepository").find.mockRejectedValue(
        new Error("db down")
      );

      await expect(PlatformService.getPlatforms()).rejects.toThrow("db down");
    });
  });
});
