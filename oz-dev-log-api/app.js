/**
 * 진입점: 환경 로드 → DB / 저장소 준비 → Express 앱 기동
 *
 * 이번 수업의 주제는 파일 업로드:
 *   - multer 가 multipart/form-data 를 받아 메모리 buffer 로 컨트롤러에 전달
 *   - config/storage.js 가 buffer 를 Firebase Storage (없으면 로컬 디스크) 로 업로드
 *   - 반환된 공개 URL 을 attachments 테이블에 저장
 *   - 응답으로 그 URL 을 받은 클라이언트가 즉시 <img src=...> 로 렌더
 */
import "dotenv/config";
import { createApp } from "./createApp.js";
import { initDatabase } from "./bootstrap/database.js";
import { listenApp } from "./bootstrap/server.js";
import { initStorage } from "./config/storage.js";

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

async function main() {
  await initDatabase();
  await initStorage();
  await listenApp(app, PORT);
}

main().catch((err) => {
  console.error("API 백엔드 기동 실패:", err);
  process.exit(1);
});
