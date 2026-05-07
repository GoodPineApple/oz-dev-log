/**
 * DB에서 다음과 같이 정의한다고 가정합니다.
 *
 * CREATE TYPE attachment_type AS ENUM ('image', 'file');
 * CREATE TYPE credit_type AS ENUM ('earn', 'spend', 'bonus', 'adjust');
 */

/** @readonly */
export const AttachmentType = Object.freeze({
  IMAGE: "image",
  FILE: "file",
});

/** @readonly */
export const CreditType = Object.freeze({
  /** 일지 작성 등 기본 적립 */
  EARN: "earn",
  /** 크레딧 사용(차감) */
  SPEND: "spend",
  /** 연속 기록·이벤트 등 보너스 */
  BONUS: "bonus",
  /** 수동 조정 */
  ADJUST: "adjust",
});

/** @param {unknown} value */
export function isAttachmentType(value) {
  return value === AttachmentType.IMAGE || value === AttachmentType.FILE;
}

/** @param {unknown} value */
export function isCreditType(value) {
  return (
    value === CreditType.EARN ||
    value === CreditType.SPEND ||
    value === CreditType.BONUS ||
    value === CreditType.ADJUST
  );
}
