"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";
import { setStoredToken } from "@/lib/client-auth";
import { useAuth } from "@/components/AuthProvider";
import type { AuthResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  if (!loading && user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const { token } = await fetchApi<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(token);
      refresh();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          DevLog
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Next.js 풀스택 프로젝트 — 이메일과 비밀번호로 로그인하세요.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">
            로그인
          </p>

          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {pending ? "로그인 중…" : "로그인"}
          </button>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>계정이 없으세요?</span>
            <Link
              href="/register"
              className="font-medium text-violet-600 dark:text-violet-400"
            >
              회원가입
            </Link>
          </div>

          <p className="rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-relaxed text-zinc-500 dark:bg-zinc-800">
            데모 계정:{" "}
            <code className="font-mono">alice@example.com</code> 또는{" "}
            <code className="font-mono">bob@example.com</code> /{" "}
            <code className="font-mono">password123</code>
          </p>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-zinc-400">
          <Link href="/api-docs" className="hover:text-violet-600">
            API 문서 (Swagger)
          </Link>
        </div>
      </div>
    </div>
  );
}
