import databaseOptions from "../../src/config/database";
import variables from "../../src/config/enviromentVariables";

const loadOptions = (dbSsl?: string, dbUrl?: string) => {
  const original = process.env;
  process.env = { ...original };
  if (dbSsl === undefined) delete process.env.DB_SSL;
  else process.env.DB_SSL = dbSsl;
  if (dbUrl === undefined) delete process.env.DB_URL;
  else process.env.DB_URL = dbUrl;

  let options: typeof import("../../src/config/database").default;
  jest.isolateModules(() => {
    options = require("../../src/config/database").default;
  });
  process.env = original;
  return options! as {
    url?: string;
    host?: string;
    extra: { ssl?: { rejectUnauthorized: boolean } };
  };
};

describe("database options", () => {
  it("describes a postgres connection built from the environment", () => {
    expect(databaseOptions).toMatchObject({
      type: "postgres",
      database: variables.DB_DATABASE,
      host: variables.DB_HOST,
      port: Number(variables.DB_PORT),
      username: variables.DB_USERNAME,
      password: variables.DB_PASSWORD,
      logging: false,
      synchronize: false,
    });
  });

  it("keeps schema changes under explicit migration control", () => {
    const options = databaseOptions as typeof databaseOptions & {
      entities: string[];
      migrations: string[];
      cli: { migrationsDir: string };
    };

    expect(options.synchronize).toBe(false);
    expect(options.entities[0]).toMatch(/models/);
    expect(options.migrations[0]).toMatch(/database\/migrations/);
    expect(options.cli.migrationsDir).toBe("src/database/migrations");
  });

  // O objeto ssl nao pode existir por padrao: o node-postgres liga TLS so de ve-lo,
  // e o Postgres em container nao fala TLS. Foi exatamente isso que derrubou o
  // primeiro deploy, com "The server does not support SSL connections".
  it("omits the ssl block unless DB_SSL asks for it", () => {
    expect(loadOptions(undefined).extra).toEqual({});
    expect(loadOptions("false").extra).toEqual({});
  });

  it("enables ssl when DB_SSL is set, for managed databases", () => {
    expect(loadOptions("true").extra).toEqual({
      ssl: { rejectUnauthorized: false },
    });
  });

  // Com DB_URL o banco e gerenciado: a string manda, e as variaveis avulsas
  // deixam de valer para nao produzirem uma conexao pela metade.
  describe("with a managed connection string", () => {
    const url = "postgresql://u:p@ep-x.aws.neon.tech/neondb?sslmode=require";

    it("connects by url instead of the discrete settings", () => {
      const options = loadOptions(undefined, url);

      expect(options.url).toBe(url);
      expect(options.host).toBeUndefined();
    });

    // Neon encadeia num CA publico, entao verificar o certificado funciona - e
    // nao verificar seria aceitar qualquer servidor no meio do caminho.
    it("requires a verified tls certificate", () => {
      expect(loadOptions(undefined, url).extra).toEqual({
        ssl: { rejectUnauthorized: true },
      });
    });
  });
});
