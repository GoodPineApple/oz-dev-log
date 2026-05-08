/**
 * logs 테이블에 대응하는 도메인 객체입니다.
 *
 * @typedef {object} Log
 * @property {number} id — logs.id (SERIAL)
 * @property {string} userId — logs.user_id (UUID, users 참조)
 * @property {string} title — logs.title
 * @property {string} content — logs.content
 * @property {string} createdAt — logs.created_at (ISO 8601)
 */

import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";

/**
 * @param {Partial<Log> & Pick<Log, 'userId' | 'title' | 'content'> & { id?: number }} input
 * @returns {Log}
 */
export function createLog(input) {
  return {
    id: input.id ?? 0,
    userId: input.userId,
    title: input.title,
    content: input.content,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

/** @param {unknown} row @returns {row is Log} */
export function isLog(row) {
  if (!row || typeof row !== "object") return false;
  const l = /** @type {Record<string, unknown>} */ (row);
  return (
    typeof l.id === "number" &&
    typeof l.userId === "string" &&
    typeof l.title === "string" &&
    typeof l.content === "string" &&
    typeof l.createdAt === "string"
  );
}

/** Sequelize — logs 테이블 */
export const LogModel = sequelize.define(
  "Log",
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
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
  },
  {
    tableName: "logs",
    timestamps: false,
  },
);

/**
 * @param {import("sequelize").Model<Log, Log> | Log | null | undefined} row
 * @returns {Log | null}
 */
export function logToJSON(row) {
  if (row == null) return null;
  const plain =
    typeof row.get === "function"
      ? /** @type {Log & { createdAt?: Date }} */ (row.get({ plain: true }))
      : /** @type {Log & { createdAt?: Date }} */ (row);
  const created = plain.createdAt;
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  return {
    id: Number(plain.id),
    userId: plain.userId,
    title: plain.title,
    content: plain.content,
    createdAt,
  };
}
