/**
 * /auth 라우트.
 *
 *   POST /auth/register   { email, password, nickname }  → { user, token }
 *   POST /auth/login      { email, password }            → { user, token }
 *   GET  /auth/me         (requires Bearer token)        → user
 *
 * register/login 은 토큰을 발급하므로 인증 미들웨어 없이 통과시킨다.
 * me 는 토큰을 검증해 본인 정보를 돌려준다.
 */
import express from "express";
import * as authController from "../controllers/auth-controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = await authController.register(req.body ?? {});
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authController.login(req.body ?? {});
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await authController.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
