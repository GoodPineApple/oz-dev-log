/**
 * logs 컬렉션에 대응하는 도메인 객체입니다.
 *
 * @typedef {object} Log
 * @property {number} id — 문서의 시퀀스 id (API용)
 * @property {string} userId — users._id 참조
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt — ISO 8601
 */

import mongoose from "mongoose";
import { nextSeq } from "./Counter.js";

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

const logSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: String, required: true, index: true, ref: "User" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "logs", versionKey: false },
);

logSchema.pre("save", async function () {
  if (this.isNew && (this.id == null || this.id === undefined)) {
    this.id = await nextSeq("log");
  }
});

export const LogModel =
  mongoose.models.Log ?? mongoose.model("Log", logSchema);

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
 * @returns {Log | null}
 */
export function logToJSON(row) {
  const plain = toPlain(row);
  if (!plain) return null;
  const created = /** @type {Date | string | undefined} */ (plain.createdAt);
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  return {
    id: Number(plain.id),
    userId: /** @type {string} */ (plain.userId),
    title: /** @type {string} */ (plain.title),
    content: /** @type {string} */ (plain.content),
    createdAt,
  };
}
