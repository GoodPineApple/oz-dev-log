/**
 * attachments 컬렉션에 대응하는 도메인 객체입니다.
 *
 * @typedef {'image' | 'file'} AttachmentTypeValue
 *
 * @typedef {object} Attachment
 * @property {number} id
 * @property {number} logId — logs.id (숫자)
 * @property {string} fileName
 * @property {string} fileUrl
 * @property {AttachmentTypeValue} fileType
 * @property {number} fileSize
 * @property {string} createdAt
 */

import mongoose from "mongoose";
import { AttachmentType, isAttachmentType } from "./enums.js";
import { nextSeq } from "./Counter.js";

/**
 * @param {Partial<Attachment> & Pick<Attachment, 'logId' | 'fileName' | 'fileUrl' | 'fileType' | 'fileSize'> & { id?: number }} input
 * @returns {Attachment}
 */
export function createAttachment(input) {
  if (!isAttachmentType(input.fileType)) {
    throw new Error(`Invalid attachment fileType: ${input.fileType}`);
  }
  if (input.fileSize < 0) {
    throw new Error("fileSize must be >= 0");
  }
  return {
    id: input.id ?? 0,
    logId: input.logId,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    fileType: input.fileType,
    fileSize: input.fileSize,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

/** @param {unknown} row @returns {row is Attachment} */
export function isAttachment(row) {
  if (!row || typeof row !== "object") return false;
  const a = /** @type {Record<string, unknown>} */ (row);
  return (
    typeof a.id === "number" &&
    typeof a.logId === "number" &&
    typeof a.fileName === "string" &&
    typeof a.fileUrl === "string" &&
    isAttachmentType(a.fileType) &&
    typeof a.fileSize === "number" &&
    a.fileSize >= 0 &&
    typeof a.createdAt === "string"
  );
}

const attachmentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    logId: { type: Number, required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true, enum: ["image", "file"] },
    fileSize: { type: Number, required: true, min: 0, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "attachments", versionKey: false },
);

attachmentSchema.pre("save", async function () {
  if (this.isNew && (this.id == null || this.id === undefined)) {
    this.id = await nextSeq("attachment");
  }
});

export const AttachmentModel =
  mongoose.models.Attachment ?? mongoose.model("Attachment", attachmentSchema);

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
 * @returns {Attachment | null}
 */
export function attachmentToJSON(row) {
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
    logId: Number(plain.logId),
    fileName: /** @type {string} */ (plain.fileName),
    fileUrl: /** @type {string} */ (plain.fileUrl),
    fileType: /** @type {'image' | 'file'} */ (plain.fileType),
    fileSize: Number(plain.fileSize),
    createdAt,
  };
}

export { AttachmentType };
