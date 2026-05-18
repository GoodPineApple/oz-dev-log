import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serializeAttachment } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";
import { parseIntParam } from "@/lib/validate";

type Ctx = { params: Promise<{ logId: string }> };

/**
 * @swagger
 * /api/logs/{logId}/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: 일지의 첨부 파일 목록
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attachment'
 *   post:
 *     tags: [Attachments]
 *     summary: 첨부 파일 업로드 (이미지)
 *     description: multipart/form-data의 file 필드로 이미지를 업로드한다. Vercel 환경에서는 외부 스토리지를 사용해야 하므로, 이 데모에서는 파일 메타 정보만 저장한다.
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 */
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;

    const { logId } = await params;
    const id = parseIntParam(logId, "logId");
    const attachments = await prisma.attachment.findMany({
      where: { logId: id },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(attachments.map(serializeAttachment));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const result = requireAuth(req);
    if (result instanceof Response) return result;
    const userId = result;

    const { logId } = await params;
    const id = parseIntParam(logId, "logId");
    const log = await prisma.log.findUnique({ where: { id } });
    if (!log) throw new HttpError(404, "NOT_FOUND", "일지를 찾을 수 없습니다.");
    if (log.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "본인 일지에만 첨부할 수 있습니다.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new HttpError(400, "VALIDATION", "file 필드가 필요합니다.");

    const isImage = file.type.startsWith("image/");

    const attachment = await prisma.attachment.create({
      data: {
        logId: id,
        fileName: file.name,
        fileUrl: `/api/placeholder/${file.name}`,
        fileType: isImage ? "image" : "file",
        fileSize: file.size,
      },
    });

    return Response.json(serializeAttachment(attachment), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
