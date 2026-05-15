/**
 * HTTP 에러 — 컨트롤러/미들웨어가 일관된 모양으로 던지기 위한 공통 클래스.
 *
 * 학습 포인트:
 *   - 각 컨트롤러마다 `const err = new Error(...); err.status = 400;` 같은
 *     보일러플레이트를 반복하던 것을 한 곳에 모은다.
 *   - status (HTTP 상태), code (클라이언트가 분기에 사용하는 짧은 식별자),
 *     message (사용자에게 보여줄 메시지) 세 가지를 한 객체로 들고 다닌다.
 *   - 글로벌 에러 핸들러(createApp.js)는 이 객체를 받아 표준 응답으로 직렬화한다.
 *
 * 응답 스키마:
 *   {
 *     "error": {
 *       "code":    "INVALID_EMAIL",   // 머신이 읽는 식별자
 *       "message": "유효한 이메일이 필요합니다.", // 사람이 읽는 문구
 *       "status":  400                // HTTP 상태 (편의상 본문에도 복사)
 *     }
 *   }
 */
export class HttpError extends Error {
  /**
   * @param {number} status   HTTP 상태 코드 (4xx | 5xx)
   * @param {string} code     클라이언트가 분기에 사용하는 짧은 식별자 (SNAKE_CASE)
   * @param {string} message  사용자에게 보여줄 한글 메시지
   * @param {object} [details] 선택: 어떤 필드가 왜 잘못됐는지 등 부가 정보
   */
  constructor(status, code, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }

  toJSON() {
    const body = { code: this.code, message: this.message, status: this.status };
    if (this.details !== undefined) body.details = this.details;
    return body;
  }

  // 자주 쓰는 상태 코드는 팩토리로 제공해 호출부 가독성을 높인다.
  static badRequest(message, code = "BAD_REQUEST", details) {
    return new HttpError(400, code, message, details);
  }
  static unauthorized(message, code = "UNAUTHORIZED") {
    return new HttpError(401, code, message);
  }
  static forbidden(message, code = "FORBIDDEN") {
    return new HttpError(403, code, message);
  }
  static notFound(message, code = "NOT_FOUND") {
    return new HttpError(404, code, message);
  }
  static conflict(message, code = "CONFLICT") {
    return new HttpError(409, code, message);
  }
  static payloadTooLarge(message, code = "PAYLOAD_TOO_LARGE") {
    return new HttpError(413, code, message);
  }
}
