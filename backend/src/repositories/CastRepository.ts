import { EntityRepository, Repository } from "typeorm";

import { Cast } from "../models";

@EntityRepository(Cast)
export class CastRepository extends Repository<Cast> {}
