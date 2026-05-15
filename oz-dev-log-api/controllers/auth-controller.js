/**
 * 인증 관련 비즈니스 로직.
 *
 * 학습 포인트:
 *   - register: 비밀번호를 bcrypt 로 해시해 저장한다. 평문은 저장하지 않는다.
 *   - login: bcrypt.compare 로 입력 비밀번호와 저장된 해시를 비교한다.
 *   - 로그인 실패 시 "이메일이 없습니다" / "비밀번호가 틀렸습니다" 를 구분하지 않는다 —
 *     이메일 존재 여부 자체가 정보 누출이 될 수 있기 때문.
 *   - 에러는 모두 HttpError 로 던진다. 응답 직렬화는 글로벌 에러 핸들러가 맡는다.
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { User } from "../models/index.js";
import { serializeUser } from "./serializers.js";
import { signToken } from "./jwt-helper.js";
import { HttpError } from "../lib/http-error.js";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * 회원가입.
 * 입력 검증 → 이메일 중복 확인 → 비밀번호 해시 → 사용자 생성 → 토큰 발급.
 */
export async function register(input) {
  const email = normalizeEmail(input?.email);
  const password = typeof input?.password === "string" ? input.password : "";
  const nickname =
    typeof input?.nickname === "string" ? input.nickname.trim() : "";

  if (!email || !email.includes("@")) {
    throw HttpError.badRequest("유효한 이메일이 필요합니다.", "INVALID_EMAIL");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw HttpError.badRequest(
      `비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`,
      "WEAK_PASSWORD",
    );
  }
  if (!nickname) {
    throw HttpError.badRequest("닉네임이 필요합니다.", "MISSING_NICKNAME");
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw HttpError.conflict("이미 가입된 이메일입니다.", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    id: randomUUID(),
    email,
    nickname,
    passwordHash,
    totalCredits: 0,
  });

  const token = signToken({ sub: user.id });
  return { user: serializeUser(user), token };
}

/**
 * 로그인.
 * 이메일로 사용자(해시 포함) 조회 → bcrypt.compare → 토큰 발급.
 */
export async function login(input) {
  const email = normalizeEmail(input?.email);
  const password = typeof input?.password === "string" ? input.password : "";

  if (!email || !password) {
    throw HttpError.badRequest(
      "이메일과 비밀번호를 모두 입력하세요.",
      "MISSING_CREDENTIALS",
    );
  }

  // 기본 스코프는 passwordHash 를 제외하므로 비교를 위해 명시적으로 포함시킨다.
  const user = await User.scope("withPassword").findOne({ where: { email } });
  if (!user) {
    throw HttpError.unauthorized(
      "이메일 또는 비밀번호가 올바르지 않습니다.",
      "INVALID_CREDENTIALS",
    );
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw HttpError.unauthorized(
      "이메일 또는 비밀번호가 올바르지 않습니다.",
      "INVALID_CREDENTIALS",
    );
  }

  const token = signToken({ sub: user.id });
  return { user: serializeUser(user), token };
}

/**
 * 현재 로그인 사용자 정보 조회. req.user.id 는 미들웨어가 채워준다.
 */
export async function getMe(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError.unauthorized("사용자를 찾을 수 없습니다.", "USER_NOT_FOUND");
  }
  return serializeUser(user);
}
