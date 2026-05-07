# DevLog (oz-dev-log) — 구현 스펙 · 운영 가이드

이 문서는 **`기획서.md`의 미래 방향이 아니라, 현재 코드베이스가 실제로 동작하는 스펙**을 기준으로 합니다.  
기능을 추가·변경할 때는 이 파일을 함께 갱신해, 모노레포(앱·API) 관리의 단일 참고점으로 쓰세요.

---

## 1. 저장소 구성

| 경로 | 패키지명 (`package.json`) | 역할 |
|------|---------------------------|------|
| `oz-dev-log-app/` | `oz-dev-log-app` | Vite + React 19 + TypeScript SPA |
| `oz-dev-log-api/` | `oz-back` | Express 5 API, 목(mock) 데이터 |
| `기획서.md` | — | 제품 방향·확장 아이디어 (참고용) |

루트에는 워크스페이스 도구(npm/pnpm workspaces, Turborepo 등)가 없습니다. **앱과 API는 각 디렉터리에서 독립 실행**합니다.

---

## 2. 로컬 실행

### 2.1 API (`oz-dev-log-api`)

- **기본 포트:** `3000` (`PORT` 환경 변수로 변경 가능, `.env.example` 참고)
- **시작:** `npm run start` 또는 개발 시 `npm run dev` (nodemon)

### 2.2 앱 (`oz-dev-log-app`)

- **개발 서버:** `npm run dev` (Vite 포트는 `5173` 등 가변일 수 있음)
- **`VITE_API_BASE_URL`:** 비워 두면(권장) 요청이 **동일 출처 상대 경로**(`/users` 등)로 나가 `vite.config.ts` 프록시를 탑니다. 값을 넣으면 브라우저가 API에 **직접** 호출하므로 백엔드 CORS가 맞아야 합니다.
- **API 프록시:** `vite.config.ts`에서 `/users`, `/logs`, `/credit-transactions`를 `http://localhost:3000`으로 넘깁니다.  
  **앱 개발 시 API가 먼저 떠 있어야** 로그인·목록 등이 동작합니다.

### 2.3 빌드

- 앱: `npm run build` (`tsc -b` 후 `vite build`)

---

## 3. 인증·세션 (현재 구현)

- **실제 소셜 로그인(Firebase 등)은 없음.**
- 로그인 페이지에서 `GET /users`로 받은 **목업 사용자 목록** 중 하나를 선택하면, `localStorage` 키 `devlog:userId`에 해당 사용자 `id`가 저장됩니다.
- 보호 라우트(`RequireAuth`)는 저장된 `userId`로 `GET /users/:userId`를 호출해 사용자가 존재하는지 검증합니다. 실패 시 저장값을 지우고 `/login`으로 보냅니다.
- 로그아웃 시 `devlog:userId` 제거 후 `/login` 이동.

---

## 4. 데이터 소스 이원화 (핵심)

앱은 **두 종류의 일지**를 동시에 다룹니다.

| 구분 | `source` | 저장 위치 | API |
|------|----------|-----------|-----|
| **서버 일지** | `api` | Express 목 데이터 (`mock-data.js`) | `GET /logs`, `GET /logs/:id`, `GET /logs/:id/attachments` |
| **로컬 일지** | `local` | 브라우저 `localStorage` (`devlog:localLogs:{userId}`) | 없음 (클라이언트만) |

- 홈 목록은 API 일지와 로컬 일지를 **`mergeAndSort`로 합친 뒤** `createdAt` 기준 내림차순 정렬합니다.
- **무한 스크롤:** 클라이언트에서 페이지 단위(`PAGE_SIZE = 8`)로 잘라 보여 주며, Intersection Observer로 확장합니다 (서버 커서 페이지네이션 아님).

---

## 5. 백엔드 HTTP API (읽기 전용 중심)

모든 응답은 JSON. 오류 시 `{ "error": "..." }` 형태(일부 라우트).

### 5.1 Users

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/users` | 목업 사용자 전체 |
| `GET` | `/users/:userId` | 단일 사용자 |
| `GET` | `/users/:userId/logs` | 해당 사용자 일지 목록 |
| `GET` | `/users/:userId/credit-transactions` | 해당 사용자 크레딧 내역 |

### 5.2 Logs

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/logs?userId=` | `userId`로 필터된 일지 목록 (없으면 전체) |
| `GET` | `/logs/:logId` | 단일 일지 (`logId`는 정수 문자열) |
| `GET` | `/logs/:logId/attachments` | 해당 일지 첨부 목록 |

**미구현:** `POST`/`PATCH`/`DELETE` 일지, 파일 업로드 엔드포인트.

### 5.3 Credit transactions

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/credit-transactions?userId=` | 필터된 내역 |
| `GET` | `/credit-transactions/:id` | 단일 내역 |

### 5.4 목업 사용자 ID (고정 UUID)

`oz-dev-log-api/model/mock-data.js`의 `MockUserIds`:

- Alice: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01`
- Bob: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02`

---

## 6. 프론트엔드 라우팅·화면

`App.tsx` 기준.

| 경로 | 인증 | 동작 요약 |
|------|------|-----------|
| `/login` | 불필요 | 목업 사용자 선택 로그인 |
| `/` | 필요 | 홈: API+로컬 일지 통합 목록, 무한 스크롤, 새 글 링크 |
| `/logs/new` | 필요 | **로컬 일지** 작성·저장, 마크다운 미리보기, 첨부(로컬 data URL) |
| `/logs/:logId` | 필요 | `local-*` → 로컬 상세·수정·삭제; 숫자 `id` → API 일지 상세·첨부 조회 |
| `/logs/:logId/edit` | 필요 | **로컬 일지만** 편집. API 일지 편집 시도 시 토스트 후 상세로 리다이렉트 |
| `/me` | 필요 | 대시보드: `user.totalCredits`, 레벨(500CP당 1), API 첨부 목록, 로컬 일지 건수, 크레딧 내역 |
| `*` | — | `/`로 리다이렉트 |

레이아웃·`user` 전달: `RequireAuth` → `AppLayout`이 `Outlet`에 `{ user }` 컨텍스트 제공 (`useAuthOutlet`).

---

## 7. 타입·API 클라이언트 (앱)

- **공통 타입:** `oz-dev-log-app/src/types.ts` — `User`, `ApiLog`, `Attachment`, `CreditTransaction`, 통합 `DevLog`.
- **fetch 래퍼:** `src/api/client.ts` — `fetchJson`, 비정상 응답 시 `error` 필드 우선 메시지.
- **API 함수:** `src/api/devlog.ts` — 위 백엔드 경로와 대응 (`ApiLog`의 `id`는 `number`).

**주의:** `ApiLog`에는 `tags` 필드가 없고, 목록 병합 시 API 쪽은 `tags: []`로 매핑합니다 (`mergeLogs.ts`).

---

## 8. 로컬 일지·첨부·크레딧 UI 규칙

### 8.1 로컬 저장

- `src/lib/localLogs.ts`: CRUD 유틸, ID 생성 `local-${crypto.randomUUID()}`.

### 8.2 첨부 (에디터)

- 최대 **5개**, 파일당 **10MB**.
- 이미지는 `image/png`, `image/jpeg`, `image/gif` → `type: 'image'`, 그 외 선택 파일은 `type: 'file'`.
- 내용은 **FileReader → data URL**로 `localAttachments`에 보관 (서버 업로드 없음).

### 8.3 크레딧 “예상” (클라이언트만)

`src/lib/creditsPreview.ts`의 `estimateCredits`:

- 당일 **첫** 로컬 글 가정 시: **+100 CP**
- 첨부 있으면: **+20 CP**
- 본문 길이 **300자 이상**: **+10 CP**

저장 완료 토스트에 위 합계를 “가정”으로 안내합니다. **서버의 `totalCredits`·`/credit-transactions`와 자동 연동되지는 않음** (대시보드는 목업 API 기준).

---

## 9. 의도적 제약·기술 부채 (스펙으로 명시)

1. **일지 쓰기/수정/삭제 API 없음** — 서버 일지는 읽기만; 편집은 로컬 일지만.
2. **인증은 데모 수준** — 토큰·세션 서버 없음.
3. **CORS** — `app.js`의 `cors` 미들웨어: `CORS_ORIGIN`·기본값에 더해, **`NODE_ENV !== 'production'`** 이면 `http(s)://localhost`, `127.0.0.1`, `[::1]` 임의 포트 출처를 허용합니다. 프로덕션에서는 `NODE_ENV=production`과 `CORS_ORIGIN`으로 프론트 도메인을 명시하는 것을 권장합니다.
4. **기획서의 Firebase/Storage/Firestore** — 미연동; 본 문서가 현재 진실의 원천.

---

## 10. 에이전트·협업 시 체크리스트

작업 전후로 아래를 맞추면 모노레포 관리가 수월합니다.

- [ ] API 경로·쿼리·응답 형태가 바뀌면 `oz-dev-log-app/src/types.ts`와 `src/api/devlog.ts`를 동시에 수정했는가.
- [ ] React Query `queryKey` (`user`, `logs`, `log`, `attachments`, `credit-transactions`)와 무효화 전략이 일관한가.
- [ ] “로컬 전용” vs “서버” UX 카피(배지, 토스트, 안내 문구)가 실제 동작과 맞는가.
- [ ] Vite 프록시에 새 API 프리픽스를 추가했는가 (필요 시).
- [ ] 이 `PROJECT_SPEC.md`를 갱신했는가.

---

## 11. 주요 파일 인덱스

| 영역 | 경로 |
|------|------|
| 라우팅 | `oz-dev-log-app/src/App.tsx` |
| 인증 가드 | `oz-dev-log-app/src/routes/RequireAuth.tsx` |
| API 프록시 | `oz-dev-log-app/vite.config.ts` |
| 서버 진입 | `oz-dev-log-api/app.js` |
| 목 데이터 | `oz-dev-log-api/model/mock-data.js` |
| 로그·첨부·크레딧 라우트 | `oz-dev-log-api/routes/*.js` |

---

*문서 버전: 저장소 현재 구현 기준 (코드 동기화용). 변경 시 상단에 짧은 변경 이력을 남기면 추적에 도움이 됩니다.*
