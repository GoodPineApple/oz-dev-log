/**
 * Sequelize 모델 인스턴스를 프론트(JSON)로 내보내기 위한 변환기.
 * - id 계열은 모두 문자열로 통일 — Mongoose(ObjectId) 백엔드와 응답 형태를 맞추기 위함.
 * - 날짜는 ISO 8601 문자열로 직렬화한다.
 */

function toIso(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date(value).toISOString();
}

function plain(row) {
  return typeof row.get === "function" ? row.get({ plain: true }) : row;
}

export function serializeUser(row) {
  if (row == null) return null;
  const u = plain(row);
  return {
    id: String(u.id),
    email: u.email,
    nickname: u.nickname,
    totalCredits: Number(u.totalCredits ?? 0),
    createdAt: toIso(u.createdAt),
  };
}

export function serializeLog(row) {
  if (row == null) return null;
  const l = plain(row);
  return {
    id: String(l.id),
    userId: String(l.userId),
    title: l.title,
    content: l.content,
    createdAt: toIso(l.createdAt),
  };
}

export function serializeAttachment(row) {
  if (row == null) return null;
  const a = plain(row);
  return {
    id: String(a.id),
    logId: String(a.logId),
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileType: a.fileType,
    fileSize: Number(a.fileSize ?? 0),
    createdAt: toIso(a.createdAt),
  };
}

export function serializeCreditTransaction(row) {
  if (row == null) return null;
  const t = plain(row);
  return {
    id: String(t.id),
    userId: String(t.userId),
    logId: t.logId == null ? null : String(t.logId),
    amount: Number(t.amount),
    type: t.type,
    description: t.description ?? null,
    createdAt: toIso(t.createdAt),
  };
}
