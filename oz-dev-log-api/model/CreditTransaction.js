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

import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";
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

/** Sequelize — credit_transactions 테이블 */
export const CreditTransactionModel = sequelize.define(
  "CreditTransaction",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: "user_id",
      references: { model: "users", key: "id" },
    },
    logId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "log_id",
      references: { model: "logs", key: "id" },
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("earn", "spend", "bonus", "adjust"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
  },
  {
    tableName: "credit_transactions",
    timestamps: false,
  },
);

/**
 * @param {import("sequelize").Model<CreditTransaction, CreditTransaction> | CreditTransaction | null | undefined} row
 * @returns {CreditTransaction | null}
 */
export function creditTransactionToJSON(row) {
  if (row == null) return null;
  const plain =
    typeof row.get === "function"
      ? /** @type {CreditTransaction & { createdAt?: Date }} */ (
          row.get({ plain: true })
        )
      : /** @type {CreditTransaction & { createdAt?: Date }} */ (row);
  const created = plain.createdAt;
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  const logId = plain.logId;
  return {
    id: Number(plain.id),
    userId: plain.userId,
    logId: logId == null ? null : Number(logId),
    amount: Number(plain.amount),
    type: plain.type,
    description: plain.description ?? null,
    createdAt,
  };
}

export { CreditType };
