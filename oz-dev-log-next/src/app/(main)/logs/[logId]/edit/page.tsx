"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";
import { MarkdownBody } from "@/components/MarkdownBody";
import { AttachmentManager } from "@/components/AttachmentManager";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import type { ApiLog } from "@/lib/types";

export default function EditLogPage() {
  const { logId: rawId } = useParams<{ logId: string }>();
  const logId = rawId ? decodeURIComponent(rawId) : "";
  const { user } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState(false);
  const hydratedRef = useRef(false);

  const load = useCallback(async () => {
    if (!logId) return;
    try {
      const data = await fetchApi<ApiLog>(`/api/logs/${logId}`);
      if (user && data.userId !== user.id) {
        show("본인 일지만 수정할 수 있습니다.");
        router.replace(`/logs/${logId}`);
        return;
      }
      if (!hydratedRef.current) {
        hydratedRef.current = true;
        setTitle(data.title);
        setContent(data.content);
        setHydrated(true);
      }
    } catch {
      show("일지를 찾을 수 없습니다.");
      router.replace("/");
    }
  }, [logId, user, router, show]);

  useEffect(() => {
    load();
  }, [load]);

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
      const updated = await fetchApi<ApiLog>(`/api/logs/${logId}`, {
        method: "PUT",
        body: JSON.stringify({ title: title.trim(), content }),
      });
      show("일지를 수정했습니다.");
      router.replace(`/logs/${updated.id}`);
    } catch (err) {
      show(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!hydrated) {
    return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          일지 수정
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          마크다운으로 작성하고 미리보기로 확인하세요. 이미지는 아래에서 바로
          업로드·삭제할 수 있습니다.
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
            {pending ? "저장 중…" : "저장"}
          </button>
          <Link
            href={`/logs/${logId}`}
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            완료
          </Link>
        </div>
      </form>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <AttachmentManager logId={Number(logId)} />
      </div>
    </div>
  );
}
