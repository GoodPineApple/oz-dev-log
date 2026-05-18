import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";
import { errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: 사용자 목록
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export async function GET(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(users.map(serializeUser));
  } catch (err) {
    return errorResponse(err);
  }
}
