import express from "express";
import { corsMiddleware } from "./config/cors.js";
import { mountRoutes } from "./routes/index.js";

/**
 * Express 앱 팩토리.
 *
 * 디렉터리 책임 구조:
 *   routes/      — HTTP 라우팅만 (controller에 위임)
 *   controllers/ — 비즈니스 로직 / 데이터 접근 / 직렬화
 *   middleware/  — 횡단 관심사 (requireAuth 등)
 *   models/      — Sequelize 스키마 정의
 *
 * Authorization 헤더가 CORS 차단되지 않도록 cors 옵션에서 명시한다.
 */
export function createApp() {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.json({
      name: "oz-dev-log-api",
      backend: "mysql+sequelize+jwt",
      docs: "/auth/{register,login,me}, /users, /logs, /credit-transactions",
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
