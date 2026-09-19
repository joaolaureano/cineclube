import swaggerUI from "swagger-ui-express";
import express from "express";
import { RegisterRoutes } from "../../src/routes/routes";

jest.mock("swagger-ui-express", () => ({
  __esModule: true,
  default: {
    serve: jest.fn(),
    generateHTML: jest.fn(() => "<html>doc</html>"),
  },
}));
jest.mock("../../src/routes/routes", () => ({ RegisterRoutes: jest.fn() }));
// The /doc handler is mounted with app.use(), which express keeps as an anonymous
// middleware layer rather than a addressable route. Stubbing express is the only way
// to get a handle on it without starting a server and issuing a request.
jest.mock("express", () => {
  const app = { use: jest.fn() };
  return { __esModule: true, default: jest.fn(() => app) };
});

describe("swaggerConfig", () => {
  it("registers the tsoa routes and serves the generated spec at /doc", async () => {
    let server: { use: jest.Mock };

    jest.isolateModules(() => {
      server = require("../../src/config/swaggerConfig").default;
    });

    expect(express).toHaveBeenCalled();
    expect(RegisterRoutes).toHaveBeenCalledWith(server!);

    const [path, serve, handler] = server!.use.mock.calls[0];
    expect(path).toBe("/doc");
    expect(serve).toBe(swaggerUI.serve);

    const res = { send: jest.fn() };
    await handler({}, res);

    expect(swaggerUI.generateHTML).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith("<html>doc</html>");
  });
});
