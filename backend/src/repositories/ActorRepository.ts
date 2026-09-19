import { EntityRepository, Repository } from "typeorm";

import { Actor } from "../models";

@EntityRepository(Actor)
export class ActorRepository extends Repository<Actor> {}
