import express from "express";
import { json } from "body-parser";
import cors from "cors";
import swaggerConfig from "../src/config/swaggerConfig";
import { RegisterRoutes } from "../src/routes/routes";
import { errorhandler } from "../src/utils/errorHandler";

jest.mock("express", () => {
  const app = {
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn(),
  };
  return { __esModule: true, default: jest.fn(() => app) };
});
jest.mock("body-parser", () => ({ json: jest.fn(() => "json-middleware") }));
jest.mock("cors", () => ({
  __esModule: true,
  default: jest.fn(() => "cors-middleware"),
}));
jest.mock("../src/config/swaggerConfig", () => ({
  __esModule: true,
  default: "swagger-middleware",
}));
jest.mock("../src/routes/routes", () => ({ RegisterRoutes: jest.fn() }));

const loadServer = (port?: string) => {
  let server: typeof import("../src/server").default;
  jest.isolateModules(() => {
    if (port === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = port;
    }
    server = require("../src/server").default;
  });
  return server!;
};

const appOf = () => ((express as unknown) as jest.Mock).mock.results[0].value;

describe("server.init", () => {
  const originalPort = process.env.PORT;

  afterEach(() => {
    process.env.PORT = originalPort;
  });

  it("wires body-parser, cors, the tsoa routes, swagger and the error handler in order", () => {
    loadServer("5000").init();
    const app = appOf();

    expect(app.use).toHaveBeenNthCalledWith(1, json());
    expect(app.use).toHaveBeenNthCalledWith(2, cors());
    expect(RegisterRoutes).toHaveBeenCalledWith(app);
    expect(app.use).toHaveBeenCalledWith(swaggerConfig);
    // The error handler must come last, or thrown errors bypass it. isolateModules
    // gives src/server its own copy of the module, so match on identity of name.
    const last = app.use.mock.calls[app.use.mock.calls.length - 1][0];
    expect(last.name).toBe(errorhandler.name);
  });

  it("answers /health with a plain 200 for the load balancer", () => {
    loadServer("5000").init();
    const app = appOf();

    const [path, handler] = app.get.mock.calls[0];
    expect(path).toBe("/health");

    const res: Record<string, jest.Mock> = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    handler({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("redirects the root path to the swagger docs", () => {
    loadServer("5000").init();
    const app = appOf();

    const [path, handler] = app.get.mock.calls[1];
    expect(path).toBe("/");

    const res = { redirect: jest.fn() };
    handler({}, res);
    expect(res.redirect).toHaveBeenCalledWith("/doc");
  });

  it("listens on the configured PORT", () => {
    loadServer("8080").init();
    const app = appOf();

    expect(app.listen).toHaveBeenCalledWith(8080, expect.any(Function));
  });

  it("falls back to port 5000 when PORT is not set", () => {
    loadServer(undefined).init();
    const app = appOf();

    expect(app.listen).toHaveBeenCalledWith(5000, expect.any(Function));
  });

  it("logs once the socket is bound", () => {
    const log = jest.spyOn(console, "log").mockImplementation();
    loadServer("5000").init();
    const app = appOf();

    const onListening = app.listen.mock.calls[0][1];
    onListening();

    expect(log).toHaveBeenCalledWith("Server listening on port 5000");
  });
});
