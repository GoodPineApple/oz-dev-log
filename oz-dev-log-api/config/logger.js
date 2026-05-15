/**
 * HTTP 요청 로깅 — morgan 래퍼.
 *
 * 학습 포인트:
 *   - morgan 은 Express 미들웨어. createApp 에서 app.use(httpLogger()) 한 줄로 끝.
 *   - 응답 한 건 = 로그 한 줄. HTTP 상태(200/4xx/5xx)에 색을 입혀
 *     터미널에서 시각적으로 즉시 구분된다.
 *   - 커스텀 토큰(:user-id, :error-code)으로 "누가 무엇을 요청했고, 어떤 에러로 끝났는지"
 *     를 같은 한 줄에 담는다. 글로벌 에러 핸들러가 res.locals.errorCode 를 채워주면
 *     morgan 이 그 값을 읽어 출력한다.
 *   - skip 옵션으로 노이즈(브라우저 프리플라이트 OPTIONS, 헬스체크 등)를 거른다.
 *
 * 출력 예시 (개발):
 *   GET /users 401 0.5 ms - 119 user=- [MISSING_TOKEN]
 *   POST /logs 201 12.3 ms - 234 user=abc-uuid -
 *   GET /no-such 404 0.4 ms - 80 user=- [ROUTE_NOT_FOUND]
 */
import morgan from "morgan";

// req.user 는 requireAuth 가 통과한 뒤에야 채워진다. 인증 전 요청에는 "-" 가 찍힌다.
morgan.token("user-id", (req) => req.user?.id ?? "-");

// errorHandler 가 res.locals.errorCode 에 HttpError.code 를 넣어둔다.
// 성공 응답이면 비어 있으므로 "-" 로 표기한다.
morgan.token("error-code", (_req, res) => res.locals?.errorCode ?? "-");

const RESET = "\x1b[0m";
function colorForStatus(status) {
  if (status >= 500) return "\x1b[31m"; // red
  if (status >= 400) return "\x1b[33m"; // yellow
  if (status >= 300) return "\x1b[36m"; // cyan
  if (status >= 200) return "\x1b[32m"; // green
  return RESET;
}

/**
 * 개발용 커스텀 포맷.
 * 표준 'dev' 포맷에 :user-id 와 :error-code 를 덧붙인 버전.
 * 상태 코드와 에러 코드는 색으로 강조해 한눈에 들어오게 한다.
 */
function devFormatLine(tokens, req, res) {
  const status = tokens.status(req, res) ?? "-";
  const color = colorForStatus(Number(status));
  const code = tokens["error-code"](req, res);
  const codeStr = code && code !== "-" ? `${color}[${code}]${RESET}` : "";
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    `${color}${status}${RESET}`,
    `${tokens["response-time"](req, res)} ms`,
    `- ${tokens.res(req, res, "content-length") ?? 0}`,
    `user=${tokens["user-id"](req, res)}`,
    codeStr,
  ]
    .filter(Boolean)
    .join(" ");
}

const PROD_FORMAT =
  ':remote-addr :user-id [:date[iso]] ":method :url HTTP/:http-version" :status :error-code :res[content-length] - :response-time ms ":referrer" ":user-agent"';

function shouldSkip(req) {
  // CORS 프리플라이트 — 라우팅이 아니라 헤더 협상이라 로그를 남길 가치가 없다.
  if (req.method === "OPTIONS") return true;
  // 루트 헬스체크. 별도 헬스 라우트가 생기면 이 분기를 갱신한다.
  if (req.method === "GET" && req.path === "/") return true;
  return false;
}

export function httpLogger() {
  const isProduction = process.env.NODE_ENV === "production";
  const format = isProduction ? PROD_FORMAT : devFormatLine;
  return morgan(format, { skip: (req) => shouldSkip(req) });
}
