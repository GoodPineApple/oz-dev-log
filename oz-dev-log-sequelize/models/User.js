/**
 * users 테이블.
 *
 * MySQL 특징:
 * - PK는 UUID 문자열 (CHAR(36))
 * - email은 UNIQUE 제약
 * - total_credits는 음수가 될 수 없는 UNSIGNED INTEGER
 */
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    totalCredits: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "total_credits",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);
