import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret";
const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Request 헤더에서 Bearer 토큰을 추출하고 검증하여 userId를 반환한다.
 * 실패 시 null.
 */
export function getUserIdFromRequest(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const payload = verifyToken(header.slice(7));
    return payload.sub;
  } catch {
    return null;
  }
}

/**
 * 인증 필수 라우트에서 사용. 인증 실패 시 401 Response를 반환.
 */
export function requireAuth(req: NextRequest): string | Response {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "인증이 필요합니다.", status: 401 } },
      { status: 401 },
    );
  }
  return userId;
}
