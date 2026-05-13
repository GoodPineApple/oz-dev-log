/**
 * credit_transactions 테이블 — 크레딧 적립/사용 내역.
 *
 * MySQL 특징:
 * - log_id는 NULL 가능 (관리자 조정처럼 일지 없는 거래도 있음).
 * - amount는 부호 있는 INT (적립 양수 / 사용 음수).
 */
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { CREDIT_TYPES } from "./enums.js";

export const CreditTransaction = sequelize.define(
  "CreditTransaction",
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
    logId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "log_id",
      references: { model: "logs", key: "id" },
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...CREDIT_TYPES),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "credit_transactions",
    timestamps: false,
  },
);
