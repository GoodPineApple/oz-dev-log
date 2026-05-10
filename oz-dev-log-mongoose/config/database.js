/**
 * MongoDB 접속 (Mongoose).
 *
 * 학습 포인트:
 * - Sequelize와 달리 "DB 인스턴스"를 따로 만들지 않고, 전역 mongoose에 연결한다.
 * - 연결 URI 한 줄로 호스트/포트/DB명/계정 정보를 모두 표현한다.
 */
import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/oz_dev_log_mongoose";

if (process.env.MONGOOSE_DEBUG === "true") {
  mongoose.set("debug", true);
}

mongoose.set("strictQuery", true);

export async function authenticateDatabase() {
  console.log(MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

export { mongoose };
