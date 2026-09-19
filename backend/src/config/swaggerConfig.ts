import { Response, Request } from "express";
import swaggerUI from "swagger-ui-express";
import express from "express";
import { RegisterRoutes } from "../routes/routes";

const swaggerServer = express();

RegisterRoutes(swaggerServer);

swaggerServer.use(
  "/doc",
  swaggerUI.serve,
  async (_req: Request, res: Response) => {
    return res.send(
      swaggerUI.generateHTML(await import("../../dist/swagger.json"))
    );
  }
);

export default swaggerServer;
