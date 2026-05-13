/**
 * /users 라우트 — HTTP 처리만 담당.
 * 데이터 접근은 user-controller / log-controller / credit-transaction-controller에 위임.
 */
import express from "express";
import * as userController from "../controllers/user-controller.js";
import * as logController from "../controllers/log-controller.js";
import * as creditController from "../controllers/credit-transaction-controller.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await userController.listUsers());
  } catch (err) {
    next(err);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const user = await userController.getUser(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:userId/logs", async (req, res, next) => {
  try {
    const user = await userController.getUser(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    res.json(await logController.listLogs({ userId: req.params.userId }));
  } catch (err) {
    next(err);
  }
});

router.get("/:userId/credit-transactions", async (req, res, next) => {
  try {
    const user = await userController.getUser(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    res.json(
      await creditController.listCreditTransactions({
        userId: req.params.userId,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
