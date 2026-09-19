import { PlatformController } from "../../src/controllers/PlatformController";
import PlatformService from "../../src/services/PlatformService";

jest.mock("../../src/services/PlatformService");

const mockedPlatformService = PlatformService as jest.Mocked<
  typeof PlatformService
>;

describe("PlatformController", () => {
  describe("getPlatforms", () => {
    it("returns the platform list with 200", async () => {
      const platforms = [{ id: 1, name: "Netflix" }];
      mockedPlatformService.getPlatforms.mockResolvedValue(platforms as any);

      const controller = new PlatformController();
      const result = await controller.getPlatforms();

      expect(result).toEqual({
        success: true,
        message: "Found 1 platforms.",
        body: { platforms },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("throws when the service resolves falsy, landing in the catch/500 branch", async () => {
      mockedPlatformService.getPlatforms.mockResolvedValue(undefined as any);

      const controller = new PlatformController();
      const result = await controller.getPlatforms();

      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedPlatformService.getPlatforms.mockRejectedValue(
        new Error("db down")
      );

      const controller = new PlatformController();
      const result = await controller.getPlatforms();

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});
