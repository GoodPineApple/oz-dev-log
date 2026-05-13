/**
 * /credit-transactions 라우트 — HTTP 처리만.
 *
 * 인증을 가정한다 (mountRoutes 에서 requireAuth 적용). req.user.id 가 항상 있다.
 */
import express from "express";
import * as creditController from "../controllers/credit-transaction-controller.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userId =
      typeof req.query.userId === "string" && req.query.userId.length > 0
        ? req.query.userId
        : req.user.id;
    res.json(await creditController.listCreditTransactions({ userId }));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const tx = await creditController.createCreditTransaction({
      ...(req.body ?? {}),
      userId: req.user.id, // 작성자는 토큰에서 가져온다.
    });
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await creditController.getCreditTransaction(req.params.id));
  } catch (err) {
    next(err);
  }
});

export default router;
