import "./dotenv";

const {
  PORT,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
  DB_SSL,
} = process.env;

const variables = {
  PORT: Number(PORT),
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT: Number(DB_PORT),
  //o Postgres em container não fala TLS; bancos gerenciados (RDS, Heroku) falam
  DB_SSL: DB_SSL === "true",
};

export default variables;
