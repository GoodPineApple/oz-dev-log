"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            DevLog Next — API 문서
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            이 페이지는 Next.js 서버 사이드에서 제공하는 REST API의 Swagger
            문서입니다. 클라이언트(React)는 이 API를 호출하여 데이터를
            주고받습니다.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            아래에서 각 엔드포인트를 직접 테스트해볼 수 있습니다. 먼저{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs">
              /api/auth/login
            </code>
            으로 토큰을 발급받은 뒤, 우측 상단 <strong>Authorize</strong> 버튼에
            입력하세요.
          </p>
        </div>
        <SwaggerUI url="/api/swagger" />
      </div>
    </div>
  );
}
