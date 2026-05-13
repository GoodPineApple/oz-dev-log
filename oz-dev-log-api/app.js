/**
 * 진입점: 환경 로드 → DB 준비 → Express 앱 기동
 *
 * 이 프로젝트의 학습 주제: JWT 기반 인증/인가.
 *   - /auth/register, /auth/login 으로 토큰을 발급한다.
 *   - 그 외 보호된 엔드포인트는 Authorization: Bearer <token> 헤더를 요구한다.
 *   - middleware/auth.js 가 토큰을 검증해 req.user 를 채운다.
 */
import "dotenv/config";
import { createApp } from "./createApp.js";
import { initDatabase } from "./bootstrap/database.js";
import { listenApp } from "./bootstrap/server.js";

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

async function main() {
  await initDatabase();
  await listenApp(app, PORT);
}

main().catch((err) => {
  console.error("API 백엔드 기동 실패:", err);
  process.exit(1);
});
