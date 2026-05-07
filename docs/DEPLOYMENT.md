# 배포 가이드 (oz-dev-log)

Vite + React SPA(`oz-dev-log-app`)와 Express API(`oz-dev-log-api`)를 어떻게 올릴지에 따른 **배포 패턴**과 **필수 조치**를 정리합니다.  
구현 세부사항·엔드포인트는 [`PROJECT_SPEC.md`](./PROJECT_SPEC.md)를 참고하세요.

---

## 1. 개발과 프로덕션의 차이 (Vite 프록시)

- `vite.config.ts`의 **`server.proxy`는 `vite dev` 전용**입니다. `npm run build` 결과물(`dist`)에는 포함되지 않습니다.
- **`VITE_API_BASE_URL`을 비운 채** 상대 경로(`/users` 등)로만 호출하면, 로컬에서는 Vite가 API로 넘겨 주지만 **프로덕션 정적 호스팅만** 두면 같은 요청은 **프론트 도메인**으로 가서 404 등이 날 수 있습니다.
- 팀이 택한 배포 모델에 맞추는 것이 중요합니다.
  - **교차 오리진**(프론트·API 호스트 분리)이 확정이면, 로컬부터 **`VITE_API_BASE_URL` + API CORS**로 맞추는 편이 동작이 일관됩니다.
  - **단일 오리진**(같은 호스트에서 경로만 분리)이면, 상대 경로 + **프로덕션에서도** 게이트웨이/Express가 API를 같은 오리진으로 노출해야 합니다.

자동화 측면에서는 **CI/호스팅 시크릿에 환경 변수를 두고** 빌드·배포하며, **스테이징에서 프로덕션과 동일한 호출 방식**을 검증하는 것을 권장합니다.

---

## 2. 공통으로 거의 항상 필요한 조치

| 항목 | 설명 |
|------|------|
| 프론트 빌드 | 루트에서 `npm run build` → `oz-dev-log-app/dist` |
| API 실행 | Node 런타임, `PORT`, 운영 시 `NODE_ENV=production` 권장 |
| HTTPS | 공개 서비스는 TLS(호스팅·로드밸런서에서 처리하는 경우가 많음) |
| 환경 변수 | 프론트: 빌드 시점 `VITE_*` / API: 런타임 `.env`·시크릿 |
| 비밀 | `.env`는 커밋하지 않음(루트 `.gitignore` 참고) |

---

## 3. 브라우저 “같은 오리진”이란

**프로토콜 + 호스트 + 포트**가 같으면 같은 오리진입니다.

- `https://app.example.com` 과 `https://app.example.com/api/...` → **동일**
- `https://app.example.com` 과 `https://api.example.com` → **다름**(교차 오리진 → CORS 등 고려)

---

## 4. 배포 경우의 수와 조치

### 케이스 A — Express 하나가 정적(`dist`) + API (단일 오리진)

**형태:** 한 프로세스(또는 같은 `호스트:포트`)에서 React 빌드물과 API를 함께 제공.

**필요한 조치**

1. CI 또는 배포 단계에서 프론트 `npm run build` 후 `dist`를 API 서버가 읽는 경로에 둡니다.
2. Express에 **`express.static('dist')`** 설정.
3. React Router 사용 시, API가 처리하지 않는 **GET 요청에 대해 `index.html` 폴백**(순서: API 먼저, static, 마지막 폴백).
4. **API 경로와 브라우저 경로 충돌 방지** — 이 저장소는 현재 API가 `/users`, `/logs` 등 루트에 붙어 있어, SPA와 겹치지 않게 하려면 **`/api` 등 prefix로 API를 묶는** 방식이 일반적입니다.
5. 프론트는 **`VITE_API_BASE_URL` 비우기** 또는 **`/api` 상대 경로**로 통일 가능 → 브라우저 입장에선 같은 오리진이라 CORS 부담이 적습니다.

**장점:** 구성이 단순. **단점:** 정적·API를 인프라 레벨에서 완전 분리하기는 상대적으로 어렵습니다.

---

### 케이스 B — 정적 호스팅 + API 서버 분리 (교차 오리진)

**형태:** 예) S3+CloudFront, Netlify, Vercel 등에 SPA / EC2·ECS·Lambda·Railway 등에 API.

**필요한 조치**

1. 프론트 빌드 시 **`VITE_API_BASE_URL`** 에 **공개 API의 절대 URL**을 넣습니다(환경별로 CI·호스팅에서 주입).
2. Express(API)에 **CORS**: 프론트의 **정확한 Origin** 허용. 운영에서는 `CORS_ORIGIN` 등으로 명시하는 것이 안전합니다(이 프로젝트의 `app.js`·`.env.example` 참고).
3. 쿠키·세션을 쓰면 `SameSite`, `Secure`, 도메인 정책을 맞춥니다.

**장점:** CDN·스케일 분리. **단점:** CORS·빌드 환경 변수·보안 설정을 환경마다 맞춰야 합니다.

---

### 케이스 C — 사용자에게는 한 도메인, 뒤에서 경로 분리 (리버스 프록시 / CDN)

**형태:** 예) AWS **CloudFront** 또는 **ALB / Nginx**에서 `https://app.example.com` 하나만 노출하고, `/`·`/assets`는 정적, `/api`는 백엔드로 라우팅.

**필요한 조치**

1. 인프라에서 **경로별 오리진**(정적 저장소 vs API 타깃) 설정.
2. SPA는 **`/api/...`만** 호출하도록 빌드(상대 경로 가능) → 브라우저 오리진은 항상 `app.example.com`.
3. CORS는 최소화되거나 불필요합니다.

**장점:** B의 이점 + 사용자 입장 단일 오리진. **단점:** 프록시·캐시·라우팅 설정 부담.

**AWS 예:** CloudFront Behavior으로 기본은 S3(SPA), `/api/*`는 ALB 또는 API Gateway 등으로 연결.

---

### 케이스 D — 컨테이너 (Docker)

- **이미지 1개:** 보통 **케이스 A**와 동일(이미지 안에 `dist` + `node app.js`).
- **이미지 2개(프론트 nginx + API):** 앞단 Ingress/ALB로 **케이스 C**에 가깝게 묶는 경우가 많습니다.

**추가 조치:** Dockerfile 멀티 스테이지 빌드, `PORT`, 헬스체크, 오케스트레이션 시 시크릿 주입.

---

### 케이스 E — 서버리스 (정적 + API Gateway + Lambda 등)

**형태:** SPA는 객체 스토리지·정적 호스팅, API는 API Gateway + Lambda.

**필요한 조치:** **케이스 B와 유사**하게 `VITE_API_BASE_URL` + CORS + 게이트웨이 라우팅·스테이지·(선택) 커스텀 도메인.

---

## 5. 경우의 수 요약 표

| 케이스 | 브라우저 오리진 | 프론트(빌드/런타임) | API 쪽 |
|--------|----------------|---------------------|--------|
| A 단일 Express | 1개 | 상대 또는 `/api` | static + SPA 폴백, API prefix 권장 |
| B 정적 + API 분리 | 2개 | `VITE_API_BASE_URL` 필수 | CORS, 공개 URL |
| C 프록시로 1도메인 | 1개 | 상대 `/api` 권장 | 경로 라우팅(게이트웨이) |
| D Docker | A~C 중 선택 | 동일 | 동일 + 컨테이너 설정 |
| E 서버리스 | 보통 2개 | B와 유사 | 게이트웨이·함수·CORS |

---

## 6. Express로 React 빌드물 서빙할 때의 절차 (요약)

1. `npm run build`로 `dist` 생성.
2. `express.static('dist')`로 정적 파일 제공.
3. API 라우터를 **충돌 없는 경로**(예: `/api`)에 마운트하고, **미들웨어 순서**를 API → static → **모든 GET에 `index.html`** 폴백(단 `/api` 제외)으로 둡니다.
4. 프로덕션에서 프론트가 호출하는 API 베이스 URL이 위 구조와 일치하는지 확인합니다.

---

## 7. 이 저장소에 바로 적용할 때

- 현재 API는 **`/users`, `/logs`, `/credit-transactions`** 등 **루트 경로**에 붙어 있습니다. **케이스 A**(Express만으로 SPA+API)로 합치려면 **API를 `/api` 아래로 옮기고**, 프론트의 `fetch` 경로·`vite` 프록시·문서를 함께 맞추는 작업이 필요합니다.
- **케이스 B**로 가면 **`VITE_API_BASE_URL`** 과 **`CORS_ORIGIN`**(프로덕션) 정리가 중심이 됩니다.

---

## 8. 관련 문서

- [`README.md`](./README.md) — 설치·로컬 실행·환경 변수 복사
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) — 엔드포인트·CORS 동작·타입
