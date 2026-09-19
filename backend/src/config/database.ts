import { ConnectionOptions } from "typeorm";
import variables from "./enviromentVariables";
import { SnakeNamingStrategy } from "typeorm-snake-naming-strategy";

const {
  DB_URL,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
  DB_SSL,
} = variables;

const common = {
  type: "postgres",
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
  synchronize: false,
  entities: [`${__dirname}/../models/*.{js,ts}`],
  migrations: [`${__dirname}/../database/migrations/*.{js,ts}`],
  cli: {
    migrationsDir: "src/database/migrations",
  },
};

//Com DB_URL o destino e um banco gerenciado, que sempre fala TLS: o certificado
//do Neon encadeia numa CA publica, entao a verificacao fica ligada - desligar
//seria abrir mao da protecao contra MITM sem ganho nenhum.
const managed = {
  ...common,
  url: DB_URL,
  extra: { ssl: { rejectUnauthorized: true } },
};

const discrete = {
  ...common,
  database: DB_DATABASE,
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  //qualquer objeto ssl liga TLS no node-postgres: "require: false" não desliga
  //nada. Contra o Postgres em container isso quebra a conexão, então o bloco só
  //existe quando DB_SSL pede.
  extra: DB_SSL ? { ssl: { rejectUnauthorized: false } } : {},
};

export default (DB_URL ? managed : discrete) as ConnectionOptions;
