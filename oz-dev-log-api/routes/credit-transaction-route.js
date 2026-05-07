import express from "express";
import { mockCreditTransactions } from "../model/mock-data.js";

const router = express.Router();

function parseId(param) {
  const n = Number(param);
  return Number.isInteger(n) && String(n) === param ? n : NaN;
}

/** GET /credit-transactions — 크레딧 내역 (?userId= 로 필터) */
router.get("/", (req, res) => {
  const userId = req.query.userId;
  let items = [...mockCreditTransactions];
  if (typeof userId === "string" && userId.length > 0) {
    items = items.filter((t) => t.userId === userId);
  }
  res.json(items);
});

/** GET /credit-transactions/:id — 단일 내역 */
router.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(404).json({ error: "내역을 찾을 수 없습니다." });
  }
  const row = mockCreditTransactions.find((t) => t.id === id);
  if (!row) {
    return res.status(404).json({ error: "내역을 찾을 수 없습니다." });
  }
  res.json(row);
});

export default router;
