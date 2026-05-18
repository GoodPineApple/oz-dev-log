import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { HttpError, errorResponse } from "@/lib/errors";
import { parseIntParam } from "@/lib/validate";

type Ctx = { params: Promise<{ logId: string; attachmentId: string }> };

/**
 * @swagger
 * /api/logs/{logId}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Attachments]
 *     summary: 첨부 파일 삭제 (본인 일지만)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: 삭제 성공
 *       403:
 *         description: 본인 일지가 아님
 */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;
    const userId = result;

    const { logId, attachmentId } = await params;
    const logIdNum = parseIntParam(logId, "logId");
    const attIdNum = parseIntParam(attachmentId, "attachmentId");
    const log = await prisma.log.findUnique({ where: { id: logIdNum } });
    if (!log) throw new HttpError(404, "NOT_FOUND", "일지를 찾을 수 없습니다.");
    if (log.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "본인 일지의 첨부만 삭제할 수 있습니다.");
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attIdNum },
    });
    if (!attachment || attachment.logId !== log.id) {
      throw new HttpError(404, "NOT_FOUND", "첨부를 찾을 수 없습니다.");
    }

    await prisma.attachment.delete({ where: { id: attachment.id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
