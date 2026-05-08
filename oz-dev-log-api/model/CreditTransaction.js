/**
 * credit_transactions 컬렉션에 대응하는 도메인 객체입니다.
 *
 * @typedef {'earn' | 'spend' | 'bonus' | 'adjust'} CreditTypeValue
 *
 * @typedef {object} CreditTransaction
 * @property {number} id
 * @property {string} userId
 * @property {number | null} logId
 * @property {number} amount
 * @property {CreditTypeValue} type
 * @property {string | null} [description]
 * @property {string} createdAt
 */

import mongoose from "mongoose";
import { CreditType, isCreditType } from "./enums.js";
import { nextSeq } from "./Counter.js";

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
  const descOk =
    t.description === undefined ||
    t.description === null ||
    typeof t.description === "string";
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

const creditTransactionSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: String, required: true, index: true, ref: "User" },
    logId: { type: Number, default: null, index: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      required: true,
      enum: ["earn", "spend", "bonus", "adjust"],
    },
    description: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "credit_transactions", versionKey: false },
);

creditTransactionSchema.pre("save", async function () {
  if (this.isNew && (this.id == null || this.id === undefined)) {
    this.id = await nextSeq("creditTransaction");
  }
});

export const CreditTransactionModel =
  mongoose.models.CreditTransaction ??
  mongoose.model("CreditTransaction", creditTransactionSchema);

/**
 * @param {unknown} doc
 */
function toPlain(doc) {
  if (doc == null) return null;
  if (typeof /** @type {{ toObject?: () => object }} */ (doc).toObject === "function") {
    return /** @type {{ toObject: () => object }} */ (doc).toObject();
  }
  return /** @type {Record<string, unknown>} */ (doc);
}

/**
 * @param {unknown} row
 * @returns {CreditTransaction | null}
 */
export function creditTransactionToJSON(row) {
  const plain = toPlain(row);
  if (!plain) return null;
  const created = /** @type {Date | string | undefined} */ (plain.createdAt);
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  const logId = plain.logId;
  return {
    id: Number(plain.id),
    userId: /** @type {string} */ (plain.userId),
    logId: logId == null ? null : Number(logId),
    amount: Number(plain.amount),
    type: /** @type {'earn' | 'spend' | 'bonus' | 'adjust'} */ (plain.type),
    description: plain.description == null ? null : String(plain.description),
    createdAt,
  };
}

export { CreditType };
