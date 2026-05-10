/**
 * users 컬렉션.
 *
 * MongoDB 특징:
 * - _id를 직접 사용하기보다 String 형 id 필드를 두어 UUID 호환을 유지.
 *   (학습 단계에서 두 백엔드의 응답 모양을 맞추기 위함)
 * - 필드 변경에 자유로우나, Mongoose가 강한 타입/검증을 더해준다.
 */
import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    nickname: { type: String, required: true, trim: true },
    totalCredits: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
    collection: "users",
  },
);

export const User = model("User", UserSchema);
