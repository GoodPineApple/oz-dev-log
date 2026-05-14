/**
 * attachments 테이블 — 일지에 딸린 이미지/파일.
 *
 * 학습 포인트(파일 업로드):
 *   - file_url 은 브라우저가 그대로 <img src="..."> 에 사용할 수 있는 URL.
 *   - file_path 는 저장소 내부 경로 (Firebase: "attachments/<logId>/<uuid>-<name>",
 *     local: "uploads/<logId>/<uuid>-<name>"). 삭제 시에만 사용한다.
 *     URL 로부터 역으로 추출하지 않고 따로 저장해 두는 편이 안전·간결.
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
    filePath: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: "file_path",
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
