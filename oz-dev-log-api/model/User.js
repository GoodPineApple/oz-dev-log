/**
 * users 테이블에 대응하는 도메인 객체입니다.
 *
 * @typedef {object} User
 * @property {string} id — users.id (UUID)
 * @property {string} email — users.email
 * @property {string} nickname — users.nickname
 * @property {number} totalCredits — users.total_credits (>= 0)
 * @property {string} createdAt — users.created_at (ISO 8601)
 */

import crypto from "crypto";
import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";

/**
 * @param {Partial<User> & Pick<User, 'email' | 'nickname'>} input
 * @returns {User}
 */
export function createUser(input) {
  const totalCredits = input.totalCredits ?? 0;
  if (totalCredits < 0) {
    throw new Error("totalCredits must be >= 0");
  }
  return {
    id: input.id ?? crypto.randomUUID(),
    email: input.email,
    nickname: input.nickname,
    totalCredits,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

/** @param {unknown} row @returns {row is User} */
export function isUser(row) {
  if (!row || typeof row !== "object") return false;
  const u = /** @type {Record<string, unknown>} */ (row);
  return (
    typeof u.id === "string" &&
    typeof u.email === "string" &&
    typeof u.nickname === "string" &&
    typeof u.totalCredits === "number" &&
    u.totalCredits >= 0 &&
    typeof u.createdAt === "string"
  );
}

/** Sequelize — users 테이블 */
export const UserModel = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    totalCredits: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "total_credits",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

/**
 * API/프론트용 JSON (기존 mock과 동일한 키)
 * @param {import("sequelize").Model<User, User> | User | null | undefined} row
 * @returns {User | null}
 */
export function userToJSON(row) {
  if (row == null) return null;
  const plain =
    typeof row.get === "function"
      ? /** @type {User & { createdAt?: Date }} */ (row.get({ plain: true }))
      : /** @type {User & { createdAt?: Date }} */ (row);
  const created = plain.createdAt;
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  return {
    id: plain.id,
    email: plain.email,
    nickname: plain.nickname,
    totalCredits: Number(plain.totalCredits),
    createdAt,
  };
}
