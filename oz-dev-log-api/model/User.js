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
