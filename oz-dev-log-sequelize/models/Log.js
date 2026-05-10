/**
 * logs 테이블.
 *
 * MySQL 특징:
 * - PK는 자동 증가 INTEGER (AUTO_INCREMENT)
 * - user_id 외래키로 users(id)를 참조한다.
 * - title은 길이 제한, content는 LONGTEXT.
 */
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Log = sequelize.define(
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
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "logs",
    timestamps: false,
  },
);
