/**
 * logs 컬렉션.
 *
 * MongoDB 특징:
 * - _id는 ObjectId(자동 생성). 응답에서는 문자열로 직렬화한다.
 * - userId는 User._id(=String) 참조 — 관계형의 외래키와 비슷한 역할.
 *   엄밀히는 DB가 강제하지 않으니 코드에서 검증해야 한다.
 */
import { Schema, model } from "mongoose";

const LogSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
    collection: "logs",
  },
);

LogSchema.index({ userId: 1, createdAt: -1 });

export const Log = model("Log", LogSchema);
