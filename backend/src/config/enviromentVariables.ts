import "./dotenv";

const {
  PORT,
  DB_URL,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
  DB_SSL,
} = process.env;

const variables = {
  PORT: Number(PORT),
  //banco gerenciado (Neon) entrega uma connection string unica; quando ela
  //existe, as variaveis avulsas abaixo sao ignoradas
  DB_URL,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT: Number(DB_PORT),
  //o Postgres em container não fala TLS; bancos gerenciados (RDS, Heroku) falam
  DB_SSL: DB_SSL === "true",
};

export default variables;
