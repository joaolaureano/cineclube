import { ConnectionOptions } from "typeorm";
import variables from "./enviromentVariables";
import { SnakeNamingStrategy } from "typeorm-snake-naming-strategy";

const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
  DB_SSL,
} = variables;

export default {
  type: "postgres",
  namingStrategy: new SnakeNamingStrategy(),
  database: DB_DATABASE,
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  logging: false,
  synchronize: false,
  entities: [`${__dirname}/../models/*.{js,ts}`],
  migrations: [`${__dirname}/../database/migrations/*.{js,ts}`],
  cli: {
    migrationsDir: "src/database/migrations",
  },
  //qualquer objeto ssl liga TLS no node-postgres: "require: false" não desliga
  //nada. Contra o Postgres em container isso quebra a conexão, então o bloco só
  //existe quando DB_SSL pede.
  extra: DB_SSL ? { ssl: { rejectUnauthorized: false } } : {},
} as ConnectionOptions;
