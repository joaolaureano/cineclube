import { getCustomRepository } from "typeorm";
import { Achievement } from "../models";
import { AchievementRepository } from "../repositories";

const getAll = async (): Promise<Achievement[]> => {
  const achievementRepository = getCustomRepository(AchievementRepository);

  const achievements = await achievementRepository.find({
    relations: ["tag"],
  });

  return achievements;
};

const getUserAchievements = async (user_id: string): Promise<Achievement[]> => {
  const achievementRepository = getCustomRepository(AchievementRepository);

  const achievements = await achievementRepository
    .createQueryBuilder("achievement")
    .innerJoin(
      "achievement.users",
      "users",
      `"users"."user_id" = :user_id AND "users"."current_score" >= "achievement"."target_score"`,
      { user_id }
    )
    .getMany();

  return achievements;
};

export default {
  getAll,
  getUserAchievements,
};
