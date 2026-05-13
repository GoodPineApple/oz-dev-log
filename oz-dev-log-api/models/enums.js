/**
 * 도메인 전체에서 공유하는 enum 값.
 * MySQL ENUM 컬럼과 일치시키기 위해 `Object.freeze`로 고정한다.
 */
export const AttachmentType = Object.freeze({
  IMAGE: "image",
  FILE: "file",
});

export const CreditType = Object.freeze({
  EARN: "earn",
  SPEND: "spend",
  BONUS: "bonus",
  ADJUST: "adjust",
});

export const ATTACHMENT_TYPES = Object.values(AttachmentType);
export const CREDIT_TYPES = Object.values(CreditType);
