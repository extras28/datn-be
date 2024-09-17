import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config.js";
import express from "express";
import { database } from "./configs/db.config.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { apiRouter } from "./routes/index.js";
import * as db from "./models/index.js";
import { ERROR_NOT_FOUND } from "./shared/errors/error.js";

async function start() {
  const PORT = process.env.PORT ?? 8000;

  // connect to database
  try {
    await database.authenticate();
    console.log("Connected to database.");

    // await database.sync({ force: true });
    await database.sync({ alter: true });
    // await database.drop();
    console.log("All models are sync.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }

  const app = express().disable("x-powered-by");

  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(bodyParser.json({ limit: "128mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "128mb" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(
    process.env.PATH_PUBLIC_DIR,
    express.static(process.env.PUBLIC_UPLOAD_DIR),
    (_, res) => {
      res.status(404).send({ result: "failed", reason: ERROR_NOT_FOUND });
    }
  );

  // Router
  app.use("/api/v1", apiRouter);

  // Error handler
  app.use(errorHandlerMiddleware);

  app.listen(PORT, () => {
    console.log(`eShip server is running on port ${PORT}.`);
  });
}

start();
