import express from "express";
import {
  mockUsers,
  mockLogs,
  mockCreditTransactions,
} from "../model/mock-data.js";

const router = express.Router();

/** GET /users — 사용자 목록 */
router.get("/", (_req, res) => {
  res.json([...mockUsers]);
});

const userLogsRouter = express.Router({ mergeParams: true });

/** GET /users/:userId/logs — 특정 사용자의 개발 일지 목록 */
userLogsRouter.get("/", (req, res) => {
  const { userId } = req.params;
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }
  const logs = mockLogs.filter((l) => l.userId === userId);
  res.json(logs);
});

router.use("/:userId/logs", userLogsRouter);

const userCreditsRouter = express.Router({ mergeParams: true });

/** GET /users/:userId/credit-transactions — 특정 사용자의 크레딧 내역 */
userCreditsRouter.get("/", (req, res) => {
  const { userId } = req.params;
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }
  const rows = mockCreditTransactions.filter((t) => t.userId === userId);
  res.json(rows);
});

router.use("/:userId/credit-transactions", userCreditsRouter);

/** GET /users/:userId — 단일 사용자 */
router.get("/:userId", (req, res) => {
  const user = mockUsers.find((u) => u.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }
  res.json(user);
});

export default router;
