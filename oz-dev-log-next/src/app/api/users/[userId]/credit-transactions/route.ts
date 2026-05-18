import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeCreditTransaction } from "@/lib/serializers";
import { errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/users/{userId}/credit-transactions:
 *   get:
 *     tags: [Users]
 *     summary: 특정 사용자의 크레딧 거래 목록
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreditTransaction'
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const { userId } = await params;
    const txs = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(txs.map(serializeCreditTransaction));
  } catch (err) {
    return errorResponse(err);
  }
}
