import connectDatabase from "../src/database";
import server from "../src/server";

jest.mock("../src/database");
jest.mock("../src/server", () => ({
  __esModule: true,
  default: { init: jest.fn() },
}));

const mockedConnect = connectDatabase as jest.MockedFunction<
  typeof connectDatabase
>;

const loadEntrypoint = async () => {
  jest.isolateModules(() => {
    require("../src/index");
  });
  // The entrypoint kicks off a promise chain it never returns; let it settle.
  await new Promise((resolve) => setImmediate(resolve));
};

describe("index entrypoint", () => {
  let log: jest.SpyInstance;

  beforeEach(() => {
    log = jest.spyOn(console, "log").mockImplementation();
  });

  it("starts the server once the database connection succeeds", async () => {
    mockedConnect.mockResolvedValue({} as never);

    await loadEntrypoint();

    expect(server.init).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("Connected successfully to database.");
  });

  it("logs the failure and leaves the server down when the connection fails", async () => {
    const err = new Error("connection refused");
    mockedConnect.mockRejectedValue(err);

    await loadEntrypoint();

    expect(server.init).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(err);
    expect(log).toHaveBeenCalledWith(
      "Error connecting to database!\nconnection refused"
    );
  });
});
