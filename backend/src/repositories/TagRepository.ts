import { EntityRepository, Repository } from "typeorm";

import { Tag } from "../models";

@EntityRepository(Tag)
export class TagRepository extends Repository<Tag> {}
