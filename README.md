# oz-dev-log (DevLog)

개발 일지(TIL)를 남기고, 목록·상세·로컬 작성·크레딧 대시보드 등을 제공하는 **풀스택 데모/MVP** 저장소입니다.  
프론트엔드는 **Vite + React**, 백엔드는 **Express**이며, npm **workspaces**로 한 저장소에서 관리합니다.

| 구성 요소 | 경로 | 설명 |
|-----------|------|------|
| 웹 앱 | `oz-dev-log-app/` | React 19, TypeScript, Tailwind, React Router, TanStack Query |
| API | `oz-dev-log-api/` | Express 5, 목(mock) 사용자·일지·크레딧 데이터 |
| 구현 스펙 | [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) | API·라우트·로컬/서버 일지 이원화 등 **현재 코드 기준** 상세 |
| 기획 참고 | [`기획서.md`](./기획서.md) | 제품 방향·확장 아이디어 (구현과 다를 수 있음) |

---

## 사전 요구 사항

- **Node.js** 20.x 이상 권장 (LTS)
- **npm** 9+ (workspaces 사용)

---

## 처음 설치·실행 (로컬)

저장소 루트에서만 의존성을 설치하면 워크스페이스 패키지가 함께 설치됩니다.

```bash
git clone <저장소-URL> oz-dev-log
cd oz-dev-log
npm install
```

### 환경 변수 파일

1. **앱** — `oz-dev-log-app/.env.example`을 복사해 `oz-dev-log-app/.env` 생성  
2. **API** — `oz-dev-log-api/.env.example`을 복사해 `oz-dev-log-api/.env` 생성  

```bash
cp oz-dev-log-app/.env.example oz-dev-log-app/.env
cp oz-dev-log-api/.env.example oz-dev-log-api/.env
```

로컬 개발에서는 앱의 **`VITE_API_BASE_URL`을 비워 두는 것**을 권장합니다. 요청이 Vite 개발 서버의 상대 경로로 나가 `vite.config.ts` 프록시를 통해 API(`localhost:3000`)로 전달되며, Vite 포트가 바뀌어도 CORS 문제를 피하기 쉽습니다.

### 한 번에 띄우기 (권장)

API와 앱을 **터미널 하나**에서 실행합니다.

```bash
npm run dev
```

- API: 기본 `http://localhost:3000` (`PORT`로 변경 가능)
- 앱: Vite가 출력하는 주소(보통 `http://localhost:5173` 등)

### 개별 실행

```bash
npm run dev:api   # API만 (nodemon)
npm run dev:app   # 프론트만 (Vite)
```

### 기타 스크립트

```bash
npm run build      # 프론트 프로덕션 빌드 (oz-dev-log-app/dist)
npm run lint       # 프론트 ESLint
npm run start:api  # API를 node로 실행 (배포·로컬 검증용)
```

---

## 인증·데이터 (요약)

- **로그인**: Firebase 등이 아니라, API의 목업 사용자 목록에서 선택하는 **데모 로그인**입니다.
- **일지**: API에 올라간 **읽기 전용 목 일지**와, 브라우저 **로컬 저장소**에만 쓰이는 일지가 **함께** 목록에 표시됩니다. 자세한 규칙은 [`PROJECT_SPEC.md`](./PROJECT_SPEC.md)를 참고하세요.

---

## 배포 시 참고 사항

프론트(정적 파일)와 API는 **보통 별도 프로세스·도메인**으로 올리게 되므로 아래를 맞춰야 합니다.

### 프론트엔드 (Vite 빌드)

1. 빌드 시점에 `VITE_*`가 고정되므로, **배포 환경에 맞는 API 주소**를 넣고 빌드합니다.

   ```bash
   # 예: API가 https://api.example.com 일 때
   echo 'VITE_API_BASE_URL=https://api.example.com' > oz-dev-log-app/.env.production
   npm run build
   ```

2. **같은 도메인**에서 경로만 나눠 서빙하는 경우(예: Nginx로 `/api` → 백엔드, `/` → SPA)에는 상대 경로만으로도 가능할 수 있습니다. 이 경우 빌드 산출물이 API와 **동일 오리진**으로 요청되도록 리버스 프록시를 구성합니다.

3. 빌드 결과는 `oz-dev-log-app/dist`입니다.

### 백엔드 (Express)

1. **`NODE_ENV=production`** 으로 실행하는 것을 권장합니다.
2. **`CORS_ORIGIN`**: 실제 프론트가 띄워지는 **Origin**을 콤마로 구분해 넣습니다.  
   (로컬이 아닌 프로덕션에서는 `localhost` 자동 허용 범위에만 의존하지 말고 명시하는 편이 안전합니다.)
3. **`PORT`**: 호스팅 환경에 맞게 설정합니다.

### 보안·운영

- **`.env`는 커밋하지 마세요.** 루트 `.gitignore`에 포함되어 있습니다. 예시만 `*.env.example`으로 관리합니다.
- API에 실제 DB·인증을 붙일 때는 토큰 검증, HTTPS, Rate limit 등을 별도로 설계해야 합니다.

---

## 문서 더 보기

- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) — 엔드포인트, 타입, CORS, 로컬/API 일지 동작 등 **운영·개발용 스펙**
- [`기획서.md`](./기획서.md) — 서비스 콘셉트 및 확장 아이디어

---

## 라이선스

저장소 루트에 라이선스 파일이 없다면, 팀 정책에 맞게 추가하세요.
