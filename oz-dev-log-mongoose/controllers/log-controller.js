/**
 * Log 관련 비즈니스 로직 (MongoDB).
 *
 * 학습 포인트:
 * - ObjectId 형식 검증을 명시적으로 한다(잘못된 hex string은 404).
 * - 일지 삭제 시 종속 컬렉션(첨부)을 함께 정리해야 한다 — DB가 보장하지 않음.
 */
import { Types } from "mongoose";
import {
  Log,
  User,
  Attachment,
  CreditTransaction,
} from "../models/index.js";
import {
  serializeAttachment,
  serializeLog,
} from "./serializers.js";
import { adjustUserCredits } from "./user-controller.js";
import { CreditType } from "../models/enums.js";

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  return err;
}
function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  return err;
}

function parseObjectId(raw) {
  const s = String(raw ?? "");
  if (!Types.ObjectId.isValid(s)) return null;
  return new Types.ObjectId(s);
}

export async function listLogs({ userId } = {}) {
  const filter = {};
  if (typeof userId === "string" && userId.length > 0) {
    filter.userId = userId;
  }
  const docs = await Log.find(filter).sort({ createdAt: -1 }).exec();
  return docs.map(serializeLog);
}

export async function getLog(rawId) {
  const id = parseObjectId(rawId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const doc = await Log.findById(id).exec();
  if (!doc) throw notFound("일지를 찾을 수 없습니다.");
  return serializeLog(doc);
}

export async function createLog({ userId, title, content }) {
  if (typeof userId !== "string" || userId.length === 0) {
    throw badRequest("userId가 필요합니다.");
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw badRequest("title이 필요합니다.");
  }
  if (typeof content !== "string") {
    throw badRequest("content가 필요합니다.");
  }

  const user = await User.findById(userId).exec();
  if (!user) throw notFound("사용자를 찾을 수 없습니다.");

  const log = await Log.create({
    userId,
    title: title.trim(),
    content,
  });

  const earnAmount = 100;
  await CreditTransaction.create({
    userId,
    logId: log._id,
    amount: earnAmount,
    type: CreditType.EARN,
    description: "일지 작성 적립",
  });
  await adjustUserCredits(userId, earnAmount);

  return serializeLog(log);
}

export async function updateLog(rawId, { title, content }, { userId }) {
  const id = parseObjectId(rawId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const log = await Log.findById(id).exec();
  if (!log) throw notFound("일지를 찾을 수 없습니다.");
  if (userId && log.userId !== userId) {
    const err = new Error("본인 일지만 수정할 수 있습니다.");
    err.status = 403;
    throw err;
  }
  if (typeof title === "string" && title.trim().length > 0) {
    log.title = title.trim();
  }
  if (typeof content === "string") {
    log.content = content;
  }
  await log.save();
  return serializeLog(log);
}

export async function deleteLog(rawId, { userId }) {
  const id = parseObjectId(rawId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const log = await Log.findById(id).exec();
  if (!log) throw notFound("일지를 찾을 수 없습니다.");
  if (userId && log.userId !== userId) {
    const err = new Error("본인 일지만 삭제할 수 있습니다.");
    err.status = 403;
    throw err;
  }
  await Attachment.deleteMany({ logId: id }).exec();
  await CreditTransaction.updateMany({ logId: id }, { $set: { logId: null } }).exec();
  await log.deleteOne();
  return { ok: true };
}

export async function listAttachments(rawLogId) {
  const id = parseObjectId(rawLogId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const log = await Log.findById(id).exec();
  if (!log) throw notFound("일지를 찾을 수 없습니다.");
  const docs = await Attachment.find({ logId: id })
    .sort({ createdAt: 1 })
    .exec();
  return docs.map(serializeAttachment);
}

export async function createAttachment(rawLogId, payload) {
  const id = parseObjectId(rawLogId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const log = await Log.findById(id).exec();
  if (!log) throw notFound("일지를 찾을 수 없습니다.");
  if (
    !payload ||
    typeof payload.fileName !== "string" ||
    typeof payload.fileUrl !== "string" ||
    typeof payload.fileType !== "string"
  ) {
    throw badRequest(
      "fileName, fileUrl, fileType이 필요합니다 (fileType: image|file).",
    );
  }
  const doc = await Attachment.create({
    logId: id,
    fileName: payload.fileName,
    fileUrl: payload.fileUrl,
    fileType: payload.fileType,
    fileSize: Number(payload.fileSize) || 0,
  });
  return serializeAttachment(doc);
}
