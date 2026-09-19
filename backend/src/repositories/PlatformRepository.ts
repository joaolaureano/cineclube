import { EntityRepository, Repository } from "typeorm";

import { Platform } from "../models";

@EntityRepository(Platform)
export class PlatformRepository extends Repository<Platform> {}
