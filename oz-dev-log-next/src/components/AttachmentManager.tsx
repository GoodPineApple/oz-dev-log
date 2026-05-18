"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api-client";
import { useToast } from "./ToastProvider";
import type { Attachment } from "@/lib/types";

export function AttachmentManager({ logId }: { logId: number }) {
  const { show } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchApi<Attachment[]>(`/api/logs/${logId}/attachments`);
      setAttachments(data);
    } catch {
      // 첨부 목록 로딩 실패 시 빈 상태 유지
    }
  }, [logId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await fetchApi<Attachment>(`/api/logs/${logId}/attachments`, {
        method: "POST",
        body: fd,
      });
      show("첨부를 업로드했습니다.");
      load();
    } catch (err) {
      show(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onDelete(attachmentId: number) {
    if (!confirm("첨부를 삭제하시겠습니까?")) return;
    try {
      await fetchApi(`/api/logs/${logId}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      show("첨부를 삭제했습니다.");
      load();
    } catch (err) {
      show(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        첨부 파일
      </h2>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-sm text-zinc-600 transition hover:border-violet-400 hover:text-violet-700 dark:border-zinc-600 dark:text-zinc-400">
        <span>{uploading ? "업로드 중…" : "파일 선택"}</span>
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {attachments.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {a.fileName}
              </span>
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                className="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
