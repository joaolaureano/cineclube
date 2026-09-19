import { AxiosResponse } from "axios";
import api from "../api/api";
import { Achievement } from "../types/achievement";

const achievement = {
  getUserAchievements: (): Promise<AxiosResponse<Achievement[]>> => {
    return api.get("/achievements/user", {
      transformResponse: composeAchievements,
    });
  },
};

const composeAchievements = (data: string): Achievement[] => {
  const response = JSON.parse(data);

  if (!response.success) {
    throw new Error("Erro");
  }

  const achievementsResponse = response.body.achievements;

  const achievements: Achievement[] = [];
  achievementsResponse.forEach((achievementsDto: Achievement) => {
    achievements.push({
      ...achievementsDto,
    });
  });
  return achievements;
};

export default achievement;
