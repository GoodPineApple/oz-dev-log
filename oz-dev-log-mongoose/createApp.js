import express from "express";
import { corsMiddleware } from "./config/cors.js";
import { mountRoutes } from "./routes/index.js";

/**
 * Express 앱 팩토리.
 *
 *   routes/    — HTTP 라우팅만
 *   controllers/ — 비즈니스 로직 / 데이터 접근
 *   models/    — Mongoose 스키마 정의
 */
export function createApp() {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.json({
      name: "oz-dev-log-mongoose",
      backend: "mongodb+mongoose",
      docs: "/users, /logs, /credit-transactions",
    });
  });

  mountRoutes(app);

  app.use((_req, res) => {
    res.status(404).json({ error: "요청하신 리소스를 찾을 수 없습니다." });
  });

  app.use((err, _req, res, _next) => {
    console.error("[ERROR]", err);
    const status = Number(err.status) || 500;
    res
      .status(status)
      .json({ error: err.message || "서버 오류가 발생했습니다." });
  });

  return app;
}
