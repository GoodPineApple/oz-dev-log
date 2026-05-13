/**
 * JWT 서명·검증 헬퍼.
 *
 * 학습 포인트:
 *   - 서명에 사용하는 비밀키(JWT_SECRET)는 서버만 알아야 한다.
 *     이 값이 노출되면 누구나 임의의 사용자를 사칭하는 토큰을 만들 수 있다.
 *   - 토큰은 변조 방지일 뿐 기밀성 보장이 아니다.
 *     payload 는 누구나 base64 디코드해 읽을 수 있으니, 비밀번호/민감정보를 담지 않는다.
 *   - 만료(exp)가 필수다. 짧게 잡고 갱신(refresh) 전략을 별도로 쓰는 것이 일반적.
 */
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

if (
  process.env.NODE_ENV === "production" &&
  SECRET === "dev-secret-change-me"
) {
  console.warn(
    "[api] JWT_SECRET 이 기본값입니다. 운영 환경에서는 반드시 교체하세요.",
  );
}

/**
 * @param {{ sub: string } & Record<string, unknown>} payload sub 에는 사용자 id 를 담는다.
 * @returns {string} JWT (header.payload.signature)
 */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * @param {string} token
 * @returns {jwt.JwtPayload}
 * @throws 만료/변조/형식 오류 시 throw — 호출자는 401 로 변환한다.
 */
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
