/**
 * 진입점: 환경 로드 → DB 준비 → Express 앱 기동
 *
 * 학습 포인트(MySQL + Sequelize 백엔드):
 * - 관계형 DB는 테이블/컬럼/제약 조건이 사전 정의되어야 한다.
 * - Sequelize.sync()로 모델 정의를 따라 테이블을 만든다(개발 편의).
 * - 모델 간 관계는 hasMany / belongsTo 등 명시적 선언이 필요하다.
 */
import "dotenv/config";
import { createApp } from "./createApp.js";
import { initDatabase } from "./bootstrap/database.js";
import { listenApp } from "./bootstrap/server.js";

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

async function main() {
  await initDatabase();
  await listenApp(app, PORT);
}

main().catch((err) => {
  console.error("Sequelize 백엔드 기동 실패:", err);
  process.exit(1);
});
