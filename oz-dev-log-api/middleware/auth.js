/**
 * JWT 인증 미들웨어.
 *
 * 학습 포인트:
 *   - 클라이언트가 보내는 토큰 위치: 헤더 `Authorization: Bearer <token>`.
 *   - 미들웨어는 토큰을 검증해 통과하면 req.user 에 사용자 정보를 채운다.
 *   - 검증 실패는 401 (인증 안 됨)이지 404 가 아니다.
 *   - 실패 시 res.json() 으로 직접 응답하지 않는다 — HttpError 를 next() 로 흘려보내고
 *     글로벌 에러 핸들러가 표준 스키마로 직렬화한다. (응답 모양 일원화)
 *
 * 사용 예:
 *   router.post("/", requireAuth, async (req, res) => {
 *     // req.user.id 로 작성자 식별
 *   });
 */
import { verifyToken } from "../controllers/jwt-helper.js";
import { HttpError } from "../lib/http-error.js";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(
      HttpError.unauthorized(
        "로그인이 필요합니다 (Authorization 헤더 없음).",
        "MISSING_TOKEN",
      ),
    );
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(HttpError.unauthorized("토큰이 비어 있습니다.", "MISSING_TOKEN"));
  }
  try {
    const payload = verifyToken(token);
    if (!payload || typeof payload.sub !== "string") {
      return next(
        HttpError.unauthorized("토큰 형식이 올바르지 않습니다.", "INVALID_TOKEN"),
      );
    }
    req.user = {
      id: payload.sub,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
    next();
  } catch (err) {
    // jsonwebtoken 의 TokenExpiredError / JsonWebTokenError 는 글로벌 핸들러가
    // 알아서 401 로 변환하므로 그대로 흘려보낸다.
    next(err);
  }
}
