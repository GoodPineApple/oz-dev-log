/**
 * attachments 테이블 — 일지에 딸린 이미지/파일.
 *
 * MySQL 특징:
 * - file_type은 ENUM('image', 'file').
 * - file_size는 UNSIGNED INTEGER.
 */
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { ATTACHMENT_TYPES } from "./enums.js";

export const Attachment = sequelize.define(
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
      type: DataTypes.ENUM(...ATTACHMENT_TYPES),
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
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "attachments",
    timestamps: false,
  },
);
