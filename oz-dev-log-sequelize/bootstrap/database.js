import mysql from "mysql2/promise";
import {
  authenticateDatabase,
  syncDatabase,
} from "../config/database.js";
import "../models/index.js";
import { runSeed } from "../seed/run-seed.js";

/**
 * 데모 편의: DB가 존재하지 않으면 만들어 둔다.
 * 학생들이 "Unknown database" 오류를 만나지 않도록 한다.
 */
async function ensureDatabaseExists() {
  const host = process.env.DB_HOST ?? "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER ?? "root";
  const password = process.env.DB_PASSWORD ?? "";
  const dbName = process.env.DB_NAME ?? "oz_dev_log_sequelize";
  const conn = await mysql.createConnection({ host, port, user, password });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` ` +
        `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await conn.end();
  }
}

/**
 * DB 연결 → 스키마 동기화 → (선택적) 시드 데이터 주입.
 */
export async function initDatabase() {
  try {
    await ensureDatabaseExists();
    await authenticateDatabase();
    console.log("[sequelize] MySQL 연결 성공.");
    await syncDatabase();
    if (process.env.DB_SYNC === "true") {
      console.log(
        "[sequelize] 테이블 동기화 완료" +
          (process.env.DB_SYNC_ALTER === "true" ? " (alter)" : ""),
      );
    }
    if (process.env.SEED_ON_BOOT === "true") {
      await runSeed();
    }
  } catch (err) {
    console.error("[sequelize] 데이터베이스 준비 실패:", err);
    throw err;
  }
}
