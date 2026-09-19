import { getCustomRepository } from "typeorm";
import { Platform } from "../models";
import { PlatformRepository } from "../repositories";

const getPlatforms = async (): Promise<Platform[]> => {
  const platformRepository = getCustomRepository(PlatformRepository);

  const platforms = await platformRepository.find();

  return platforms;
};

export default {
  getPlatforms,
};
