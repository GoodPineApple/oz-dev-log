/**
 * 도메인 enum 값. Mongoose 스키마의 enum 옵션과 함께 쓴다.
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
