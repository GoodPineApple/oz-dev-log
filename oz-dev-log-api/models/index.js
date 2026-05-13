/**
 * 모델 모듈 진입점.
 * import만 해도 모델 정의 + 관계 선언이 함께 적용된다.
 *
 * 학습 포인트(관계형 DB 관계 표현):
 *   User 1 — N Log
 *   Log  1 — N Attachment
 *   User 1 — N CreditTransaction
 *   Log  1 — N CreditTransaction (선택적)
 */
import { User } from "./User.js";
import { Log } from "./Log.js";
import { Attachment } from "./Attachment.js";
import { CreditTransaction } from "./CreditTransaction.js";

User.hasMany(Log, { foreignKey: "user_id", as: "logs" });
Log.belongsTo(User, { foreignKey: "user_id", as: "user" });

Log.hasMany(Attachment, {
  foreignKey: "log_id",
  as: "attachments",
  onDelete: "CASCADE",
  hooks: true,
});
Attachment.belongsTo(Log, { foreignKey: "log_id", as: "log" });

User.hasMany(CreditTransaction, {
  foreignKey: "user_id",
  as: "creditTransactions",
});
CreditTransaction.belongsTo(User, { foreignKey: "user_id", as: "user" });

Log.hasMany(CreditTransaction, {
  foreignKey: "log_id",
  as: "creditTransactions",
});
CreditTransaction.belongsTo(Log, { foreignKey: "log_id", as: "log" });

export { User, Log, Attachment, CreditTransaction };
export * from "./enums.js";
