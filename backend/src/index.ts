import "reflect-metadata";

import connectDatabase from "./database";
import server from "./server";

connectDatabase()
  .then(() => {
    console.log("Connected successfully to database.");
    server.init();
  })
  .catch((err) => {
    console.log(err);
    console.log(`Error connecting to database!\n${err.message}`);
  });
