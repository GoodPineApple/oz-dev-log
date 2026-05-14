/**
 * Log 관련 비즈니스 로직.
 *
 * 학습 포인트:
 * - 일지 작성은 트랜잭션으로 묶어 크레딧 적립과 원자적으로 처리한다.
 * - 관계형 모델에선 외래키/관계를 통한 join이 자연스럽다.
 */
import { sequelize } from "../config/database.js";
import { Log, User, CreditTransaction } from "../models/index.js";
import { serializeLog } from "./serializers.js";
import { adjustUserCredits } from "./user-controller.js";
import { CreditType } from "../models/enums.js";

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  return err;
}

function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  return err;
}

function parseLogId(raw) {
  const s = String(raw ?? "");
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export async function listLogs({ userId } = {}) {
  const where = {};
  if (typeof userId === "string" && userId.length > 0) {
    where.userId = userId;
  }
  const rows = await Log.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
  return rows.map(serializeLog);
}

export async function getLog(rawId) {
  const id = parseLogId(rawId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const row = await Log.findByPk(id);
  if (!row) throw notFound("일지를 찾을 수 없습니다.");
  return serializeLog(row);
}

export async function createLog({ userId, title, content }) {
  if (typeof userId !== "string" || userId.length === 0) {
    throw badRequest("userId가 필요합니다.");
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw badRequest("title이 필요합니다.");
  }
  if (typeof content !== "string") {
    throw badRequest("content가 필요합니다.");
  }

  const user = await User.findByPk(userId);
  if (!user) throw notFound("사용자를 찾을 수 없습니다.");

  return sequelize.transaction(async (t) => {
    const log = await Log.create(
      {
        userId,
        title: title.trim(),
        content,
      },
      { transaction: t },
    );

    const earnAmount = 100;
    await CreditTransaction.create(
      {
        userId,
        logId: log.id,
        amount: earnAmount,
        type: CreditType.EARN,
        description: "일지 작성 적립",
      },
      { transaction: t },
    );
    await adjustUserCredits(userId, earnAmount, t);

    return serializeLog(log);
  });
}

export async function updateLog(rawId, { title, content }, { userId }) {
  const id = parseLogId(rawId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const log = await Log.findByPk(id);
  if (!log) throw notFound("일지를 찾을 수 없습니다.");
  if (userId && log.userId !== userId) {
    const err = new Error("본인 일지만 수정할 수 있습니다.");
    err.status = 403;
    throw err;
  }
  if (typeof title === "string" && title.trim().length > 0) {
    log.title = title.trim();
  }
  if (typeof content === "string") {
    log.content = content;
  }
  await log.save();
  return serializeLog(log);
}

export async function deleteLog(rawId, { userId }) {
  const id = parseLogId(rawId);
  if (id == null) throw notFound("일지를 찾을 수 없습니다.");
  const log = await Log.findByPk(id);
  if (!log) throw notFound("일지를 찾을 수 없습니다.");
  if (userId && log.userId !== userId) {
    const err = new Error("본인 일지만 삭제할 수 있습니다.");
    err.status = 403;
    throw err;
  }
  await log.destroy();
  return { ok: true };
}

// 첨부 조회/업로드/삭제는 controllers/attachment-controller.js 로 분리되었다.
