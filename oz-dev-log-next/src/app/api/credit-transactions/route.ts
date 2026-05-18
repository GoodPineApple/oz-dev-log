import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeCreditTransaction } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/credit-transactions:
 *   get:
 *     tags: [CreditTransactions]
 *     summary: 크레딧 거래 목록
 *     description: userId 쿼리가 없으면 토큰 소유자의 거래를 반환한다.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
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
 *   post:
 *     tags: [CreditTransactions]
 *     summary: 크레딧 거래 생성
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type]
 *             properties:
 *               amount:      { type: integer }
 *               type:        { type: string, enum: [earn, spend, bonus, adjust] }
 *               logId:       { type: integer, nullable: true }
 *               description: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditTransaction'
 */
export async function GET(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const userId = req.nextUrl.searchParams.get("userId") ?? result;
    const txs = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(txs.map(serializeCreditTransaction));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;
    const userId = result;

    const { amount, type, logId, description } = await req.json();
    if (amount == null || !type) {
      throw new HttpError(400, "VALIDATION", "amount와 type이 필요합니다.");
    }

    const tx = await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        logId: logId ?? null,
        description: description ?? null,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalCredits: { increment: amount } },
    });

    return Response.json(serializeCreditTransaction(tx), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
