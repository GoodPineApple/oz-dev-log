import express from "express";
import {
  mockUsers,
  mockLogs,
  mockCreditTransactions,
} from "../model/mock-data.js";
import { useMockData } from "../model/runtimeConfig.js";
import { UserModel, userToJSON } from "../model/User.js";
import { LogModel, logToJSON } from "../model/Log.js";
import {
  CreditTransactionModel,
  creditTransactionToJSON,
} from "../model/CreditTransaction.js";

const router = express.Router();

/** GET /users — 사용자 목록 */
router.get("/", async (_req, res) => {
  if (useMockData()) {
    return res.json([...mockUsers]);
  }
  try {
    const rows = await UserModel.find().sort({ createdAt: 1 }).lean();
    res.json(rows.map((r) => userToJSON(r)).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

const userLogsRouter = express.Router({ mergeParams: true });

/** GET /users/:userId/logs — 특정 사용자의 개발 일지 목록 */
userLogsRouter.get("/", async (req, res) => {
  const { userId } = req.params;
  if (useMockData()) {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    const logs = mockLogs.filter((l) => l.userId === userId);
    return res.json(logs);
  }
  try {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    const rows = await LogModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows.map((r) => logToJSON(r)).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

router.use("/:userId/logs", userLogsRouter);

const userCreditsRouter = express.Router({ mergeParams: true });

/** GET /users/:userId/credit-transactions — 특정 사용자의 크레딧 내역 */
userCreditsRouter.get("/", async (req, res) => {
  const { userId } = req.params;
  if (useMockData()) {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    const rows = mockCreditTransactions.filter((t) => t.userId === userId);
    return res.json(rows);
  }
  try {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    const rows = await CreditTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows.map((r) => creditTransactionToJSON(r)).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

router.use("/:userId/credit-transactions", userCreditsRouter);

/** GET /users/:userId — 단일 사용자 */
router.get("/:userId", async (req, res) => {
  if (useMockData()) {
    const user = mockUsers.find((u) => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    return res.json(user);
  }
  try {
    const row = await UserModel.findById(req.params.userId).lean();
    const user = userToJSON(row);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
