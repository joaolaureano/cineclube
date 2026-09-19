import { EntityRepository, Repository } from "typeorm";

import { UserAchievement } from "../models";

@EntityRepository(UserAchievement)
export class UserAchievementRepository extends Repository<UserAchievement> {}
