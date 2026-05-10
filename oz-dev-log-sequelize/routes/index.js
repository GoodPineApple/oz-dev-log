import userRoute from "./user-route.js";
import logRoute from "./log-route.js";
import creditTransactionRoute from "./credit-transaction-route.js";

export function mountRoutes(app) {
  app.use("/users", userRoute);
  app.use("/logs", logRoute);
  app.use("/credit-transactions", creditTransactionRoute);
}
