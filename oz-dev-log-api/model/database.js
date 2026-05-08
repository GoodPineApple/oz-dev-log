/**
 * MongoDB Atlas (또는 로컬 MongoDB) — Mongoose 연결.
 * 환경 변수: MONGODB_URI (필수, 비목 모드)
 */
import mongoose from "mongoose";

/**
 * @returns {Promise<void>}
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI 환경 변수가 필요합니다. Atlas에서 발급한 연결 문자열을 설정하세요.",
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15_000,
    appName: process.env.MONGODB_APP_NAME ?? "oz-dev-log-api",
  });
}

/**
 * @returns {Promise<void>}
 */
export async function disconnectDatabase() {
  await mongoose.disconnect();
}
