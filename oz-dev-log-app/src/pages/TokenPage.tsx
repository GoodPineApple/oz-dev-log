import { Link } from 'react-router-dom'
import { TokenInspector } from '../components/TokenInspector'
import { useBackend } from '../hooks/useBackend'
import { backendUsesJwt } from '../lib/backend'

export function TokenPage() {
  const [backend] = useBackend()
  const isJwt = backendUsesJwt(backend)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          JWT 인스펙터
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          현재 브라우저에 저장된 토큰의 내부를 들여다봅니다. 변조·만료가 어떻게
          동작하는지 직접 실험해 보세요.
        </p>
      </div>

      {!isJwt && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          현재 백엔드는 JWT 를 사용하지 않습니다. 헤더의 자물쇠 아이콘이나 로그인
          화면에서 백엔드를{' '}
          <strong>API (JWT 인증)</strong> 로 전환하세요.
        </p>
      )}

      <TokenInspector />

      <details className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer select-none font-semibold text-zinc-800 dark:text-zinc-200">
          이 토큰은 어떻게 만들어졌나요?
        </summary>
        <ol className="mt-3 space-y-2 pl-5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 [&>li]:list-decimal">
          <li>
            <strong>서버</strong>는 로그인 성공 시{' '}
            <code className="font-mono">
              jwt.sign(&#123; sub: userId &#125;, JWT_SECRET, &#123; expiresIn &#125;)
            </code>{' '}
            로 토큰을 발급합니다.
          </li>
          <li>
            토큰은 <strong>헤더.페이로드.서명</strong> 세 부분으로 구성됩니다.
            앞 두 부분은 base64url 인코딩된 JSON 이며 누구나 디코드 가능합니다.
          </li>
          <li>
            서명(signature)은{' '}
            <code className="font-mono">HMAC_SHA256(header.payload, SECRET)</code>{' '}
            의 결과입니다. <code className="font-mono">JWT_SECRET</code> 을
            모르면 위·변조 불가능합니다.
          </li>
          <li>
            <strong>클라이언트</strong>는 토큰을 localStorage 에 저장하고, 모든
            요청에{' '}
            <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>{' '}
            로 부착합니다.
          </li>
          <li>
            서버 미들웨어가{' '}
            <code className="font-mono">jwt.verify(token, JWT_SECRET)</code> 로
            서명을 검증하고 만료(exp)도 함께 본 뒤, 통과하면{' '}
            <code className="font-mono">req.user.id = payload.sub</code> 으로
            요청을 처리합니다.
          </li>
        </ol>
      </details>

      <Link
        to="/"
        className="inline-block text-sm text-violet-600 dark:text-violet-400"
      >
        ← 타임라인으로
      </Link>
    </div>
  )
}
