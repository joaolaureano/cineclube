import TagService from "../../src/services/TagService";
import { getMockRepository, resetRepositories } from "../helpers/typeormMock";

// Mirrors the private `mainTags` constant in src/services/TagService.ts.
const MAIN_TAGS = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Documentary",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

describe("TagService", () => {
  beforeEach(() => resetRepositories());

  describe("getMainTags", () => {
    it("queries the tag repository for the fixed list of main tags", async () => {
      const repository = getMockRepository("TagRepository");
      const tags = [{ id: 1, name: "Action" }];
      repository.queryBuilder.getMany.mockResolvedValueOnce(tags);

      await expect(TagService.getMainTags()).resolves.toBe(tags);

      expect(
        repository.queryBuilder.where
      ).toHaveBeenCalledWith(`"tag"."name" IN (:...tags)`, { tags: MAIN_TAGS });
    });
  });
});
