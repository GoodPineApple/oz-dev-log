"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import type { ApiLog, Attachment } from "@/lib/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default function LogDetailPage() {
  const { logId: rawId } = useParams<{ logId: string }>();
  const logId = rawId ? decodeURIComponent(rawId) : "";
  const { user } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const [log, setLog] = useState<ApiLog | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!logId) return;
    try {
      const data = await fetchApi<ApiLog>(`/api/logs/${logId}`);
      setLog(data);
      const atts = await fetchApi<Attachment[]>(
        `/api/logs/${logId}/attachments`,
      );
      setAttachments(atts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "일지를 찾을 수 없습니다.",
      );
    }
  }, [logId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/logs/${logId}`, { method: "DELETE" });
      show("일지를 삭제했습니다.");
      router.replace("/");
    } catch (err) {
      show(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    return <p className="text-sm text-zinc-500">{error}</p>;
  }
  if (!log) {
    return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  }

  const isMine = user && log.userId === user.id;

  return (
    <article className="space-y-6">
      <div className="text-xs text-zinc-400">{formatWhen(log.createdAt)}</div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {log.title}
      </h1>
      <MarkdownBody markdown={log.content} />

      {attachments.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            첨부
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {attachments.map((a) =>
              a.fileType === "image" ? (
                <li key={a.id}>
                  <a href={a.fileUrl} target="_blank" rel="noreferrer">
                    <Image
                      src={a.fileUrl}
                      alt={a.fileName}
                      width={400}
                      height={224}
                      unoptimized
                      className="max-h-56 w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                  </a>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {a.fileName}
                  </p>
                </li>
              ) : (
                <li key={a.id}>
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-violet-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-violet-300"
                  >
                    <span className="truncate font-medium">{a.fileName}</span>
                  </a>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {isMine && (
          <>
            <Link
              href={`/logs/${logId}/edit`}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              수정
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {deleting ? "삭제 중…" : "삭제"}
            </button>
          </>
        )}
        <Link
          href="/"
          className="ml-auto text-sm text-violet-600 dark:text-violet-400"
        >
          ← 목록
        </Link>
      </div>
    </article>
  );
}
