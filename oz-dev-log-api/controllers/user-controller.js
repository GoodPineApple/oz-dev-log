/**
 * User 관련 비즈니스 로직.
 * 라우트는 이 모듈만 호출한다 — Sequelize API가 라우트로 새지 않게 한다.
 */
import { User } from "../models/index.js";
import { serializeUser } from "./serializers.js";
import { HttpError } from "../lib/http-error.js";

export async function listUsers() {
  const rows = await User.findAll({ order: [["createdAt", "ASC"]] });
  return rows.map(serializeUser);
}

/**
 * 사용자 단건 조회. 없으면 404 를 던진다 — 라우트가 응답 분기에서 해방된다.
 */
export async function getUser(userId) {
  const row = await User.findByPk(userId);
  if (!row) throw HttpError.notFound("사용자를 찾을 수 없습니다.", "USER_NOT_FOUND");
  return serializeUser(row);
}

export async function adjustUserCredits(userId, delta, transaction) {
  if (typeof delta !== "number" || Number.isNaN(delta)) return;
  const user = await User.findByPk(userId, { transaction });
  if (!user) {
    throw HttpError.notFound("사용자를 찾을 수 없습니다.", "USER_NOT_FOUND");
  }
  const next = Math.max(0, Number(user.totalCredits) + delta);
  user.totalCredits = next;
  await user.save({ transaction });
}
