/**
 * users 테이블.
 *
 * 학습 포인트(인증):
 *   - 평문 비밀번호는 절대 저장하지 않는다. bcrypt 해시만 저장한다.
 *   - password_hash 컬럼은 응답으로 직렬화하지 않는다 (serializers.js 참고).
 *   - email 은 UNIQUE 제약을 둬 같은 계정이 두 번 만들어지지 않게 한다.
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
    passwordHash: {
      // bcrypt 해시 길이는 보통 60자. 여유 있게 100자.
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "password_hash",
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
    defaultScope: {
      // 기본 조회 시 password_hash 는 메모리에 올리지 않는다.
      // 인증 비교가 필요할 때만 .scope("withPassword").findOne(...) 으로 명시 조회.
      attributes: { exclude: ["passwordHash"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["passwordHash"] },
      },
    },
  },
);
