import { EntityRepository, Repository } from "typeorm";

import { Achievement } from "../models";

@EntityRepository(Achievement)
export class AchievementRepository extends Repository<Achievement> {}
