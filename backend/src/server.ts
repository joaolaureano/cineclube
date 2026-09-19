import express from "express";
import { json } from "body-parser";
import cors from "cors";

import variables from "./config/enviromentVariables";
import swaggerConfig from "./config/swaggerConfig";
import { RegisterRoutes } from "./routes/routes";
import { errorhandler } from "./utils/errorHandler";

// Montar o app e escutar numa porta sao coisas separadas: em Lambda nao existe
// porta para escutar, e o mesmo app precisa ser embrulhado pelo handler.
const createApp = (): express.Express => {
  const server = express();

  server.use(json());
  server.use(cors());

  // Init routes
  RegisterRoutes(server); // New router version

  server.use(swaggerConfig);
  server.use(errorhandler);

  //health check da instância: GET / responde 302 e não serve para isso
  server.get("/health", (_: express.Request, res: express.Response) => {
    res.status(200).json({ status: "ok" });
  });

  server.get("/", (_: express.Request, res: express.Response) => {
    res.redirect("/doc");
  });

  return server;
};

const init = (): void => {
  const server = createApp();

  const PORT = variables.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

export default {
  createApp,
  init,
};
