const loadVariables = () => {
  let variables: typeof import("../../src/config/enviromentVariables").default;
  jest.isolateModules(() => {
    variables = require("../../src/config/enviromentVariables").default;
  });
  return variables!;
};

describe("enviromentVariables", () => {
  const original = process.env;

  afterEach(() => {
    process.env = original;
  });

  it("reads the database settings from the environment and coerces the ports", () => {
    process.env = {
      ...original,
      PORT: "8080",
      DB_HOST: "db.internal",
      DB_USERNAME: "cine",
      DB_PASSWORD: "secret",
      DB_DATABASE: "cine_clube",
      DB_PORT: "5432",
      DB_SSL: "true",
    };
    delete process.env.DB_URL;

    expect(loadVariables()).toEqual({
      PORT: 8080,
      DB_URL: undefined,
      DB_HOST: "db.internal",
      DB_USERNAME: "cine",
      DB_PASSWORD: "secret",
      DB_DATABASE: "cine_clube",
      DB_PORT: 5432,
      DB_SSL: true,
    });
  });

  // Só a string "true" liga TLS. Qualquer outra coisa - inclusive DB_SSL ausente,
  // que é o caso do Postgres em container - tem que resultar em false, senão o
  // driver tenta TLS contra um servidor que não fala TLS.
  it.each([["false"], ["1"], ["TRUE"], [undefined]])(
    "treats DB_SSL=%s as disabled",
    (value) => {
      process.env = { ...original };
      if (value === undefined) delete process.env.DB_SSL;
      else process.env.DB_SSL = value;

      expect(loadVariables().DB_SSL).toBe(false);
    }
  );

  // A connection string de banco gerenciado passa inteira, sem coercao: quem
  // decide o que fazer com ela e config/database.
  it("passes DB_URL through untouched", () => {
    process.env = { ...original, DB_URL: "postgresql://u:p@host/db?sslmode=require" };

    expect(loadVariables().DB_URL).toBe(
      "postgresql://u:p@host/db?sslmode=require"
    );
  });

  // Number(undefined) is NaN, not a throw. server.ts relies on NaN being falsy for its
  // `variables.PORT || 5000` fallback, so this is load-bearing behaviour.
  it("yields NaN for absent ports rather than throwing", () => {
    process.env = { ...original };
    delete process.env.PORT;
    delete process.env.DB_PORT;

    const variables = loadVariables();

    expect(variables.PORT).toBeNaN();
    expect(variables.DB_PORT).toBeNaN();
    expect(variables.PORT || 5000).toBe(5000);
  });
});
