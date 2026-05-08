import { connectDatabase } from "../model/database.js";
import { useMockData } from "../model/runtimeConfig.js";

/**
 * 목 모드가 아니면 Mongoose로 MongoDB(Atlas) 연결.
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  if (useMockData()) {
    console.log("USE_MOCK_DATA=true: 목 데이터 모드 (MongoDB 연결 없음).");
    return;
  }

  try {
    await connectDatabase();
    console.log("MongoDB(Mongoose) 연결 성공.");
  } catch (err) {
    console.error("데이터베이스 연결 실패:", err);
    process.exit(1);
  }
}
