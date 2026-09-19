import "reflect-metadata";

import { timingSafeEqual } from "crypto";

import serverlessHttp from "serverless-http";
import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";
import { getConnectionManager } from "typeorm";

// Nada que leia o ambiente pode ser importado no topo. config/enviromentVariables
// captura process.env no momento do import e fica em cache; como server.ts o
// importa, um "import server from ./server" aqui congelaria DB_URL como
// undefined - e a conexao cairia no default de banco local, 127.0.0.1:5432.
// Por isso server e database entram por require, depois que o segredo chegou.

// A connection string vem do Parameter Store, nao de variavel de ambiente:
// variavel de ambiente e legivel para quem consiga descrever a funcao, e esta
// carrega a senha do banco.
const loadSecret = async (): Promise<void> => {
  if (process.env.DB_URL) return;

  const prefix = process.env.SSM_PREFIX;
  if (!prefix) throw new Error("SSM_PREFIX nao configurado");

  const ssm = new SSMClient({});
  const { Parameters } = await ssm.send(
    new GetParametersCommand({
      Names: [
        `${prefix}/DB_URL`,
        `${prefix}/ORIGIN_SECRET`,
        `${prefix}/SESSION_SECRET`,
      ],
      WithDecryption: true,
    })
  );

  const byName = new Map(
    (Parameters ?? []).map((p) => [p.Name, p.Value] as const)
  );

  const dbUrl = byName.get(`${prefix}/DB_URL`);
  if (!dbUrl) throw new Error(`${prefix}/DB_URL vazio ou ilegivel`);

  process.env.DB_URL = dbUrl;

  const originSecret = byName.get(`${prefix}/ORIGIN_SECRET`);
  if (originSecret) process.env.ORIGIN_SECRET = originSecret;

  //sem ele nao ha como assinar nem verificar sessao: falhar aqui e melhor que
  //descobrir no primeiro login, com o usuario na frente
  const sessionSecret = byName.get(`${prefix}/SESSION_SECRET`);
  if (!sessionSecret) throw new Error(`${prefix}/SESSION_SECRET vazio ou ilegivel`);
  process.env.SESSION_SECRET = sessionSecret;
};

// A Function URL e publica: sem esta conferencia, qualquer um que descobrisse o
// endereco falaria com a API por fora do CloudFront. So o CloudFront injeta o
// header, entao quem chega sem ele nao veio por onde deveria.
const cameFromCloudFront = (event: unknown): boolean => {
  const expected = process.env.ORIGIN_SECRET;
  //sem segredo configurado (desenvolvimento local) nao ha o que conferir
  if (!expected) return true;

  const headers =
    ((event as { headers?: Record<string, string> })?.headers as Record<
      string,
      string
    >) ?? {};

  //a Lambda entrega os nomes de header em minusculas, mas nao custa nao depender disso
  const received =
    headers["x-origin-secret"] ?? headers["X-Origin-Secret"] ?? "";

  //comparacao de tamanho antes de conteudo evita o timingSafeEqual lancar
  if (received.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
};

type Handle = (event: unknown, context: unknown) => Promise<unknown>;

// Montado uma vez por container e guardado aqui: entre invocacoes mornas a
// Lambda reaproveita este escopo, entao o caminho quente nao remonta o Express.
let handle: Handle | null = null;

const buildApp = (): Handle => {
  if (!handle) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const server = require("./server").default;
    handle = (serverlessHttp(server.createApp()) as unknown) as Handle;
  }
  return handle;
};

const connectDatabase = (): Promise<unknown> =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("./database").default();

// Um container morno pode voltar com a conexao ja derrubada pelo outro lado: o
// pooler do Neon fecha conexoes ociosas. Por isso o estado e reconferido a cada
// invocacao, e nao assumido a partir da promise que a criou.
let connecting: Promise<unknown> | null = null;

const ensureDatabase = async (): Promise<void> => {
  const manager = getConnectionManager();
  const existing = manager.has("default") ? manager.get("default") : null;

  if (existing?.isConnected) return;

  //se o container ja derrubou a conexao, a instancia antiga precisa sair do
  //manager antes que createConnection possa registrar outra com o mesmo nome
  if (existing) {
    connecting = null;
    await existing.close().catch(() => undefined);
  }

  if (!connecting) {
    connecting = loadSecret()
      .then(connectDatabase)
      .catch((err) => {
        //sem isso um cold start que falha envenena o container: a promise
        //rejeitada ficaria em cache e toda invocacao seguinte herdaria o erro
        connecting = null;
        throw err;
      });
  }

  await connecting;
};

export const handler = async (event: unknown, context: unknown) => {
  //o segredo vem do SSM junto da connection string, entao a carga precisa ter
  //acontecido antes de conferir a origem
  await ensureDatabase();

  if (!cameFromCloudFront(event)) {
    return {
      statusCode: 403,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ success: false, message: "Forbidden" }),
    };
  }

  return buildApp()(event, context);
};
