// express의 부트스트랩 파일
import express from "express";
import cors from "cors";
import userRoute from "./routes/user-route.js";
import logRoute from "./routes/log-route.js";
import creditTransactionRoute from "./routes/credit-transaction-route.js";

const app = express();
const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === "production";

const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const extraCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];
const allowedCorsOrigins = [...new Set([...defaultCorsOrigins, ...extraCorsOrigins])];

function isLocalDevOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedCorsOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!isProduction && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.static("public"));
app.use(express.json());

app.use("/users", userRoute);
app.use("/logs", logRoute);
app.use("/credit-transactions", creditTransactionRoute);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
