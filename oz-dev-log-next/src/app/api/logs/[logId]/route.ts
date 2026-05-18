import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeLog } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";

type Ctx = { params: Promise<{ logId: string }> };

/**
 * @swagger
 * /api/logs/{logId}:
 *   get:
 *     tags: [Logs]
 *     summary: 일지 단건 조회
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       404:
 *         description: 일지 없음
 *   put:
 *     tags: [Logs]
 *     summary: 일지 수정 (본인만)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:   { type: string }
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       403:
 *         description: 본인 일지가 아님
 *   delete:
 *     tags: [Logs]
 *     summary: 일지 삭제 (본인만)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: 삭제 성공
 *       403:
 *         description: 본인 일지가 아님
 */
async function findLog(logId: string) {
  const id = Number(logId);
  if (Number.isNaN(id)) throw new HttpError(400, "VALIDATION", "유효하지 않은 logId");
  const log = await prisma.log.findUnique({ where: { id } });
  if (!log) throw new HttpError(404, "NOT_FOUND", "일지를 찾을 수 없습니다.");
  return log;
}

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const { logId } = await params;
    const log = await findLog(logId);
    return Response.json(serializeLog(log));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;
    const userId = result;

    const { logId } = await params;
    const log = await findLog(logId);
    if (log.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "본인 일지만 수정할 수 있습니다.");
    }

    const { title, content } = await req.json();
    const updated = await prisma.log.update({
      where: { id: log.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
      },
    });
    return Response.json(serializeLog(updated));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;
    const userId = result;

    const { logId } = await params;
    const log = await findLog(logId);
    if (log.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "본인 일지만 삭제할 수 있습니다.");
    }

    await prisma.log.delete({ where: { id: log.id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
