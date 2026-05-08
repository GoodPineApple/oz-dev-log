import express from "express";
import { mockCreditTransactions } from "../model/mock-data.js";
import { useMockData } from "../model/runtimeConfig.js";
import { CreditTransactionModel, creditTransactionToJSON } from "../model/CreditTransaction.js";

const router = express.Router();

function parseId(param) {
  const n = Number(param);
  return Number.isInteger(n) && String(n) === param ? n : NaN;
}

/** GET /credit-transactions — 크레딧 내역 (?userId= 로 필터) */
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  if (useMockData()) {
    let items = [...mockCreditTransactions];
    if (typeof userId === "string" && userId.length > 0) {
      items = items.filter((t) => t.userId === userId);
    }
    return res.json(items);
  }
  try {
    const where =
      typeof userId === "string" && userId.length > 0 ? { userId } : {};
    const rows = await CreditTransactionModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    res.json(rows.map((r) => creditTransactionToJSON(r)).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

/** GET /credit-transactions/:id — 단일 내역 */
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(404).json({ error: "내역을 찾을 수 없습니다." });
  }
  if (useMockData()) {
    const row = mockCreditTransactions.find((t) => t.id === id);
    if (!row) {
      return res.status(404).json({ error: "내역을 찾을 수 없습니다." });
    }
    return res.json(row);
  }
  try {
    const row = await CreditTransactionModel.findByPk(id);
    const tx = creditTransactionToJSON(row);
    if (!tx) {
      return res.status(404).json({ error: "내역을 찾을 수 없습니다." });
    }
    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
