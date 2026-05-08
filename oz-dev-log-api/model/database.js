/**
 * MySQL 접속용 Sequelize 인스턴스.
 * 환경 변수: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */
import "dotenv/config";
import { Sequelize } from "sequelize";

const host = process.env.DB_HOST ?? "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const database = process.env.DB_NAME ?? "oz_dev_log";
const username = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "";

export const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: "mysql",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  dialectOptions: {
    charset: "utf8mb4",
    /** 날짜를 문자열로 받아 타임존 이슈 완화 (필요 시 조정) */
    dateStrings: true,
    typeCast: true,
  },
  define: {
    underscored: true,
    charset: "utf8mb4",
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 5,
    min: Number(process.env.DB_POOL_MIN) || 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * 연결 확인 (서버 기동 시 호출 권장)
 * @returns {Promise<void>}
 */
export async function authenticateDatabase() {
  await sequelize.authenticate();
}

/**
 * 개발용 스키마 동기화. 프로덕션에서는 마이그레이션 사용 권장.
 * DB_SYNC=true 일 때만 실행.
 * @returns {Promise<void>}
 */
export async function syncDatabase() {
  if (process.env.DB_SYNC !== "true") return;
  const alter = process.env.DB_SYNC_ALTER === "true";
  await sequelize.sync({ alter });
}
