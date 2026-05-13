/**
 * /logs 라우트 — HTTP 처리만.
 *
 * 인증(routes/index.js 의 requireAuth)을 통과하면 req.user 가 항상 채워져 있다고 가정한다.
 * 따라서 작성자(userId)는 body 가 아니라 토큰에서 가져온다. 클라이언트가 다른 사용자
 * 행세를 하지 못하게 만드는 핵심 패턴.
 */
import express from "express";
import * as logController from "../controllers/log-controller.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    // ?userId= 가 없으면 본인 일지만 보여준다.
    const userId =
      typeof req.query.userId === "string" && req.query.userId.length > 0
        ? req.query.userId
        : req.user.id;
    res.json(await logController.listLogs({ userId }));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const log = await logController.createLog({
      ...(req.body ?? {}),
      userId: req.user.id, // body 의 userId 는 무시하고 토큰의 sub 로 강제.
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

router.get("/:logId", async (req, res, next) => {
  try {
    res.json(await logController.getLog(req.params.logId));
  } catch (err) {
    next(err);
  }
});

router.put("/:logId", async (req, res, next) => {
  try {
    const log = await logController.updateLog(
      req.params.logId,
      req.body ?? {},
      { userId: req.user.id },
    );
    res.json(log);
  } catch (err) {
    next(err);
  }
});

router.delete("/:logId", async (req, res, next) => {
  try {
    res.json(
      await logController.deleteLog(req.params.logId, { userId: req.user.id }),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/:logId/attachments", async (req, res, next) => {
  try {
    res.json(await logController.listAttachments(req.params.logId));
  } catch (err) {
    next(err);
  }
});

router.post("/:logId/attachments", async (req, res, next) => {
  try {
    const att = await logController.createAttachment(
      req.params.logId,
      req.body ?? {},
    );
    res.status(201).json(att);
  } catch (err) {
    next(err);
  }
});

export default router;
