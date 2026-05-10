/**
 * credit_transactions 컬렉션.
 *
 * MongoDB 특징:
 * - logId는 nullable이 자연스럽다(필드 자체를 생략해도 됨).
 * - amount, type, description의 검증을 Mongoose 스키마가 담당한다.
 */
import { Schema, Types, model } from "mongoose";
import { CREDIT_TYPES } from "./enums.js";

const CreditTransactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    logId: {
      type: Types.ObjectId,
      required: false,
      default: null,
      ref: "Log",
    },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: CREDIT_TYPES },
    description: { type: String, default: null },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
    collection: "credit_transactions",
  },
);

CreditTransactionSchema.index({ userId: 1, createdAt: -1 });

export const CreditTransaction = model(
  "CreditTransaction",
  CreditTransactionSchema,
);
