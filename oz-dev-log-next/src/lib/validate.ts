import { HttpError } from "./errors";

export function parseIntParam(value: string, label: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new HttpError(400, "VALIDATION", `유효하지 않은 ${label}입니다.`);
  }
  return n;
}
