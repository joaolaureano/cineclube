import { createConnection } from "typeorm";
import databaseOptions from "../config/database";

export default () => {
  return createConnection(databaseOptions);
};
