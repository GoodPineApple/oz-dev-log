/**
 * logs 테이블에 대응하는 도메인 객체입니다.
 *
 * @typedef {object} Log
 * @property {number} id — logs.id (SERIAL)
 * @property {string} userId — logs.user_id (UUID, users 참조)
 * @property {string} title — logs.title
 * @property {string} content — logs.content
 * @property {string} createdAt — logs.created_at (ISO 8601)
 */

/**
 * @param {Partial<Log> & Pick<Log, 'userId' | 'title' | 'content'> & { id?: number }} input
 * @returns {Log}
 */
export function createLog(input) {
  return {
    id: input.id ?? 0,
    userId: input.userId,
    title: input.title,
    content: input.content,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

/** @param {unknown} row @returns {row is Log} */
export function isLog(row) {
  if (!row || typeof row !== "object") return false;
  const l = /** @type {Record<string, unknown>} */ (row);
  return (
    typeof l.id === "number" &&
    typeof l.userId === "string" &&
    typeof l.title === "string" &&
    typeof l.content === "string" &&
    typeof l.createdAt === "string"
  );
}
