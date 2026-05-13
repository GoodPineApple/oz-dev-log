/**
 * JWT 인증 미들웨어.
 *
 * 학습 포인트:
 *   - 클라이언트가 보내는 토큰 위치: 헤더 `Authorization: Bearer <token>`.
 *   - 미들웨어는 토큰을 검증해 통과하면 req.user 에 사용자 정보를 채운다.
 *   - 검증 실패는 401 (인증 안 됨)이지 404 가 아니다.
 *
 * 사용 예:
 *   router.post("/", requireAuth, async (req, res) => {
 *     // req.user.id 로 작성자 식별
 *   });
 */
import { verifyToken } from "../controllers/jwt-helper.js";

function unauthorized(res, message) {
  return res.status(401).json({ error: message });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "로그인이 필요합니다 (Authorization 헤더 없음).");
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return unauthorized(res, "토큰이 비어 있습니다.");
  }
  try {
    const payload = verifyToken(token);
    if (!payload || typeof payload.sub !== "string") {
      return unauthorized(res, "토큰 형식이 올바르지 않습니다.");
    }
    req.user = {
      id: payload.sub,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
    next();
  } catch (err) {
    const reason =
      err.name === "TokenExpiredError"
        ? "토큰이 만료되었습니다."
        : "토큰이 유효하지 않습니다.";
    return unauthorized(res, reason);
  }
}
