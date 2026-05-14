import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { corsMiddleware } from "./config/cors.js";
import { mountRoutes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express 앱 팩토리.
 *
 * 디렉터리 책임 구조:
 *   routes/      — HTTP 라우팅만 (controller에 위임)
 *   controllers/ — 비즈니스 로직 / 데이터 접근 / 직렬화
 *   middleware/  — 횡단 관심사 (requireAuth, upload 등)
 *   models/      — Sequelize 스키마 정의
 *
 * 정적 파일:
 *   - /uploads/* → public/uploads. 저장소가 'local' 드라이버일 때 업로드된 파일을 서빙.
 *     Firebase 드라이버를 쓰면 이 폴더는 비어 있고 사용되지 않는다.
 */
export function createApp() {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.use(
    "/uploads",
    express.static(path.join(__dirname, "public", "uploads"), {
      // 이미지가 브라우저 캐시에 잘 박히도록 1시간 캐시
      maxAge: "1h",
    }),
  );

  app.get("/", (_req, res) => {
    res.json({
      name: "oz-dev-log-api",
      backend: "mysql+sequelize+jwt+multer",
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
