/**
 * 크레딧 내역 조회/생성 (MongoDB).
 */
import { Types } from "mongoose";
import { CreditTransaction, User, Log } from "../models/index.js";
import { serializeCreditTransaction } from "./serializers.js";
import { adjustUserCredits } from "./user-controller.js";
import { CREDIT_TYPES } from "../models/enums.js";

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  return err;
}
function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  return err;
}

function parseObjectId(raw) {
  const s = String(raw ?? "");
  if (!Types.ObjectId.isValid(s)) return null;
  return new Types.ObjectId(s);
}

export async function listCreditTransactions({ userId } = {}) {
  const filter = {};
  if (typeof userId === "string" && userId.length > 0) {
    filter.userId = userId;
  }
  const docs = await CreditTransaction.find(filter)
    .sort({ createdAt: -1 })
    .exec();
  return docs.map(serializeCreditTransaction);
}

export async function getCreditTransaction(rawId) {
  const id = parseObjectId(rawId);
  if (id == null) throw notFound("내역을 찾을 수 없습니다.");
  const doc = await CreditTransaction.findById(id).exec();
  if (!doc) throw notFound("내역을 찾을 수 없습니다.");
  return serializeCreditTransaction(doc);
}

export async function createCreditTransaction({
  userId,
  logId,
  amount,
  type,
  description,
}) {
  if (typeof userId !== "string" || userId.length === 0) {
    throw badRequest("userId가 필요합니다.");
  }
  if (!CREDIT_TYPES.includes(type)) {
    throw badRequest(`type은 ${CREDIT_TYPES.join("|")} 중 하나여야 합니다.`);
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt)) {
    throw badRequest("amount는 숫자여야 합니다.");
  }

  const user = await User.findById(userId).exec();
  if (!user) throw notFound("사용자를 찾을 수 없습니다.");

  let normalizedLogId = null;
  if (logId != null && String(logId).length > 0) {
    const lid = parseObjectId(logId);
    if (lid == null) throw badRequest("logId 형식이 올바르지 않습니다.");
    const log = await Log.findById(lid).exec();
    if (!log) throw notFound("일지를 찾을 수 없습니다.");
    normalizedLogId = lid;
  }

  const doc = await CreditTransaction.create({
    userId,
    logId: normalizedLogId,
    amount: amt,
    type,
    description: description ?? null,
  });
  await adjustUserCredits(userId, amt);
  return serializeCreditTransaction(doc);
}
