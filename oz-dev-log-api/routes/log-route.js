import express from "express";
import { mockLogs, mockAttachments } from "../model/mock-data.js";
import { useMockData } from "../model/runtimeConfig.js";
import { LogModel, logToJSON } from "../model/Log.js";
import { attachmentToJSON } from "../model/Attachment.js";

const router = express.Router();

function parseLogId(param) {
  const n = Number(param);
  return Number.isInteger(n) && String(n) === param ? n : NaN;
}

/** GET /logs — 일지 목록 (?userId= 로 필터) */
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  if (useMockData()) {
    let items = [...mockLogs];
    if (typeof userId === "string" && userId.length > 0) {
      items = items.filter((l) => l.userId === userId);
    }
    return res.json(items);
  }
  try {
    const where =
      typeof userId === "string" && userId.length > 0 ? { userId } : {};
    const rows = await LogModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    res.json(rows.map((r) => logToJSON(r)).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

/** GET /logs/:logId/attachments — 일지별 첨부 목록 */
router.get("/:logId/attachments", async (req, res) => {
  const logId = parseLogId(req.params.logId);
  if (Number.isNaN(logId)) {
    return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
  }
  if (useMockData()) {
    const log = mockLogs.find((l) => l.id === logId);
    if (!log) {
      return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
    }
    const attachments = mockAttachments.filter((a) => a.logId === logId);
    return res.json(attachments);
  }
  try {
    const log = await LogModel.findByPk(logId);
    if (!log) {
      return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
    }
    const rows = await log.getAttachments({
      order: [["createdAt", "ASC"]],
    });
    res.json(rows.map((r) => attachmentToJSON(r)).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

/** GET /logs/:logId — 단일 일지 */
router.get("/:logId", async (req, res) => {
  const logId = parseLogId(req.params.logId);
  if (Number.isNaN(logId)) {
    return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
  }
  if (useMockData()) {
    const log = mockLogs.find((l) => l.id === logId);
    if (!log) {
      return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
    }
    return res.json(log);
  }
  try {
    const row = await LogModel.findByPk(logId);
    const log = logToJSON(row);
    if (!log) {
      return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
    }
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
