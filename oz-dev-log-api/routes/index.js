import authRoute from "./auth-route.js";
import userRoute from "./user-route.js";
import logRoute from "./log-route.js";
import creditTransactionRoute from "./credit-transaction-route.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * 라우트 매핑.
 *
 *   /auth/*                  ← 공개 (register/login은 인증 없이, me는 라우터 내부에서 인증)
 *   /users/*                 ← 보호 (Bearer token 필요)
 *   /logs/*                  ← 보호
 *   /credit-transactions/*   ← 보호
 *
 * 라우터 mount 시점에 requireAuth 를 통째로 걸어 두면, 각 라우트가 "이 요청은 인증된 사용자"
 * 라는 가정 위에서 동작한다 — req.user.id 를 그대로 사용 가능.
 */
export function mountRoutes(app) {
  app.use("/auth", authRoute);
  app.use("/users", requireAuth, userRoute);
  app.use("/logs", requireAuth, logRoute);
  app.use("/credit-transactions", requireAuth, creditTransactionRoute);
}
