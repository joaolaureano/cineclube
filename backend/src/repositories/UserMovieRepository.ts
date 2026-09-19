import { EntityRepository, Repository } from "typeorm";

import { UserMovie } from "../models";

@EntityRepository(UserMovie)
export class UserMovieRepository extends Repository<UserMovie> {}
