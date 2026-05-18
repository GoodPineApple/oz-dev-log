"use client";

import { useState, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useToast } from "@/components/ToastProvider";
import type { ApiLog } from "@/lib/types";

export default function NewLogPage() {
  const router = useRouter();
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [pending, setPending] = useState(false);

  const previewBody = useMemo(
    () => content || "_내용을 입력하면 여기에 렌더됩니다._",
    [content],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      show("제목을 입력해 주세요.");
      return;
    }
    setPending(true);
    try {
      const created = await fetchApi<ApiLog>("/api/logs", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), content }),
      });
      show("일지를 저장했습니다. (+100 CP) 이어서 이미지를 첨부할 수 있어요.");
      router.replace(`/logs/${created.id}/edit`);
    } catch (err) {
      show(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          새 일지
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          먼저 제목과 본문을 저장하면 이어서 이미지를 첨부할 수 있습니다. 작성 시
          자동으로 100 CP가 적립됩니다.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            한 줄 요약 (제목)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="예: React Query 캐시 키 설계"
          />
        </div>

        <div className="flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === "write" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            작성
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === "preview" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            미리보기
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={tab === "preview" ? "hidden lg:block" : ""}>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              본문 (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="mt-1 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder={"## 배운 점\n- …\n\n```ts\nconst x = 1\n```"}
            />
          </div>
          <div className={tab === "write" ? "hidden lg:block" : ""}>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              미리보기
            </span>
            <div className="mt-1 min-h-[28rem] rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
              <MarkdownBody markdown={previewBody} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {pending ? "저장 중…" : "저장하고 첨부 추가"}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
