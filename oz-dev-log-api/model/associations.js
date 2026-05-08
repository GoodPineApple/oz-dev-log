/**
 * Sequelize 모델 간 관계 정의 (각 엔티티는 User.js, Log.js 등에 정의됨).
 */
import { UserModel } from "./User.js";
import { LogModel } from "./Log.js";
import { AttachmentModel } from "./Attachment.js";
import { CreditTransactionModel } from "./CreditTransaction.js";

UserModel.hasMany(LogModel, { foreignKey: "user_id", as: "logs" });
LogModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });

LogModel.hasMany(AttachmentModel, {
  foreignKey: "log_id",
  as: "attachments",
});
AttachmentModel.belongsTo(LogModel, { foreignKey: "log_id", as: "log" });

UserModel.hasMany(CreditTransactionModel, {
  foreignKey: "user_id",
  as: "creditTransactions",
});
CreditTransactionModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "user",
});

LogModel.hasMany(CreditTransactionModel, {
  foreignKey: "log_id",
  as: "creditTransactions",
});
CreditTransactionModel.belongsTo(LogModel, {
  foreignKey: "log_id",
  as: "log",
});
