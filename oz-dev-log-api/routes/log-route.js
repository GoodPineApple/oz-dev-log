/**
 * /logs 라우트 — HTTP 처리만.
 *
 * 인증(routes/index.js 의 requireAuth)을 통과하면 req.user 가 항상 채워져 있다고 가정한다.
 * 작성자(userId)는 body 가 아니라 토큰에서 가져온다 — 다른 사용자 사칭 방지.
 *
 * 첨부 업로드(POST /:logId/attachments)는 multipart/form-data 라서
 * 라우트 핸들러 앞에 multer 미들웨어(uploadSingleImage)를 끼워 넣는다.
 * multer 가 req.file 을 채우고, 컨트롤러가 그 buffer 를 저장소로 전달한다.
 */
import express from "express";
import * as logController from "../controllers/log-controller.js";
import * as attachmentController from "../controllers/attachment-controller.js";
import {
  multerErrorHandler,
  uploadSingleImage,
} from "../middleware/upload.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
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
      userId: req.user.id,
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
    res.json(await attachmentController.listAttachments(req.params.logId));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:logId/attachments",
  uploadSingleImage,
  multerErrorHandler,
  async (req, res, next) => {
    try {
      const att = await attachmentController.uploadAttachment(
        req.params.logId,
        { ownerId: req.user.id, file: req.file },
      );
      res.status(201).json(att);
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:logId/attachments/:attachmentId", async (req, res, next) => {
  try {
    const result = await attachmentController.deleteAttachment(
      req.params.logId,
      req.params.attachmentId,
      { ownerId: req.user.id },
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
