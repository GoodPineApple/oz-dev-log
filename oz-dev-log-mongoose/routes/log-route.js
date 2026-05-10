/**
 * /logs 라우트 — HTTP 처리만.
 */
import express from "express";
import * as logController from "../controllers/log-controller.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    res.json(await logController.listLogs({ userId }));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const log = await logController.createLog(req.body ?? {});
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
    const userId =
      typeof req.body?.userId === "string" ? req.body.userId : undefined;
    const log = await logController.updateLog(
      req.params.logId,
      req.body ?? {},
      { userId },
    );
    res.json(log);
  } catch (err) {
    next(err);
  }
});

router.delete("/:logId", async (req, res, next) => {
  try {
    const userId =
      typeof req.query?.userId === "string" ? req.query.userId : undefined;
    res.json(await logController.deleteLog(req.params.logId, { userId }));
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
