/**
 * attachments 테이블에 대응하는 도메인 객체입니다.
 *
 * @typedef {'image' | 'file'} AttachmentTypeValue
 *
 * @typedef {object} Attachment
 * @property {number} id — attachments.id (SERIAL)
 * @property {number} logId — attachments.log_id
 * @property {string} fileName — attachments.file_name
 * @property {string} fileUrl — attachments.file_url
 * @property {AttachmentTypeValue} fileType — attachments.file_type
 * @property {number} fileSize — attachments.file_size (바이트)
 * @property {string} createdAt — attachments.created_at (ISO 8601)
 */

import { AttachmentType, isAttachmentType } from "./enums.js";

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

export { AttachmentType };
