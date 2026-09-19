import { AxiosResponse } from "axios";
import api from "../api/api";
import { Platform } from "../types/platform";

const platform = {
  getMainPlatform: (): Promise<AxiosResponse<Platform[]>> => {
    return api.get("/platforms", {
      transformResponse: composePlatform,
    });
  },
};

const composePlatform = (data: string): Platform[] => {
  const response = JSON.parse(data);

  if (!response.success) {
    throw new Error("Erro");
  }

  const platformsResponse = response.body.platforms;

  const platforms: Platform[] = [];
  platformsResponse.forEach((platformDto: Platform) => {
    platforms.push({
      ...platformDto,
    });
  });
  return platforms;
};

export default platform;
