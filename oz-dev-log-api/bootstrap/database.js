import { authenticateDatabase, syncDatabase } from "../model/database.js";
import { useMockData } from "../model/runtimeConfig.js";

/**
 * 목 모드가 아니면 Sequelize 연관 로드·인증·선택적 sync.
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  if (useMockData()) {
    console.log("USE_MOCK_DATA=true: 목 데이터 모드 (MySQL 연결 없음).");
    return;
  }

  try {
    await import("../model/associations.js");
    await authenticateDatabase();
    console.log("MySQL(Sequelize) 연결 성공.");
    await syncDatabase();
    if (process.env.DB_SYNC === "true") {
      console.log(
        "DB_SYNC=true: 테이블 동기화 완료." +
          (process.env.DB_SYNC_ALTER === "true" ? " (alter)" : ""),
      );
    }
  } catch (err) {
    console.error("데이터베이스 연결 실패:", err);
    process.exit(1);
  }
}
