/**
 * 모델 모듈 진입점.
 *
 * 학습 포인트(MongoDB 관계 표현):
 *   - 외래키 제약은 DB가 아닌 애플리케이션 레벨에서 책임진다.
 *   - 조회 시 populate()로 참조를 채울 수 있다.
 */
import { User } from "./User.js";
import { Log } from "./Log.js";
import { Attachment } from "./Attachment.js";
import { CreditTransaction } from "./CreditTransaction.js";

export { User, Log, Attachment, CreditTransaction };
export * from "./enums.js";
