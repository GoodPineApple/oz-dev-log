import express from "express";
import { corsMiddleware } from "./config/cors.js";
import userRoute from "./routes/user-route.js";
import logRoute from "./routes/log-route.js";
import creditTransactionRoute from "./routes/credit-transaction-route.js";

export function createApp() {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.static("public"));
  app.use(express.json());

  app.use("/users", userRoute);
  app.use("/logs", logRoute);
  app.use("/credit-transactions", creditTransactionRoute);

  return app;
}
