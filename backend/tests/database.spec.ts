import { createConnection } from "typeorm";
import databaseOptions from "../src/config/database";
import connectDatabase from "../src/database";

describe("connectDatabase", () => {
  it("opens a TypeORM connection with the configured options", async () => {
    const connection = { isConnected: true };
    (createConnection as jest.Mock).mockResolvedValue(connection);

    await expect(connectDatabase()).resolves.toBe(connection);
    expect(createConnection).toHaveBeenCalledWith(databaseOptions);
  });
});
