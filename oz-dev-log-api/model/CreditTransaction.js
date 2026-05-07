/**
 * credit_transactions 테이블에 대응하는 도메인 객체입니다.
 *
 * @typedef {'earn' | 'spend' | 'bonus' | 'adjust'} CreditTypeValue
 *
 * @typedef {object} CreditTransaction
 * @property {number} id — credit_transactions.id (SERIAL)
 * @property {string} userId — credit_transactions.user_id
 * @property {number | null} logId — credit_transactions.log_id (nullable)
 * @property {number} amount — credit_transactions.amount (적립은 양수, 사용은 음수 등 부호로 구분)
 * @property {CreditTypeValue} type — credit_transactions.type
 * @property {string | null} [description] — credit_transactions.description
 * @property {string} createdAt — credit_transactions.created_at (ISO 8601)
 */

import { CreditType, isCreditType } from "./enums.js";

/**
 * @param {Partial<CreditTransaction> & Pick<CreditTransaction, 'userId' | 'amount' | 'type'> & { id?: number }} input
 * @returns {CreditTransaction}
 */
export function createCreditTransaction(input) {
  if (!isCreditType(input.type)) {
    throw new Error(`Invalid credit type: ${input.type}`);
  }
  return {
    id: input.id ?? 0,
    userId: input.userId,
    logId: input.logId ?? null,
    amount: input.amount,
    type: input.type,
    description: input.description ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

/** @param {unknown} row @returns {row is CreditTransaction} */
export function isCreditTransaction(row) {
  if (!row || typeof row !== "object") return false;
  const t = /** @type {Record<string, unknown>} */ (row);
  const logOk = t.logId === null || typeof t.logId === "number";
  const descOk = t.description === undefined || t.description === null || typeof t.description === "string";
  return (
    typeof t.id === "number" &&
    typeof t.userId === "string" &&
    logOk &&
    typeof t.amount === "number" &&
    isCreditType(t.type) &&
    descOk &&
    typeof t.createdAt === "string"
  );
}

export { CreditType };
