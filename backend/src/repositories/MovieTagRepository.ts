import { EntityRepository, Repository } from "typeorm";

import { MovieTag } from "../models";

@EntityRepository(MovieTag)
export class MovieTagRepository extends Repository<MovieTag> {}
