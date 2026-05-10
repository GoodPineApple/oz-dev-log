/**
 * User 관련 비즈니스 로직.
 * 라우트는 이 모듈만 호출해 Mongoose 호출이 라우트로 새지 않게 한다.
 */
import { User } from "../models/index.js";
import { serializeUser } from "./serializers.js";

export async function listUsers() {
  const docs = await User.find({}).sort({ createdAt: 1 }).exec();
  return docs.map(serializeUser);
}

export async function getUser(userId) {
  const doc = await User.findById(userId).exec();
  return serializeUser(doc);
}

/**
 * 크레딧 잔액 가감. MongoDB는 다중-도큐먼트 트랜잭션이 가능하지만
 * (Atlas 또는 replica set 필요), 학습 환경 단순화를 위해 원자적 업데이트로 처리.
 */
export async function adjustUserCredits(userId, delta) {
  if (typeof delta !== "number" || Number.isNaN(delta) || delta === 0) return;
  const updated = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalCredits: delta } },
    { new: true },
  ).exec();
  if (!updated) {
    const err = new Error("사용자를 찾을 수 없습니다.");
    err.status = 404;
    throw err;
  }
  if (updated.totalCredits < 0) {
    await User.findByIdAndUpdate(userId, { totalCredits: 0 }).exec();
  }
}
