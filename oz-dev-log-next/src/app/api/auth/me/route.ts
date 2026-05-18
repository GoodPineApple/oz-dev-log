import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: 현재 사용자 프로필
 *     description: JWT 토큰의 소유자 정보를 반환한다.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 */
export async function GET(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const user = await prisma.user.findUnique({ where: { id: result } });
    if (!user) throw new HttpError(404, "NOT_FOUND", "사용자를 찾을 수 없습니다.");

    return Response.json(serializeUser(user));
  } catch (err) {
    return errorResponse(err);
  }
}
