import express from "express";
import { mockLogs, mockAttachments } from "../model/mock-data.js";

const router = express.Router();

function parseLogId(param) {
  const n = Number(param);
  return Number.isInteger(n) && String(n) === param ? n : NaN;
}

/** GET /logs — 일지 목록 (?userId= 로 필터) */
router.get("/", (req, res) => {
  const userId = req.query.userId;
  let items = [...mockLogs];
  if (typeof userId === "string" && userId.length > 0) {
    items = items.filter((l) => l.userId === userId);
  }
  res.json(items);
});

/** GET /logs/:logId/attachments — 일지별 첨부 목록 */
router.get("/:logId/attachments", (req, res) => {
  const logId = parseLogId(req.params.logId);
  if (Number.isNaN(logId)) {
    return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
  }
  const log = mockLogs.find((l) => l.id === logId);
  if (!log) {
    return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
  }
  const attachments = mockAttachments.filter((a) => a.logId === logId);
  res.json(attachments);
});

/** GET /logs/:logId — 단일 일지 */
router.get("/:logId", (req, res) => {
  const logId = parseLogId(req.params.logId);
  if (Number.isNaN(logId)) {
    return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
  }
  const log = mockLogs.find((l) => l.id === logId);
  if (!log) {
    return res.status(404).json({ error: "일지를 찾을 수 없습니다." });
  }
  res.json(log);
});

export default router;
