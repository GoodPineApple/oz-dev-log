import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeLog } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/logs:
 *   get:
 *     tags: [Logs]
 *     summary: 일지 목록
 *     description: userId 쿼리가 없으면 토큰 소유자의 일지를 반환한다.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: 조회할 사용자 ID (생략 시 본인)
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 *   post:
 *     tags: [Logs]
 *     summary: 일지 작성
 *     description: 일지를 작성하고 자동으로 100 CP를 적립한다. 작성자는 JWT 토큰에서 결정된다.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:   { type: string, maxLength: 500 }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 */
export async function GET(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const userId = req.nextUrl.searchParams.get("userId") ?? result;
    const logs = await prisma.log.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(logs.map(serializeLog));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;
    const userId = result;

    const { title, content } = await req.json();
    if (!title?.trim() || content == null) {
      throw new HttpError(400, "VALIDATION", "title과 content가 필요합니다.");
    }

    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.log.create({
        data: { userId, title: title.trim(), content },
      });
      await tx.user.update({
        where: { id: userId },
        data: { totalCredits: { increment: 100 } },
      });
      await tx.creditTransaction.create({
        data: {
          userId,
          logId: created.id,
          amount: 100,
          type: "earn",
          description: `일지 작성 — ${created.title}`,
        },
      });
      return created;
    });

    return Response.json(serializeLog(log), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
