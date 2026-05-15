/**
 * 크레딧 내역 조회/생성.
 */
import { CreditTransaction, User, Log } from "../models/index.js";
import { sequelize } from "../config/database.js";
import { serializeCreditTransaction } from "./serializers.js";
import { adjustUserCredits } from "./user-controller.js";
import { CREDIT_TYPES } from "../models/enums.js";
import { HttpError } from "../lib/http-error.js";

function parseId(raw) {
  const s = String(raw ?? "");
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export async function listCreditTransactions({ userId } = {}) {
  const where = {};
  if (typeof userId === "string" && userId.length > 0) {
    where.userId = userId;
  }
  const rows = await CreditTransaction.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
  return rows.map(serializeCreditTransaction);
}

export async function getCreditTransaction(rawId) {
  const id = parseId(rawId);
  if (id == null) throw HttpError.notFound("내역을 찾을 수 없습니다.", "TX_NOT_FOUND");
  const row = await CreditTransaction.findByPk(id);
  if (!row) throw HttpError.notFound("내역을 찾을 수 없습니다.", "TX_NOT_FOUND");
  return serializeCreditTransaction(row);
}

export async function createCreditTransaction({
  userId,
  logId,
  amount,
  type,
  description,
}) {
  if (typeof userId !== "string" || userId.length === 0) {
    throw HttpError.badRequest("userId가 필요합니다.", "MISSING_USER_ID");
  }
  if (!CREDIT_TYPES.includes(type)) {
    throw HttpError.badRequest(
      `type은 ${CREDIT_TYPES.join("|")} 중 하나여야 합니다.`,
      "INVALID_CREDIT_TYPE",
    );
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt)) {
    throw HttpError.badRequest("amount는 숫자여야 합니다.", "INVALID_AMOUNT");
  }

  const user = await User.findByPk(userId);
  if (!user) throw HttpError.notFound("사용자를 찾을 수 없습니다.", "USER_NOT_FOUND");

  let normalizedLogId = null;
  if (logId != null && String(logId).length > 0) {
    const lid = parseId(logId);
    if (lid == null) {
      throw HttpError.badRequest("logId 형식이 올바르지 않습니다.", "INVALID_LOG_ID");
    }
    const log = await Log.findByPk(lid);
    if (!log) throw HttpError.notFound("일지를 찾을 수 없습니다.", "LOG_NOT_FOUND");
    normalizedLogId = lid;
  }

  return sequelize.transaction(async (t) => {
    const row = await CreditTransaction.create(
      {
        userId,
        logId: normalizedLogId,
        amount: amt,
        type,
        description: description ?? null,
      },
      { transaction: t },
    );
    await adjustUserCredits(userId, amt, t);
    return serializeCreditTransaction(row);
  });
}
