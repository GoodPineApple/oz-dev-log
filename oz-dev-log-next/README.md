# oz-dev-log-next

**Next.js 풀스택 개발 일지** — 클라이언트(React)와 서버(API Routes)가 하나의 프로젝트에서 동작합니다.

## 학습 목표

- Next.js App Router 기반 풀스택 프레임워크 개발 체험
- 서버 사이드에서 Prisma를 통해 SQL DB에 직접 연동
- JWT 인증 흐름을 API Routes로 구현
- Swagger를 통해 클라이언트/서버 경계를 명확히 이해
- Vercel을 통한 무료 배포 체험

## 프로젝트 구조

```
oz-dev-log-next/
├── prisma/             # DB 스키마 + 시드 데이터
│   ├── schema.prisma       Prisma 모델 정의 (테이블 구조)
│   └── seed.ts             데모 사용자·일지·크레딧 데이터
├── src/
│   ├── app/
│   │   ├── api/        # ← 서버 사이드 (API Routes = Express 대체)
│   │   │   ├── auth/       회원가입·로그인·내 정보
│   │   │   ├── users/      사용자 CRUD
│   │   │   ├── logs/       일지 CRUD + 첨부
│   │   │   ├── credit-transactions/
│   │   │   └── swagger/    Swagger JSON 스펙
│   │   ├── api-docs/   # Swagger UI 페이지
│   │   ├── (auth)/     # ← 클라이언트 사이드 (로그인/회원가입)
│   │   └── (main)/     # ← 클라이언트 사이드 (인증 필요 페이지)
│   ├── components/     # React 컴포넌트
│   └── lib/            # 유틸리티 (DB, 인증, 직렬화 등)
├── .env.example        # 환경변수 템플릿 (복사해서 .env 만들기)
└── package.json
```

**핵심 포인트:** `src/app/api/` 아래의 `route.ts` 파일들이 Express 역할을 하고,
나머지 `page.tsx` 파일들이 React 역할을 합니다. 하나의 프로젝트에서 모두 동작합니다.

---

## 사전 준비 (수강생 안내)

시작하기 전에 아래가 설치되어 있어야 합니다:

- **Node.js** 18 이상 (`node -v`로 확인)
- **MySQL** 서버가 로컬에서 실행 중 (`mysql -u root -p`로 접속 확인)

---

## 처음 클론/pull 받았을 때 — 전체 셋업 순서

```bash
# 1. 프로젝트 폴더로 이동
cd oz-dev-log-next

# 2. 의존성 설치 (Prisma Client도 자동 생성됨 — postinstall)
npm install

# 3. 환경변수 파일 생성
cp .env.example .env
# → .env를 열어 본인의 MySQL 비밀번호에 맞게 수정

# 4. DB 생성 + 테이블 생성 (DB가 없으면 자동 생성됨)
npx prisma db push

# 5. 데모 데이터 삽입 (Alice, Bob 계정 + 샘플 일지)
npm run db:seed

# 6. 개발 서버 시작
npm run dev
```

→ **http://localhost:3000** 에서 앱 확인
→ **http://localhost:3000/api-docs** 에서 Swagger API 문서 확인

---

## npm 스크립트 설명

| 스크립트 | 명령어 | 설명 |
|----------|--------|------|
| `dev` | `npm run dev` | 개발 서버 실행 (Turbopack, 핫 리로드) |
| `build` | `npm run build` | 프로덕션 빌드 (Vercel 배포 시 자동 실행) |
| `start` | `npm run start` | 빌드된 앱 실행 (로컬에서 빌드 테스트 시) |
| `db:push` | `npm run db:push` | Prisma 스키마를 DB에 반영 (테이블 생성/변경) |
| `db:seed` | `npm run db:seed` | 데모 데이터 삽입 (Alice, Bob + 샘플 일지) |
| `postinstall` | *(자동)* | `npm install` 후 Prisma Client 자동 생성 |

---

## 환경변수 (.env)

```env
# MySQL 연결 문자열
# 형식: mysql://유저:비밀번호@호스트:포트/데이터베이스이름
DATABASE_URL="mysql://root:password@localhost:3306/oz_devlog_next"

# JWT 서명에 사용하는 비밀키
JWT_SECRET="dev-secret-do-not-use-in-production"
```

> **주의:** `.env` 파일은 git에 포함되지 않습니다. 클론 후 반드시 직접 만들어야 합니다.

---

## 자주 하는 작업

### git pull 받은 뒤 (코드가 업데이트됐을 때)

```bash
npm install              # 새 의존성이 추가됐을 수 있으므로
npx prisma db push       # 스키마가 변경됐을 수 있으므로
npm run dev              # 개발 서버 시작
```

### DB를 처음부터 다시 만들고 싶을 때

```bash
npx prisma db push --force-reset   # 모든 테이블 삭제 후 재생성
npm run db:seed                     # 데모 데이터 다시 삽입
```

### Prisma Studio로 DB 직접 확인 (GUI)

```bash
npx prisma studio
```

→ http://localhost:5555 에서 테이블 데이터를 웹 브라우저로 확인·편집 가능

---

## 데모 계정

| 이메일 | 비밀번호 | 설명 |
|--------|----------|------|
| alice@example.com | password123 | 일지 2개, 크레딧 300 CP |
| bob@example.com | password123 | 일지 1개, 크레딧 100 CP |

---

## Vercel 배포 가이드

이 저장소(`oz-dev-log`)는 모노레포로 여러 프로젝트가 함께 들어 있습니다.
Vercel에서는 **`oz-dev-log-next` 하위 디렉토리만** 배포합니다.

### 배포 구조 이해

```
oz-dev-log/                ← GitHub에 push 되는 전체 레포
├── oz-dev-log-app/        (Vercel 배포 대상 아님)
├── oz-dev-log-api/        (Vercel 배포 대상 아님)
├── oz-dev-log-sequelize/  (Vercel 배포 대상 아님)
├── oz-dev-log-mongoose/   (Vercel 배포 대상 아님)
└── oz-dev-log-next/       ← Vercel이 빌드하는 디렉토리 (Root Directory)
```

### Step 1. 클라우드 MySQL 준비

Vercel 서버리스 환경에서는 로컬 MySQL에 접근할 수 없으므로
클라우드 DB 서비스가 필요합니다. 무료 옵션:

| 서비스 | 무료 티어 | 가입 |
|--------|-----------|------|
| [Aiven](https://aiven.io) | MySQL 무료 플랜 | GitHub 로그인 |
| [Railway](https://railway.app) | 월 $5 크레딧 | GitHub 로그인 |
| [PlanetScale](https://planetscale.com) | Hobby 무료 | GitHub 로그인 |

가입 후 MySQL 데이터베이스를 생성하면 연결 문자열을 받을 수 있습니다:

```
mysql://유저:비밀번호@호스트:포트/데이터베이스이름
```

### Step 2. 클라우드 DB에 테이블 생성 + 시드

로컬에서 `.env`의 `DATABASE_URL`을 **클라우드 연결 문자열로 임시 교체**한 뒤:

```bash
# .env의 DATABASE_URL을 클라우드 DB 문자열로 바꾼 상태에서
npx prisma db push       # 클라우드 DB에 테이블 생성
npm run db:seed           # 데모 데이터 삽입
```

> 완료 후 다시 로컬 MySQL 문자열로 되돌려 놓으세요.
> (로컬 개발은 로컬 DB, 배포는 클라우드 DB)

### Step 3. Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com)에 **GitHub 계정으로 로그인**
2. **Add New → Project** 클릭
3. `oz-dev-log` 레포를 선택 (Import)
4. 아래 설정을 입력:

| 항목 | 값 |
|------|-----|
| **Framework Preset** | Next.js (자동 감지됨) |
| **Root Directory** | `oz-dev-log-next` ← **반드시 변경** |
| **Build Command** | (비워두면 자동: `npm run build`) |
| **Output Directory** | (비워두면 자동: `.next`) |
| **Install Command** | (비워두면 자동: `npm install`) |

> **Root Directory 설정이 핵심입니다.**
> 이걸 설정하지 않으면 Vercel이 레포 루트에서 빌드를 시도하여 실패합니다.

### Step 4. 환경변수 설정

같은 프로젝트 생성 화면에서 **Environment Variables** 섹션에 추가:

| Key | Value | 예시 |
|-----|-------|------|
| `DATABASE_URL` | 클라우드 MySQL 연결 문자열 | `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | 프로덕션용 비밀키 | `my-super-secret-key-change-this` |

### Step 5. Deploy

**Deploy** 버튼을 누르면 Vercel이 자동으로:

1. `oz-dev-log-next/` 디렉토리로 진입
2. `npm install` 실행 (→ `postinstall`로 Prisma Client 생성)
3. `npm run build` 실행 (→ `prisma generate && next build`)
4. 배포 완료 → `https://프로젝트명.vercel.app` URL 발급

### 이후 업데이트 (재배포)

GitHub에 push하면 Vercel이 자동으로 재배포합니다:

```bash
git add .
git commit -m "기능 추가"
git push origin main
```

→ Vercel 대시보드에서 빌드 진행 상황을 확인할 수 있습니다.

### 요약 — 로컬 vs 배포 환경

| | 로컬 개발 | Vercel 배포 |
|--|-----------|-------------|
| DB | 로컬 MySQL (`localhost:3306`) | 클라우드 MySQL (Aiven 등) |
| `.env` 위치 | 프로젝트 내 `.env` 파일 | Vercel 대시보드 > Environment Variables |
| 서버 | `npm run dev` (Node.js) | Vercel 서버리스 (자동) |
| URL | `http://localhost:3000` | `https://xxx.vercel.app` |

---

## 기술 스택

| 영역 | 기술 | 이전 프로젝트 대응 |
|------|------|-------------------|
| 프레임워크 | Next.js 15 (App Router) | Express + Vite/React |
| 언어 | TypeScript | JavaScript(API) + TypeScript(App) |
| ORM | Prisma | Sequelize |
| 스타일링 | Tailwind CSS v4 | Tailwind CSS v4 |
| 인증 | JWT (jsonwebtoken + bcryptjs) | 동일 |
| API 문서 | Swagger (next-swagger-doc) | 없음 (새로 추가) |
| 배포 | Vercel | 없음 (새로 추가) |

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| `Database does not exist` | `npx prisma db push` 실행 (DB 자동 생성) |
| 로그인 시 "이메일 또는 비밀번호가 올바르지 않습니다" | `npm run db:seed`로 데모 데이터 삽입 |
| `Can't reach database server` | MySQL 서버가 실행 중인지 확인, `.env`의 포트·비밀번호 확인 |
| `prisma: command not found` | `npm install` 재실행 |
| 포트 3000이 이미 사용 중 | `npm run dev -- -p 3001` 로 다른 포트 사용 |
