import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeCreditTransaction } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";
import { parseIntParam } from "@/lib/validate";

/**
 * @swagger
 * /api/credit-transactions/{id}:
 *   get:
 *     tags: [CreditTransactions]
 *     summary: 크레딧 거래 단건 조회
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditTransaction'
 *       404:
 *         description: 거래 없음
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const { id } = await params;
    const txId = parseIntParam(id, "id");
    const tx = await prisma.creditTransaction.findUnique({
      where: { id: txId },
    });
    if (!tx) throw new HttpError(404, "NOT_FOUND", "거래를 찾을 수 없습니다.");

    return Response.json(serializeCreditTransaction(tx));
  } catch (err) {
    return errorResponse(err);
  }
}
