const handle = jest.fn(async () => ({ statusCode: 200 }));
const createApp = jest.fn(() => "express-app");
const connectDatabase = jest.fn();

jest.mock("serverless-http", () => ({
  __esModule: true,
  default: jest.fn(() => handle),
}));
jest.mock("../src/server", () => ({
  __esModule: true,
  default: { createApp, init: jest.fn() },
}));
jest.mock("../src/database", () => ({
  __esModule: true,
  default: connectDatabase,
}));

const send = jest.fn();
jest.mock("@aws-sdk/client-ssm", () => ({
  SSMClient: jest.fn(() => ({ send })),
  GetParametersCommand: jest.fn((input) => ({ input })),
}));

const ssmReply = (dbUrl: string, originSecret?: string) => ({
  Parameters: [
    { Name: "/cineclube/DB_URL", Value: dbUrl },
    { Name: "/cineclube/SESSION_SECRET", Value: "segredo-de-sessao-de-teste" },
    ...(originSecret
      ? [{ Name: "/cineclube/ORIGIN_SECRET", Value: originSecret }]
      : []),
  ],
});

const connectionManager = { has: jest.fn(), get: jest.fn() };
jest.mock("typeorm", () => ({
  getConnectionManager: () => connectionManager,
}));

const loadHandler = () => {
  let mod: typeof import("../src/lambda");
  jest.isolateModules(() => {
    mod = require("../src/lambda");
  });
  return mod!.handler;
};

describe("lambda handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectionManager.has.mockReturnValue(false);
    connectDatabase.mockResolvedValue("connection");
    delete process.env.DB_URL;
    process.env.SSM_PREFIX = "/cineclube";
    send.mockResolvedValue(ssmReply("postgresql://u:p@h/db"));
    delete process.env.ORIGIN_SECRET;
  });

  afterEach(() => {
    delete process.env.DB_URL;
    delete process.env.ORIGIN_SECRET;
  });

  // Montado uma vez e reaproveitado: remontar por invocacao jogaria fora o
  // ganho do container morno, que e o caminho comum.
  it("builds the express app once and reuses it across invocations", async () => {
    const handler = loadHandler();

    expect(createApp).not.toHaveBeenCalled();

    await handler({}, {});
    await handler({}, {});

    expect(createApp).toHaveBeenCalledTimes(1);
  });

  // O bug que isto tranca: server.ts importa config/enviromentVariables, que le
  // process.env no import e fica em cache. Montar o app antes de o segredo
  // chegar congelaria DB_URL como undefined, e a conexao iria para 127.0.0.1.
  it("loads the secret before touching anything that reads the environment", async () => {
    const order: string[] = [];
    send.mockImplementation(async () => {
      order.push("ssm");
      return ssmReply("postgresql://u:p@h/db");
    });
    createApp.mockImplementation(() => {
      order.push("createApp");
      return "express-app";
    });
    connectDatabase.mockImplementation(async () => {
      order.push("connect");
      return "connection";
    });

    const handler = loadHandler();
    await handler({}, {});

    expect(order[0]).toBe("ssm");
    expect(order.indexOf("createApp")).toBeGreaterThan(order.indexOf("ssm"));
  });

  // O segredo tem que chegar ao ambiente antes de config/database ser lido,
  // senao a conexao sobe sem DB_URL e cai no caminho de banco local.
  it("loads the connection string from ssm before connecting", async () => {
    const handler = loadHandler();
    await handler({}, {});

    expect(send).toHaveBeenCalledTimes(1);
    expect(process.env.DB_URL).toBe("postgresql://u:p@h/db");
  });

  // DB_URL ja no ambiente e o caso do desenvolvimento local, onde nao ha SSM.
  it("skips ssm when DB_URL is already set", async () => {
    process.env.DB_URL = "postgresql://local/db";
    const handler = loadHandler();
    await handler({}, {});

    expect(send).not.toHaveBeenCalled();
    expect(connectDatabase).toHaveBeenCalledTimes(1);
  });

  it("fails loudly when the parameter is empty", async () => {
    send.mockResolvedValue({ Parameters: [] });
    const handler = loadHandler();

    await expect(handler({}, {})).rejects.toThrow(/DB_URL vazio ou ilegivel/);
  });

  // Sem segredo de sessao nao ha como assinar nem verificar login: falhar no
  // boot e melhor que descobrir com o usuario na frente.
  it("fails loudly when the session secret is missing", async () => {
    send.mockResolvedValue({
      Parameters: [{ Name: "/cineclube/DB_URL", Value: "postgresql://u:p@h/db" }],
    });
    const handler = loadHandler();

    await expect(handler({}, {})).rejects.toThrow(/SESSION_SECRET/);
  });

  it("connects on the first invocation and delegates to the wrapped app", async () => {
    const handler = loadHandler();
    const result = await handler({ path: "/health" }, {});

    expect(connectDatabase).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ statusCode: 200 });
  });

  // Conexao e cara: um container morno tem que reaproveitar a que ja tem.
  it("reuses a live connection instead of opening another", async () => {
    const handler = loadHandler();
    await handler({}, {});

    connectionManager.has.mockReturnValue(true);
    connectionManager.get.mockReturnValue({ isConnected: true });

    await handler({}, {});
    await handler({}, {});

    expect(connectDatabase).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledTimes(3);
  });

  // O pooler do Neon derruba conexao ociosa: o container volta morno mas com a
  // conexao morta, e ai reconectar e obrigatorio.
  it("reconnects when the pooler dropped the connection", async () => {
    const handler = loadHandler();
    await handler({}, {});

    const close = jest.fn().mockResolvedValue(undefined);
    connectionManager.has.mockReturnValue(true);
    connectionManager.get.mockReturnValue({ isConnected: false, close });

    await handler({}, {});

    expect(close).toHaveBeenCalledTimes(1);
    expect(connectDatabase).toHaveBeenCalledTimes(2);
  });

  // Uma promise rejeitada em cache envenenaria o container: todas as
  // invocacoes seguintes herdariam a falha do cold start sem nunca tentar de novo.
  it("does not cache a failed connection attempt", async () => {
    connectDatabase.mockRejectedValueOnce(new Error("sem rede"));
    const handler = loadHandler();

    await expect(handler({}, {})).rejects.toThrow("sem rede");

    connectDatabase.mockResolvedValue("connection");
    await expect(handler({}, {})).resolves.toEqual({ statusCode: 200 });
    expect(connectDatabase).toHaveBeenCalledTimes(2);
  });

  // A Function URL e publica: o segredo de origem e o que impede alguem de
  // falar com a API por fora do CloudFront.
  describe("origin secret", () => {
    beforeEach(() => {
      send.mockResolvedValue(ssmReply("postgresql://u:p@h/db", "s3gr3do"));
    });

    it("serves requests carrying the secret the distribution injects", async () => {
      const handler = loadHandler();
      const res = await handler({ headers: { "x-origin-secret": "s3gr3do" } }, {});

      expect(res).toEqual({ statusCode: 200 });
      expect(handle).toHaveBeenCalledTimes(1);
    });

    it("refuses a request that did not come through cloudfront", async () => {
      const handler = loadHandler();
      const res = (await handler({ headers: {} }, {})) as { statusCode: number };

      expect(res.statusCode).toBe(403);
      expect(handle).not.toHaveBeenCalled();
    });

    it("refuses a wrong secret of the same length", async () => {
      const handler = loadHandler();
      const res = (await handler(
        { headers: { "x-origin-secret": "errad0!" } },
        {}
      )) as { statusCode: number };

      expect(res.statusCode).toBe(403);
      expect(handle).not.toHaveBeenCalled();
    });

    // Sem segredo configurado nao ha o que conferir: e o caso do dev local.
    it("skips the check when no secret is configured", async () => {
      send.mockResolvedValue(ssmReply("postgresql://u:p@h/db"));
      const handler = loadHandler();

      expect(await handler({ headers: {} }, {})).toEqual({ statusCode: 200 });
    });
  });
});
