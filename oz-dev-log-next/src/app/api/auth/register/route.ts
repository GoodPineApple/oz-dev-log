import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";
import { HttpError, errorResponse } from "@/lib/errors";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 *     description: 이메일·닉네임·비밀번호로 가입하고 JWT를 발급받는다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nickname, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               nickname: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: 가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:  { $ref: '#/components/schemas/User' }
 *                 token: { type: string }
 *       409:
 *         description: 이미 존재하는 이메일
 */
export async function POST(req: NextRequest) {
  try {
    const { email, nickname, password } = await req.json();
    if (!email || !nickname || !password || password.length < 6) {
      throw new HttpError(400, "VALIDATION", "email, nickname, password(6자 이상)가 필요합니다.");
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new HttpError(409, "EMAIL_TAKEN", "이미 사용 중인 이메일입니다.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, nickname, passwordHash },
    });

    const token = signToken(user.id);
    return Response.json({ user: serializeUser(user), token }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
