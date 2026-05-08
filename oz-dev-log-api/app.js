// 진입점: 환경 로드 → DB 준비 → Express 앱 기동
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

main();
