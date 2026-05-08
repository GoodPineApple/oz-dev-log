/**
 * users 컬렉션에 대응하는 도메인 객체입니다.
 *
 * @typedef {object} User
 * @property {string} id — users._id (UUID 문자열)
 * @property {string} email — users.email
 * @property {string} nickname — users.nickname
 * @property {number} totalCredits — users.total_credits (>= 0)
 * @property {string} createdAt — users.created_at (ISO 8601)
 */

import crypto from "crypto";
import mongoose from "mongoose";

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

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    email: { type: String, required: true, unique: true, trim: true },
    nickname: { type: String, required: true, trim: true },
    totalCredits: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users", versionKey: false },
);

export const UserModel =
  mongoose.models.User ?? mongoose.model("User", userSchema);

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
 * API/프론트용 JSON (기존 mock과 동일한 키)
 * @param {unknown} row
 * @returns {User | null}
 */
export function userToJSON(row) {
  const plain = toPlain(row);
  if (!plain) return null;
  const id = /** @type {string} */ (plain._id ?? plain.id);
  const created = /** @type {Date | string | undefined} */ (plain.createdAt);
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  return {
    id,
    email: /** @type {string} */ (plain.email),
    nickname: /** @type {string} */ (plain.nickname),
    totalCredits: Number(plain.totalCredits),
    createdAt,
  };
}
