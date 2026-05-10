/**
 * 진입점: 환경 로드 → DB 연결 → Express 앱 기동.
 *
 * 학습 포인트(MongoDB + Mongoose 백엔드):
 * - 도큐먼트 DB는 컬렉션/스키마가 유연하다(스키마-온-라이트가 약함).
 * - Mongoose는 그 위에 강한 스키마와 검증을 얹어준다.
 * - 관계는 ObjectId 참조 + populate로 표현하거나, 임베드로 표현한다.
 */
import "dotenv/config";
import { createApp } from "./createApp.js";
import { initDatabase } from "./bootstrap/database.js";
import { listenApp } from "./bootstrap/server.js";

const PORT = Number(process.env.PORT) || 3002;
const app = createApp();

async function main() {
  await initDatabase();
  await listenApp(app, PORT);
}

main().catch((err) => {
  console.error("Mongoose 백엔드 기동 실패:", err);
  process.exit(1);
});
