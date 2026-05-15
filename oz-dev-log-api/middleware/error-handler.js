/**
 * 글로벌 에러 핸들러 — 모든 에러가 마지막에 거쳐가는 곳.
 *
 * 학습 포인트:
 *   - 컨트롤러는 HttpError 만 신경 쓰면 된다. Sequelize/Multer/JWT 등
 *     "라이브러리가 던지는 고유 에러"를 사람이 읽을 수 있는 형태로 바꾸는 책임은
 *     여기서 한 번에 진다.
 *   - 응답 스키마는 항상 동일:
 *       { error: { code, message, status, details? } }
 *     클라이언트는 status 코드뿐 아니라 code 로 분기할 수 있다.
 *   - 5xx 는 사용자에게 내부 상세를 노출하지 않는다 — 로그에는 남기되 응답은 일반화.
 */
import multer from "multer";
import { ValidationError, UniqueConstraintError } from "sequelize";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http-error.js";

/**
 * 임의의 에러를 HttpError 로 정규화한다.
 * 이미 HttpError 면 그대로, 라이브러리 에러는 의미에 맞게 변환,
 * 그 외(예상 못한 에러)는 500 으로 일반화한다.
 */
function normalizeError(err) {
  if (err instanceof HttpError) return err;

  // Sequelize: 컬럼/모델 검증 실패
  if (err instanceof ValidationError && !(err instanceof UniqueConstraintError)) {
    const details = err.errors?.map((e) => ({ field: e.path, message: e.message }));
    return HttpError.badRequest(
      "입력값 검증에 실패했습니다.",
      "VALIDATION_ERROR",
      details,
    );
  }

  // Sequelize: UNIQUE 제약 위반 — "이미 존재함" 이라 409 가 자연스럽다.
  if (err instanceof UniqueConstraintError) {
    const fields = err.errors?.map((e) => e.path).filter(Boolean);
    return HttpError.conflict(
      "이미 존재하는 값입니다.",
      "DUPLICATE_RESOURCE",
      fields?.length ? { fields } : undefined,
    );
  }

  // Multer: 멀티파트 업로드 관련 에러
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return HttpError.payloadTooLarge(
        "업로드 파일이 너무 큽니다.",
        "FILE_TOO_LARGE",
      );
    }
    return HttpError.badRequest(`업로드 오류: ${err.message}`, "INVALID_UPLOAD");
  }

  // JWT: 만료/위조 등
  if (err instanceof jwt.TokenExpiredError) {
    return HttpError.unauthorized("토큰이 만료되었습니다.", "TOKEN_EXPIRED");
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return HttpError.unauthorized("토큰이 유효하지 않습니다.", "INVALID_TOKEN");
  }

  // express.json 의 잘못된 JSON 본문
  if (err?.type === "entity.parse.failed") {
    return HttpError.badRequest(
      "요청 본문이 올바른 JSON 이 아닙니다.",
      "INVALID_JSON",
    );
  }

  // 그 외 모두 5xx — 응답에 상세를 노출하지 않는다.
  return new HttpError(500, "INTERNAL", "서버 오류가 발생했습니다.");
}

/** 라우터에서 어디에도 매칭되지 않은 요청을 표준 404 응답으로 변환. */
export function notFoundHandler(_req, _res, next) {
  next(HttpError.notFound("요청하신 리소스를 찾을 수 없습니다.", "ROUTE_NOT_FOUND"));
}

/** Express 에러 핸들러 — 4개 인자 시그니처를 유지해야 인식된다. */
export function errorHandler(err, req, res, _next) {
  const httpError = normalizeError(err);

  // morgan 의 :error-code 토큰이 읽어가는 자리. 같은 요청 한 줄에
  // HTTP 상태와 의미 코드가 함께 찍히도록 한다.
  res.locals.errorCode = httpError.code;

  // 5xx 는 원본 에러를 콘솔에 남긴다 — 운영 환경에서 사후 추적 가능하도록.
  // 4xx 는 morgan 한 줄로 충분하니 시끄럽게 찍지 않는다.
  if (httpError.status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(httpError.status).json({ error: httpError.toJSON() });
}
