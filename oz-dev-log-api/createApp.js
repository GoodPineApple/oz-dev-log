import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { corsMiddleware } from "./config/cors.js";
import { httpLogger } from "./config/logger.js";
import { mountRoutes } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express 앱 팩토리.
 *
 * 디렉터리 책임 구조:
 *   routes/      — HTTP 라우팅만 (controller에 위임)
 *   controllers/ — 비즈니스 로직 / 데이터 접근 / 직렬화
 *   middleware/  — 횡단 관심사 (requireAuth, upload, error-handler 등)
 *   lib/         — 도메인과 무관한 공용 유틸 (HttpError 등)
 *   config/      — 환경/외부 자원 설정 (cors, logger, database, storage)
 *   models/      — Sequelize 스키마 정의
 *
 * 미들웨어 순서:
 *   1) httpLogger    — 가장 먼저 요청을 찍어둔다 (이후 단계에서 죽어도 흔적이 남게)
 *   2) corsMiddleware — 브라우저 프리플라이트 처리
 *   3) express.json  — JSON 본문 파싱
 *   4) 정적 파일/라우트
 *   5) notFoundHandler — 어디에도 매칭 안 된 요청을 404 로
 *   6) errorHandler   — 모든 에러의 종착지 (응답 스키마 일원화)
 */
export function createApp() {
  const app = express();

  app.use(httpLogger());
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

  // 마지막 두 줄: 매칭 안 된 요청 → 404, 그 외 모든 에러 → 표준 응답.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
