/**
 * attachments 컬렉션.
 *
 * MongoDB 특징:
 * - logId는 Log._id(ObjectId) 참조.
 * - fileType은 enum으로 값 제한.
 *
 * 참고: 도큐먼트 DB 답게 첨부를 Log 도큐먼트에 임베드하는 설계도 흔하다.
 *       여기서는 두 백엔드의 API 형태를 맞추기 위해 별도 컬렉션으로 둔다.
 */
import { Schema, Types, model } from "mongoose";
import { ATTACHMENT_TYPES } from "./enums.js";

const AttachmentSchema = new Schema(
  {
    logId: {
      type: Types.ObjectId,
      required: true,
      index: true,
      ref: "Log",
    },
    fileName: { type: String, required: true, maxlength: 500 },
    fileUrl: { type: String, required: true, maxlength: 2048 },
    fileType: { type: String, required: true, enum: ATTACHMENT_TYPES },
    fileSize: { type: Number, required: true, default: 0, min: 0 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
    collection: "attachments",
  },
);

export const Attachment = model("Attachment", AttachmentSchema);
