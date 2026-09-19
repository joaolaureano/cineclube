import { EntityRepository, Repository } from "typeorm";

import { UserTag } from "../models";

@EntityRepository(UserTag)
export class UserTagRepository extends Repository<UserTag> {}
