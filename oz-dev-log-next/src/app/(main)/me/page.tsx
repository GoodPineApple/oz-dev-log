"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import type { ApiLog, CreditTransaction, Attachment } from "@/lib/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const typeLabel: Record<string, string> = {
  earn: "적립",
  spend: "사용",
  bonus: "보너스",
  adjust: "조정",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<CreditTransaction[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [txData, logsData] = await Promise.all([
        fetchApi<CreditTransaction[]>(
          `/api/credit-transactions?userId=${encodeURIComponent(user.id)}`,
        ),
        fetchApi<ApiLog[]>(`/api/logs?userId=${encodeURIComponent(user.id)}`),
      ]);
      setTxs(txData);

      const allAtts = await Promise.all(
        logsData.map((l) =>
          fetchApi<Attachment[]>(`/api/logs/${l.id}/attachments`),
        ),
      );
      setAttachments(allAtts.flat());
    } catch {
      // 데이터 로딩 실패 시 빈 상태 유지
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;
  const level = Math.floor(user.totalCredits / 500) + 1;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          마이 대시보드
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Next.js API Routes 백엔드의 크레딧과 첨부 데이터를 한 곳에서
          확인합니다.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            보유 크레딧
          </p>
          <p className="mt-2 text-3xl font-semibold text-violet-700 dark:text-violet-300">
            {user.totalCredits}{" "}
            <span className="text-lg font-medium text-zinc-500">CP</span>
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            레벨 (500 CP당 +1)
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            Lv. {level}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          내 일지의 첨부 파일
        </h2>
        {attachments.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            첨부가 없거나 아직 불러오지 못했습니다.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                  {a.fileName}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {a.fileType === "image" ? "이미지" : "파일"}
                </span>
                <a
                  href={a.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs text-violet-600 dark:text-violet-400"
                >
                  열기
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          크레딧 내역
        </h2>
        {txs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            아직 적립/사용 내역이 없습니다.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {[...txs]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
                >
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {t.amount > 0 ? "+" : ""}
                      {t.amount} CP
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">
                      {typeLabel[t.type] ?? t.type}
                    </span>
                    {t.description && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <time className="text-xs text-zinc-400">
                    {formatWhen(t.createdAt)}
                  </time>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
