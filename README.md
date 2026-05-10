# oz-dev-log (DevLog)

**MySQL과 MongoDB의 차이를 한 화면에서 비교해 보는** 풀스택 학습용 데모입니다. 동일한 REST API 스펙을 두 가지 백엔드(Sequelize/Mongoose)로 각각 구현하고, 프론트엔드는 런타임 스위처로 두 백엔드를 오갈 수 있습니다.

| 구성 요소 | 경로 | 역할 |
|-----------|------|------|
| 웹 앱 | [`oz-dev-log-app/`](./oz-dev-log-app/) | React 19 + TS + Tailwind + React Router + TanStack Query. 백엔드 스위처로 두 저장소를 토글 |
| **Sequelize 백엔드** | [`oz-dev-log-sequelize/`](./oz-dev-log-sequelize/) | Express 5 + Sequelize + MySQL. 관계형 모델/외래키/트랜잭션 예시 |
| **Mongoose 백엔드** | [`oz-dev-log-mongoose/`](./oz-dev-log-mongoose/) | Express 5 + Mongoose + MongoDB. 도큐먼트 모델/ObjectId/참조 예시 |
| 참고용 단일 API | [`oz-dev-log-api/`](./oz-dev-log-api/) | 학습 시작 전 모델이었던 초기 API (mock-data 포함). 비교용으로만 유지 |

---

## 학습 포인트 (왜 두 개의 백엔드인가?)

| 주제 | Sequelize (MySQL) | Mongoose (MongoDB) |
|------|-------------------|--------------------|
| 스키마 정의 | `sequelize.define()` — 테이블·컬럼·제약 | `new Schema({...})` — 컬렉션 형태 가이드 |
| 기본 키 | 자동 증가 INT, 또는 UUID(CHAR(36)) | ObjectId (24자 hex) 자동 생성 |
| 관계 표현 | `hasMany` / `belongsTo` + 외래키 제약 | `ref` + `populate()`, 외래키는 앱 레벨 책임 |
| 사전 스키마 | 테이블 생성 필요 (`sync` 또는 마이그레이션) | 컬렉션은 첫 쓰기에 자동 생성 |
| 트랜잭션 | 내장 (`sequelize.transaction`) | 단일 도큐먼트는 원자적. 다중 도큐먼트 트랜잭션은 replica set 필요 |
| ENUM | DB의 `ENUM('image','file')` 제약 | Mongoose 스키마의 `enum: [...]` 검증 |
| 응답 직렬화 | 정수/Date를 JS 값으로 — 문자열 id로 통일 | ObjectId/Date를 문자열·ISO로 — 형식 동일 |

두 백엔드의 **공개 REST 스펙은 완전히 동일**합니다. 그래서 프론트엔드 코드는 어느 백엔드를 보는지 신경 쓰지 않고도 같은 화면을 그릴 수 있습니다 — 학습자는 동일한 입력/출력 뒤에서 저장소가 어떻게 다르게 동작하는지를 관찰합니다.

---

## 디렉터리 구조 (백엔드 공통 패턴)

두 백엔드는 동일한 디렉터리/책임 분리를 따릅니다. **`routes/`와 `models/`를 명확히 분리**한 것이 핵심입니다.

```
oz-dev-log-{sequelize,mongoose}/
├── app.js                 # 진입점 (env → DB → server)
├── createApp.js           # Express 앱 팩토리
├── config/
│   ├── cors.js            # CORS 미들웨어
│   └── database.js        # Sequelize 인스턴스 / Mongoose 연결
├── bootstrap/
│   ├── database.js        # 인증 → (자동 생성) → sync → seed
│   └── server.js          # listenApp
├── models/                # ← 스키마 정의만 (비즈니스 로직 X)
│   ├── User.js
│   ├── Log.js
│   ├── Attachment.js
│   ├── CreditTransaction.js
│   ├── enums.js
│   └── index.js           # (Sequelize에서는 관계 선언도 함께)
├── controllers/           # ← 데이터 접근 + 직렬화 + 도메인 규칙
│   ├── user-controller.js
│   ├── log-controller.js
│   ├── credit-transaction-controller.js
│   └── serializers.js
├── routes/                # ← HTTP 처리만 (next(err)로 위임)
│   ├── index.js           # mountRoutes(app)
│   ├── user-route.js
│   ├── log-route.js
│   └── credit-transaction-route.js
└── seed/
    ├── seed-data.js
    └── run-seed.js        # 빈 DB일 때만 1회 주입
```

같은 도메인 모델/라우트 이름을 양쪽에서 그대로 쓰기 때문에, 한쪽 코드를 보고 다른 쪽을 바로 매핑하며 비교할 수 있습니다.

---

## 사전 요구 사항

- **Node.js 20.x 이상** (LTS), **npm 9+** (workspaces 사용)
- **MySQL 8** (로컬 또는 Docker). 사용자/비밀번호는 `.env`로 지정. DB는 부팅 시 자동 생성됩니다.
- **MongoDB 6/7** (로컬 `mongod` 또는 Atlas). 컬렉션은 자동 생성됩니다.

> Sequelize만 또는 Mongoose만으로도 동작합니다. 한쪽 DB가 없으면 그쪽 백엔드만 비활성화된 채 사용 가능 — 프론트에서 사용할 수 있는 쪽으로 스위치만 맞추면 됩니다.

---

## 설치·실행 (로컬)

```bash
git clone <저장소-URL> oz-dev-log
cd oz-dev-log
npm install
```

### 환경 변수 파일 만들기

```bash
cp oz-dev-log-app/.env.example       oz-dev-log-app/.env
cp oz-dev-log-sequelize/.env.example oz-dev-log-sequelize/.env
cp oz-dev-log-mongoose/.env.example  oz-dev-log-mongoose/.env
```

이후 각 `.env` 안의 접속 정보(MySQL 비밀번호, MongoDB URI 등)를 본인 환경에 맞춰 수정합니다.

### 한 번에 띄우기 (권장)

```bash
npm run dev
```

세 프로세스가 한 터미널에서 색상별로 실행됩니다:

| 라벨 | 포트 | 내용 |
|------|------|------|
| `seq`   | `:3001` | Sequelize 백엔드 (MySQL) |
| `mongo` | `:3002` | Mongoose 백엔드 (MongoDB) |
| `app`   | `:5173` (Vite) | 프론트엔드 |

브라우저에서 [http://localhost:5173/login](http://localhost:5173/login) 에 접속하면 헤더의 토글로 **MySQL · Sequelize ↔ MongoDB · Mongoose** 를 바로 전환할 수 있습니다.

### 개별 실행

```bash
npm run dev:sequelize     # Sequelize 백엔드만 (:3001)
npm run dev:mongoose      # Mongoose 백엔드만 (:3002)
npm run dev:app           # 프론트만 (:5173)
npm run dev:api           # 참고용 단일 API (:3000) — 평소엔 안 띄워도 됨
```

### 기타 스크립트

```bash
npm run build              # 프론트 프로덕션 빌드 → oz-dev-log-app/dist
npm run lint               # 프론트 ESLint
npm run start:sequelize    # Sequelize 백엔드를 node로 직접 실행
npm run start:mongoose     # Mongoose 백엔드를 node로 직접 실행
```

---

## 프론트엔드 — 두 백엔드를 어떻게 오가는가?

핵심 모듈은 두 개입니다.

- [`src/lib/backend.ts`](./oz-dev-log-app/src/lib/backend.ts) — 활성 백엔드(`'sequelize' | 'mongoose'`)를 `localStorage`에 저장하고, 변경 시 커스텀 이벤트를 발행합니다.
- [`src/lib/apiBase.ts`](./oz-dev-log-app/src/lib/apiBase.ts) — 활성 백엔드에 따라 호출 URL을 만들어 줍니다.
  - `VITE_*_API_URL`이 비어 있으면 **Vite 프록시 접두사**(`/sequelize/*`, `/mongoose/*`) 사용
  - 채워져 있으면 **절대 URL**로 직접 호출 (배포 환경)

백엔드가 바뀌면 [`src/main.tsx`](./oz-dev-log-app/src/main.tsx) 의 핸들러가 React Query 캐시를 비웁니다. 모든 `useQuery`는 `queryKey`에 `backend`를 포함하므로 백엔드 간 캐시 충돌 없이 즉시 재로딩됩니다.

두 백엔드는 서로 다른 사용자 풀을 가질 수 있어 스위처가 동작할 때 로그인 상태를 자동으로 정리하고 로그인 화면으로 보냅니다 ([`BackendSwitcher.tsx`](./oz-dev-log-app/src/components/BackendSwitcher.tsx)).

---

## REST API (양 백엔드 공통)

```
GET    /users
GET    /users/:userId
GET    /users/:userId/logs
GET    /users/:userId/credit-transactions

GET    /logs                       # ?userId= 로 필터
POST   /logs                       # { userId, title, content } → 자동으로 +100 CP
GET    /logs/:logId
PUT    /logs/:logId                # body에 userId 포함 (소유자 검증)
DELETE /logs/:logId?userId=...

GET    /logs/:logId/attachments
POST   /logs/:logId/attachments    # { fileName, fileUrl, fileType, fileSize }

GET    /credit-transactions        # ?userId= 로 필터
POST   /credit-transactions        # { userId, amount, type, [logId], [description] }
GET    /credit-transactions/:id
```

응답 스키마는 [`oz-dev-log-app/src/types.ts`](./oz-dev-log-app/src/types.ts) 와 같으며, **모든 id는 문자열**입니다 (Sequelize의 INT 자동 증가도, Mongoose의 ObjectId도 응답 시 `String()` 처리).

일지 작성 시 100 CP 적립은 트랜잭션(Sequelize) 또는 순차 처리(Mongoose)로 사용자 잔액에 함께 반영됩니다.

---

## 인증·데이터

- **로그인**: 백엔드의 사용자 목록에서 골라 클릭하는 **데모 로그인**입니다 (`localStorage`에 `userId`만 저장).
- **일지 데이터**: 이전 버전에 있던 *브라우저-only 로컬 일지* 모킹은 제거되었습니다. 모든 일지/첨부/크레딧은 선택한 백엔드의 DB에 저장됩니다.
- **시드 데이터**: 빈 DB로 첫 부팅 시 `SEED_ON_BOOT=true`인 경우 데모 사용자/일지/첨부/크레딧 거래가 자동 주입됩니다. 데이터가 이미 있으면 시드 단계는 건너뜁니다.

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
|------|------------|
| Sequelize 부팅 시 `Unknown database` | `oz-dev-log-sequelize/bootstrap/database.js` 가 자동 생성하지만, MySQL 사용자 권한이 없으면 실패합니다. `CREATE DATABASE` 권한을 부여하거나 직접 빈 DB를 만든 뒤 다시 시작하세요. |
| Mongoose `bad auth` 또는 연결 거부 | `oz-dev-log-mongoose/.env`의 `MONGODB_URI`를 본인 환경(로컬 `mongod` 또는 Atlas)에 맞게 수정. 비밀번호에 특수문자가 있다면 URL-encode. |
| 백엔드 스위치 후 "사용자를 찾을 수 없습니다" | 두 백엔드는 데이터가 분리되어 있어 같은 userId가 다른 쪽에 없을 수 있습니다. 로그인 화면으로 돌아가 해당 백엔드의 데모 사용자를 다시 선택하세요. |
| 첨부/일지에서 시간이 9시간 어긋남 | 모든 시각은 UTC(ISO 8601)로 저장·반환합니다. 표시는 브라우저 로케일(`ko-KR`)로 변환됩니다. |
| 포트 충돌 | 각 백엔드의 `.env`에서 `PORT` 변경 가능. 변경하면 [`oz-dev-log-app/vite.config.ts`](./oz-dev-log-app/vite.config.ts) 프록시의 `target`도 함께 맞춰 주세요. |

---

## 배포 (요약)

- 빌드 산출물: `oz-dev-log-app/dist`
- 교차 오리진으로 백엔드를 부를 때:
  1. 앱 빌드에 `VITE_SEQUELIZE_API_URL`, `VITE_MONGOOSE_API_URL` 반영
  2. 각 백엔드의 `CORS_ORIGIN`에 운영 도메인 명시
- **`.env`는 커밋하지 마세요.**

자세한 패턴(단일 Express, 정적+API 분리, 리버스 프록시, Docker, 서버리스 등)과 Vite 개발 프록시의 한계는 [`DEPLOYMENT.md`](./DEPLOYMENT.md) 참고.

---

## 문서 더 보기

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — 배포 경우의 수·필수 조치
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) — 엔드포인트·타입·CORS 등 상세 (이전 단일-API 기준 항목은 추후 업데이트 예정)
- [`기획서.md`](./기획서.md) — 서비스 콘셉트 및 확장 아이디어

---

## 라이선스

저장소 루트에 라이선스 파일이 없다면, 팀 정책에 맞게 추가하세요.
