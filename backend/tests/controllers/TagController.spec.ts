import { TagController } from "../../src/controllers/TagController";
import TagService from "../../src/services/TagService";

jest.mock("../../src/services/TagService");

const mockedTagService = TagService as jest.Mocked<typeof TagService>;

describe("TagController", () => {
  describe("getMainTags", () => {
    it("returns the tag list with 200", async () => {
      const tags = [{ id: 1, name: "Action" }];
      mockedTagService.getMainTags.mockResolvedValue(tags as any);

      const controller = new TagController();
      const result = await controller.getMainTags();

      expect(result).toEqual({
        success: true,
        message: "Found 1 tags.",
        body: { tags },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("throws when the service resolves falsy, landing in the catch/500 branch", async () => {
      mockedTagService.getMainTags.mockResolvedValue(undefined as any);

      const controller = new TagController();
      const result = await controller.getMainTags();

      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedTagService.getMainTags.mockRejectedValue(new Error("db down"));

      const controller = new TagController();
      const result = await controller.getMainTags();

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});
