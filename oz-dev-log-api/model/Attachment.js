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

import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";
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

/** Sequelize — attachments 테이블 */
export const AttachmentModel = sequelize.define(
  "Attachment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    logId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "log_id",
      references: { model: "logs", key: "id" },
    },
    fileName: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "file_name",
    },
    fileUrl: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      field: "file_url",
    },
    fileType: {
      type: DataTypes.ENUM("image", "file"),
      allowNull: false,
      field: "file_type",
    },
    fileSize: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "file_size",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
  },
  {
    tableName: "attachments",
    timestamps: false,
  },
);

/**
 * @param {import("sequelize").Model<Attachment, Attachment> | Attachment | null | undefined} row
 * @returns {Attachment | null}
 */
export function attachmentToJSON(row) {
  if (row == null) return null;
  const plain =
    typeof row.get === "function"
      ? /** @type {Attachment & { createdAt?: Date }} */ (
          row.get({ plain: true })
        )
      : /** @type {Attachment & { createdAt?: Date }} */ (row);
  const created = plain.createdAt;
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date(/** @type {string} */ (created)).toISOString();
  return {
    id: Number(plain.id),
    logId: Number(plain.logId),
    fileName: plain.fileName,
    fileUrl: plain.fileUrl,
    fileType: plain.fileType,
    fileSize: Number(plain.fileSize),
    createdAt,
  };
}

export { AttachmentType };
