import { authenticateDatabase } from "../config/database.js";
import "../models/index.js";
import { runSeed } from "../seed/run-seed.js";

export async function initDatabase() {
  try {
    await authenticateDatabase();
    console.log("[mongoose] MongoDB 연결 성공.");
    if (process.env.SEED_ON_BOOT === "true") {
      await runSeed();
    }
  } catch (err) {
    console.error("[mongoose] 데이터베이스 준비 실패:", err);
    throw err;
  }
}
