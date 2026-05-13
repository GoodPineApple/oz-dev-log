import { useEffect, useMemo, useState } from "react";
import {
  clearStoredToken,
  decodeJwt,
  getStoredToken,
  onTokenChange,
} from "../lib/auth";

/**
 * JWT 학습용 인스펙터.
 *
 *   1) localStorage 에 저장된 토큰의 원문(header.payload.signature)을 보여준다.
 *   2) header / payload 를 base64url 디코드해 JSON 으로 표시한다.
 *   3) iat / exp 를 사람이 읽을 수 있는 시각과 남은 시간으로 환산한다.
 *   4) 변조/만료 시나리오를 체험할 수 있게 "토큰 망가뜨리기" 버튼을 제공한다.
 *
 * 모든 디코드는 클라이언트에서 수행하며, 서명 검증은 서버만 가능하다.
 */

function formatRelative(seconds: number): string {
  const abs = Math.abs(seconds);
  const sign = seconds < 0 ? "지남" : "뒤";
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  if (h > 0) return `${h}시간 ${m}분 ${sign}`;
  if (m > 0) return `${m}분 ${s}초 ${sign}`;
  return `${s}초 ${sign}`;
}

function tsToLocale(unixSeconds?: number) {
  if (!unixSeconds || !Number.isFinite(unixSeconds)) return "-";
  return new Date(unixSeconds * 1000).toLocaleString("ko-KR");
}

export function TokenInspector() {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [copied, setCopied] = useState(false);

  useEffect(() => onTokenChange(() => setToken(getStoredToken())), []);

  useEffect(() => {
    const id = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);

  const decoded = useMemo(() => (token ? decodeJwt(token) : null), [token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        저장된 JWT 가 없습니다. JWT 백엔드(api)에서 로그인하면 여기에 토큰이
        표시됩니다.
      </div>
    );
  }
  if (!decoded) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        토큰을 디코드할 수 없습니다. 형식이 올바르지 않습니다.
      </div>
    );
  }

  const [headerPart, payloadPart, signaturePart] = token.split(".");
  const exp =
    typeof decoded.payload.exp === "number" ? decoded.payload.exp : undefined;
  const iat =
    typeof decoded.payload.iat === "number" ? decoded.payload.iat : undefined;
  const remaining = exp != null ? exp - now : undefined;
  const isExpired = remaining != null && remaining <= 0;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            발급된 JWT (localStorage)
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(token);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {copied ? "복사됨!" : "복사"}
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("devlog:token", token + "TAMPER");
                window.dispatchEvent(new CustomEvent("devlog-token-changed"));
              }}
              className="rounded-lg border border-amber-200 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
              title="토큰 끝에 글자를 붙여 서명을 깨뜨립니다. 다음 요청부터 401이 옵니다."
            >
              변조해 보기
            </button>
            <button
              type="button"
              onClick={() => clearStoredToken()}
              className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              로그아웃 (토큰 삭제)
            </button>
          </div>
        </header>

        <p className="mt-3 break-all rounded-xl bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          <span className="text-rose-600 dark:text-rose-400">{headerPart}</span>
          <span className="text-zinc-400">.</span>
          <span className="text-violet-600 dark:text-violet-400">
            {payloadPart}
          </span>
          <span className="text-zinc-400">.</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            {signaturePart}
          </span>
        </p>
        <p className="mt-2 text-[11px] text-zinc-500">
          빨강 = 헤더, 보라 = 페이로드, 초록 = 서명. 각 부분은 base64url
          인코딩이며 <code className="font-mono">.</code> 로 구분된다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
            Header
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 font-mono text-[11px] text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {JSON.stringify(decoded.header, null, 2)}
          </pre>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            Payload
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 font-mono text-[11px] text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {JSON.stringify(decoded.payload, null, 2)}
          </pre>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          시간 정보
        </h3>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-zinc-500">발급 시각 (iat)</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {tsToLocale(iat)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">만료 시각 (exp)</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {tsToLocale(exp)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">남은 시간</dt>
            <dd
              className={
                "font-semibold " +
                (isExpired
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400")
              }
            >
              {remaining != null ? formatRelative(remaining) : "-"}
            </dd>
          </div>
        </dl>
        {isExpired && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            토큰이 만료되었습니다. 다음 요청은 401 을 받게 되며, 자동으로 로그인
            화면으로 이동합니다.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          요청이 보내질 헤더
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {`Authorization: Bearer ${token}`}
        </pre>
        <p className="mt-2 text-xs text-zinc-500">
          모든 보호된 엔드포인트 요청에 이 헤더가 함께 나간다
          (src/api/client.ts). 서버의{" "}
          <code className="font-mono">middleware/auth.js</code> 가 이를 꺼내
          서명을 검증한다.
        </p>
      </section>
    </div>
  );
}
