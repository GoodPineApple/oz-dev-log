# Api 총괄
_Exported on 2026. 5. 7. at 15시 0분 56초 GMT+9 from Cursor (3.2.16)_

---

**User**

@oz-dev-log-api/ 해당 프로젝트에 model 폴더를 만들고, 내가 알려주는 sql에 맞게끔 각 스키마의 모델을 제작해줘. 그리고 목업 데이터로 사용할 것들도 만들어줘. 아직 데이터베이스 연결하기 전 상황이야.

-- 1. 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    total_credits INT DEFAULT 0 CHECK (total_credits >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 개발 일지 테이블
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_log FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 첨부 파일 테이블
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    log_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type attachment_type NOT NULL,
    file_size INT NOT NULL, -- 단위: Bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_attachment FOREIGN KEY (log_id) REFERENCES logs(id) ON DELETE CASCADE
);

-- 4. 크레딧 트랜잭션(히스토리) 테이블
CREATE TABLE credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    log_id INT, -- 어떤 일지 작성으로 얻었는지 참조 (Nullable)
    amount INT NOT NULL, -- 지급(+), 사용(-)
    type credit_type NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_transaction FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_transaction FOREIGN KEY (log_id) REFERENCES logs(id) ON DELETE SET NULL
);

---

**Cursor**

프로젝트 구조와 스타일 확인 중입니다.



ES 모듈 프로젝트입니다. SQL 스키마에 맞춰 `model` 폴더를 만들고, PostgreSQL enum(`attachment_type`, `credit_type`)은 스키마 주석과 함께 정의합니다. 기존 라우트와 맞추기 위해 JS 필드는 camelCase로 두고 JSDoc에 컬럼명을 명시합니다.



JSDoc를 단순화하고 목업 데이터와 `index.js`를 추가합니다.



목업 사용자의 `totalCredits`를 트랜잭션 합계와 맞춥니다.



`amount` 필드가 SQL 주석(지급 + / 사용 -)과 일치하도록 JSDoc을 수정합니다.



작업 반영했습니다. `oz-dev-log-api/model/` 아래에 스키마에 맞는 모델과 목업을 두었고, DB에 붙이기 전에 `import` 만으로 쓸 수 있게 해 두었습니다.

## 구조

| 파일 | 역할 |
|------|------|
| `model/enums.js` | `attachment_type` / `credit_type`에 대응하는 상수(`AttachmentType`, `CreditType`), 검증 함수 |
| `model/User.js` | `users` — `createUser`, `isUser`, JSDoc `User` |
| `model/Log.js` | `logs` — `createLog`, `isLog`, JSDoc `Log` |
| `model/Attachment.js` | `attachments` — `createAttachment`, `isAttachment`, JSDoc `Attachment` |
| `model/CreditTransaction.js` | `credit_transactions` — `createCreditTransaction`, `isCreditTransaction`, JSDoc `CreditTransaction` |
| `model/mock-data.js` | `mockUsers`, `mockLogs`, `mockAttachments`, `mockCreditTransactions`, 고정 UUID `MockUserIds` |
| `model/index.js` | 위 모듈 재내보내기 |

필드 이름은 API·기존 코드와 맞추려고 **camelCase**(`userId`, `totalCredits`, `createdAt` 등)로 두었고, JSDoc에 **테이블·컬럼**을 적어 두었습니다.

## PostgreSQL enum

SQL에는 `attachment_type`, `credit_type` 이름만 있어서, 마이그레이션 시 아래처럼 맞추면 됩니다(`model/enums.js` 상단 주석과 동일).

```sql
CREATE TYPE attachment_type AS ENUM ('image', 'file');
CREATE TYPE credit_type AS ENUM ('earn', 'spend', 'bonus', 'adjust');
```

라벨을 바꾸면 `enums.js`의 값과 맞춰 함께 수정하면 됩니다.

## 사용 예

```javascript
import {
  mockUsers,
  mockLogs,
  MockUserIds,
  createUser,
  CreditType,
} from "./model/index.js";
```

목업은 사용자 2명, 일지 3개, 첨부 3개, 크레딧 트랜잭션 5건이며 FK(`user_id`, `log_id`)가 서로 맞습니다. `totalCredits`는 해당 사용자 트랜잭션 합과 맞춰 두었습니다.

라우트(`lib/store.js`)와는 아직 연결하지 않았습니다. DB 연결 후에는 이 모델을 기준으로 매핑 레이어만 추가하면 됩니다.

---

**User**

route에 RESTful api가 되도록 해당 목업 데이터들을 반환하는 api로 만들어줘

---

**Cursor**

프로젝트 상태와 목업 구조를 확인한 뒤 RESTful 라우트를 추가합니다.



목업 데이터를 반환하는 RESTful GET API를 추가하고 `app.js`에 라우트를 연결합니다.



RESTful하게 `GET /users/:userId/credit-transactions` 중첩 라우트를 추가합니다.



구현해 두었습니다. 목업은 **조회(GET)만** 제공하고, `model/mock-data.js`의 데이터를 그대로 JSON으로 돌려줍니다.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/users` | 사용자 목록 |
| GET | `/users/:userId` | 사용자 단건 (`userId`는 UUID) |
| GET | `/users/:userId/logs` | 해당 사용자의 일지 목록 |
| GET | `/users/:userId/credit-transactions` | 해당 사용자의 크레딧 내역 |
| GET | `/logs` | 일지 전체 (`?userId=<uuid>` 로 필터 가능) |
| GET | `/logs/:logId` | 일지 단건 (`logId`는 정수) |
| GET | `/logs/:logId/attachments` | 해당 일지의 첨부 목록 |
| GET | `/credit-transactions` | 크레딧 내역 전체 (`?userId=<uuid>` 로 필터) |
| GET | `/credit-transactions/:id` | 크레딧 내역 단건 |

## 변경·추가된 파일

- `routes/user-route.js` — 목업 사용자 + 중첩 `logs`, `credit-transactions`
- `routes/log-route.js` — 일지·첨부 (더 구체적인 `/:logId/attachments`를 `/:logId`보다 **위**에 두어 라우팅 충돌 방지)
- `routes/credit-transaction-route.js` — 크레딧 내역 컬렉션·단건
- `app.js` — 위 라우터를 `/users`, `/logs`, `/credit-transactions`에 마운트

존재하지 않는 리소스는 **404**와 `{ error: "…" }` 형태로 응답합니다.

참고: `routes/post-route.js`는 예전 예제 파일로 남아 있고, 현재 `app.js`에는 연결되어 있지 않습니다. 필요하면 알려 주세요.

---

**User**

api코드에 cors가 지금은 모두허용인데, 그러지말고 지금 개발하고 있는 localhost:5173만 허용하게끔 해줘. 나중에 배포하고나면 배포한 도메인도 추가할 예정이야.

---

**Cursor**

API의 CORS 설정 확인 중입니다.



`http://localhost:5173`을 기본 허용하고, 배포 시 `CORS_ORIGIN`으로 추가 도메인을 넣을 수 있게 합니다.



적용해 두었습니다.

## 변경 요약

**`app.js`**
- 허용 출처: **`http://localhost:5173`** 는 항상 포함.
- 환경 변수 **`CORS_ORIGIN`** 에 콤마로 구분한 URL을 넣으면 그 출처들도 함께 허용 (나중에 배포 도메인용).
- 브라우저가 아닌 요청(Postman, `curl` 등)처럼 **`Origin` 헤더가 없으면** 통과시키는 방식은 그대로 두었습니다.
- `credentials: true` 로 두어, 나중에 쿠키·인증 헤더를 쓸 때도 맞춰 두었습니다.

**`.env.example`**
- `CORS_ORIGIN` 사용 예만 주석으로 적어 두었습니다.

배포 후에는 예를 들어 이렇게 설정하면 됩니다.

```bash
CORS_ORIGIN=https://your-production-domain.com
```

프로덕션에서 **`localhost:5173` 제외**만 쓰고 싶다면, 그때는 `defaultCorsOrigins`를 `NODE_ENV === "production"` 일 때 비우는 식으로 바꾸면 됩니다. 원하면 그 분기도 코드에 넣어 줄 수 있습니다.

