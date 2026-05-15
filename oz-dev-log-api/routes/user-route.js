/**
 * /users 라우트 — HTTP 처리만 담당.
 * 데이터 접근은 user-controller / log-controller / credit-transaction-controller에 위임.
 *
 * 학습 포인트:
 *   - 컨트롤러가 HttpError 를 던지면 라우트는 별도 404 분기를 둘 필요가 없다.
 *   - try/catch 도 next(err) 한 줄로 끝 — 글로벌 에러 핸들러가 응답을 일원화한다.
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
    res.json(await userController.getUser(req.params.userId));
  } catch (err) {
    next(err);
  }
});

router.get("/:userId/logs", async (req, res, next) => {
  try {
    // 사용자 존재 여부는 getUser 가 404 로 보장. 통과하면 일지 목록을 그대로 반환.
    await userController.getUser(req.params.userId);
    res.json(await logController.listLogs({ userId: req.params.userId }));
  } catch (err) {
    next(err);
  }
});

router.get("/:userId/credit-transactions", async (req, res, next) => {
  try {
    await userController.getUser(req.params.userId);
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
