import AchievementService from "../../src/services/AchievementService";
import { getMockRepository, resetRepositories } from "../helpers/typeormMock";

describe("AchievementService", () => {
  beforeEach(() => resetRepositories());

  describe("getAll", () => {
    it("returns every achievement with its tag relation loaded", async () => {
      const repository = getMockRepository("AchievementRepository");
      const achievements = [{ id: 1, title: "First movie", tag: { id: 2 } }];
      repository.find.mockResolvedValue(achievements);

      await expect(AchievementService.getAll()).resolves.toBe(achievements);
      expect(repository.find).toHaveBeenCalledWith({ relations: ["tag"] });
    });
  });

  describe("getUserAchievements", () => {
    it("queries achievements the user has already reached the target score for", async () => {
      const repository = getMockRepository("AchievementRepository");
      const achievements = [{ id: 5, title: "Cinephile" }];
      repository.queryBuilder.getMany.mockResolvedValueOnce(achievements);

      await expect(
        AchievementService.getUserAchievements("user-1")
      ).resolves.toBe(achievements);

      expect(
        repository.queryBuilder.innerJoin
      ).toHaveBeenCalledWith(
        "achievement.users",
        "users",
        `"users"."user_id" = :user_id AND "users"."current_score" >= "achievement"."target_score"`,
        { user_id: "user-1" }
      );
    });
  });
});
