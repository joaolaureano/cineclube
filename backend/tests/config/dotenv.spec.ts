import * as dotenv from "dotenv";

jest.mock("dotenv");

describe("dotenv config", () => {
  it("loads the .env file on import", () => {
    jest.isolateModules(() => {
      require("../../src/config/dotenv");
    });

    expect(dotenv.config).toHaveBeenCalled();
  });
});
