/**
 * /credit-transactions 라우트 — HTTP 처리만.
 */
import express from "express";
import * as creditController from "../controllers/credit-transaction-controller.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined;
    res.json(await creditController.listCreditTransactions({ userId }));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const tx = await creditController.createCreditTransaction(req.body ?? {});
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
