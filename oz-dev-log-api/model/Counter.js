/**
 * 숫자 id 시퀀스 (Log / Attachment / CreditTransaction용).
 * API는 기존과 같이 number id를 유지합니다.
 */
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { collection: "counters", versionKey: false },
);

export const CounterModel =
  mongoose.models.Counter ?? mongoose.model("Counter", counterSchema);

/**
 * @param {string} name — 'log' | 'attachment' | 'creditTransaction' 등
 * @returns {Promise<number>}
 */
export async function nextSeq(name) {
  const doc = await CounterModel.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean();
  if (!doc || typeof doc.seq !== "number") {
    throw new Error(`counter 실패: ${name}`);
  }
  return doc.seq;
}
