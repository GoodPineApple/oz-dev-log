/**
 * MySQL 접속용 Sequelize 인스턴스를 생성하는 모듈입니다.
 *
 * 학습 포인트:
 * - 환경 변수로 호스트/포트/DB명/계정 정보를 분리한다.
 * - dialect: "mysql" — Sequelize는 여러 RDBMS를 지원한다.
 * - connection pool / charset / 로깅을 한 곳에서 통제한다.
 */
import "dotenv/config";
import { Sequelize } from "sequelize";

const host = process.env.DB_HOST ?? "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const database = process.env.DB_NAME ?? "oz_dev_log_sequelize";
const username = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "";

export const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: "mysql",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  // 모든 시간 값을 UTC로 저장·조회한다.
  timezone: "+00:00",
  dialectOptions: {
    charset: "utf8mb4",
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

export async function authenticateDatabase() {
  await sequelize.authenticate();
}

export async function syncDatabase() {
  if (process.env.DB_SYNC !== "true") return;
  const alter = process.env.DB_SYNC_ALTER === "true";
  await sequelize.sync({ alter });
}
