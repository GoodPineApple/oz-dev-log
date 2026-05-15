/**
 * Attachment 관련 비즈니스 로직.
 *
 * 학습 포인트(파일 업로드 흐름):
 *   1) multer 가 multipart 파일을 메모리 buffer 로 받는다 (req.file).
 *   2) storage.upload() 가 buffer 를 외부 저장소(Firebase Storage)로 흘려보낸다.
 *   3) 외부 저장소는 공개 URL 을 돌려준다.
 *   4) 그 URL 을 attachments 테이블에 저장한다.
 *   5) 응답으로 attachment 한 건을 JSON 으로 돌려주면 클라이언트가 즉시 렌더한다.
 *
 * 삭제는 그 반대 순서: DB → 외부 저장소.
 */
import { Log, Attachment } from "../models/index.js";
import { getStorage } from "../config/storage.js";
import { AttachmentType } from "../models/enums.js";
import { serializeAttachment } from "./serializers.js";
import { HttpError } from "../lib/http-error.js";

function parseLogId(raw) {
  const s = String(raw ?? "");
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

function parseAttachmentId(raw) {
  const s = String(raw ?? "");
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

async function loadLogOrThrow(rawLogId, { ownerId } = {}) {
  const logId = parseLogId(rawLogId);
  if (logId == null) throw HttpError.notFound("일지를 찾을 수 없습니다.", "LOG_NOT_FOUND");
  const log = await Log.findByPk(logId);
  if (!log) throw HttpError.notFound("일지를 찾을 수 없습니다.", "LOG_NOT_FOUND");
  if (ownerId && log.userId !== ownerId) {
    throw HttpError.forbidden(
      "본인 일지에만 파일을 첨부할 수 있습니다.",
      "NOT_LOG_OWNER",
    );
  }
  return log;
}

export async function listAttachments(rawLogId) {
  // 일지 자체가 없으면 404. 권한은 따로 안 본다 — 일지 본문이 공개이므로 첨부도 공개.
  await loadLogOrThrow(rawLogId);
  const rows = await Attachment.findAll({
    where: { logId: parseLogId(rawLogId) },
    order: [["createdAt", "ASC"]],
  });
  return rows.map(serializeAttachment);
}

/**
 * 파일 업로드 + DB 저장. 트랜잭션을 쓰지는 않는다 — 외부 저장소 업로드는 DB 트랜잭션과
 * 묶을 수 없기 때문이다. 대신 실패 시 흔적(stale 파일)이 남지 않게 보상 로직을 둔다.
 *
 * @param rawLogId  /logs/:logId 의 logId
 * @param ownerId   인증된 사용자 id (req.user.id). 본인 일지에만 첨부 가능.
 * @param file      req.file — multer 가 채운 객체 (buffer, originalname, mimetype, size)
 */
export async function uploadAttachment(rawLogId, { ownerId, file }) {
  if (!file || !file.buffer) {
    throw HttpError.badRequest("file 필드로 파일을 보내주세요.", "MISSING_FILE");
  }
  const log = await loadLogOrThrow(rawLogId, { ownerId });

  console.log(
    `[upload] log#${log.id}: ${file.originalname} (${file.mimetype}, ${file.size}B) 수신`,
  );

  const storage = getStorage();
  const { fileUrl, filePath } = await storage.upload(file.buffer, {
    filename: file.originalname,
    mimetype: file.mimetype,
    logId: log.id,
  });

  console.log(`[upload] 저장소(${storage.driver}) 경로: ${filePath}`);
  console.log(`[upload] 공개 URL: ${fileUrl}`);

  try {
    const row = await Attachment.create({
      logId: log.id,
      fileName: file.originalname,
      fileUrl,
      filePath,
      fileType: AttachmentType.IMAGE, // 이번 수업은 이미지로 제한
      fileSize: file.size,
    });
    console.log(`[upload] DB 저장 완료: attachment#${row.id}`);
    return serializeAttachment(row);
  } catch (err) {
    // DB 쓰기에 실패하면 저장소에 남은 파일을 정리한다.
    console.error("[upload] DB 저장 실패 — 저장소 파일 롤백 시도", err);
    try {
      await storage.delete(filePath);
    } catch (cleanupErr) {
      console.error("[upload] 저장소 롤백도 실패:", cleanupErr);
    }
    throw err;
  }
}

/**
 * 첨부 삭제 — DB 행 제거 후 저장소 파일도 정리.
 * 저장소 삭제가 실패해도 DB는 이미 지웠으므로 사용자 경험상 "삭제 성공" 처리.
 */
export async function deleteAttachment(rawLogId, rawAttachmentId, { ownerId }) {
  const log = await loadLogOrThrow(rawLogId, { ownerId });
  const attachmentId = parseAttachmentId(rawAttachmentId);
  if (attachmentId == null) {
    throw HttpError.notFound("첨부를 찾을 수 없습니다.", "ATTACHMENT_NOT_FOUND");
  }
  const attachment = await Attachment.findByPk(attachmentId);
  if (!attachment || attachment.logId !== log.id) {
    throw HttpError.notFound("첨부를 찾을 수 없습니다.", "ATTACHMENT_NOT_FOUND");
  }

  const filePath = attachment.filePath;
  await attachment.destroy();
  console.log(`[upload] DB 삭제 완료: attachment#${attachmentId}`);

  if (filePath) {
    try {
      await getStorage().delete(filePath);
      console.log(`[upload] 저장소에서 파일 제거: ${filePath}`);
    } catch (err) {
      console.warn("[upload] 저장소 파일 제거 실패 (무시):", err);
    }
  }
  return { ok: true };
}
