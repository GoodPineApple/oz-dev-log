/**
 * 파일 저장소 추상화.
 *
 * 두 가지 구현:
 *   - 'firebase' (FIREBASE_* 환경변수가 모두 채워졌을 때): Firebase Storage.
 *   - 'local'    (그 외): public/uploads 로컬 디스크. 학생들이 Firebase 설정 전에도 흐름을 체험 가능.
 *
 * 두 구현 모두 동일한 인터페이스를 제공한다:
 *   upload(buffer, { filename, mimetype, logId })  → { fileUrl, filePath }
 *   delete(filePath)                               → void
 *
 * 호출자는 어떤 구현이 동작 중인지 모르고도 동작한다 — 라우트·컨트롤러는 깔끔하게 유지된다.
 */
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 파일명을 안전하게 — 알파넘/점/대시/언더스코어만 허용. */
function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 200);
}

function isFirebaseConfigured() {
  return (
    !!process.env.FIREBASE_PROJECT_ID &&
    !!process.env.FIREBASE_CLIENT_EMAIL &&
    !!process.env.FIREBASE_PRIVATE_KEY &&
    !!process.env.FIREBASE_STORAGE_BUCKET
  );
}

/** 어떤 저장소를 쓰는지 한 줄로 표시 (서버 부팅 로그/디버그용) */
export function storageDriverName() {
  return isFirebaseConfigured() ? "firebase" : "local";
}

async function createFirebaseStorage() {
  // 동적 import — firebase-admin 은 로컬 모드에서 굳이 로드하지 않는다.
  const admin = (await import("firebase-admin")).default;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // .env 의 PRIVATE KEY 줄바꿈은 보통 "\n" 으로 이스케이프되어 들어온다.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  const bucket = admin.storage().bucket();

  return {
    driver: "firebase",
    async upload(buffer, { filename, mimetype, logId }) {
      const id = randomUUID();
      const filePath = `attachments/${logId}/${id}-${safeFilename(filename)}`;
      const file = bucket.file(filePath);

      // Firebase 가 제공하는 다운로드 토큰 패턴.
      // 버킷이 uniform/granular 어느 모드든 동작하고, 토큰이 있는 URL만 공개된다.
      const token = randomUUID();
      await file.save(buffer, {
        contentType: mimetype,
        resumable: false,
        metadata: {
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });

      const encoded = encodeURIComponent(filePath);
      const fileUrl =
        `https://firebasestorage.googleapis.com/v0/b/${bucket.name}` +
        `/o/${encoded}?alt=media&token=${token}`;

      return { fileUrl, filePath };
    },
    async delete(filePath) {
      if (!filePath) return;
      await bucket.file(filePath).delete({ ignoreNotFound: true });
    },
  };
}

async function createLocalStorage() {
  const port = Number(process.env.PORT) || 3000;
  const publicBaseUrl =
    process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`;
  const uploadsDir = path.resolve(__dirname, "..", "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  return {
    driver: "local",
    async upload(buffer, { filename, mimetype, logId }) {
      const id = randomUUID();
      const relPath = `${logId}/${id}-${safeFilename(filename)}`;
      const absPath = path.join(uploadsDir, relPath);
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, buffer);
      void mimetype; // express.static 이 응답 시 추론한다.
      const fileUrl = `${publicBaseUrl}/uploads/${relPath}`;
      const filePath = `uploads/${relPath}`;
      return { fileUrl, filePath };
    },
    async delete(filePath) {
      if (!filePath) return;
      const rel = filePath.replace(/^uploads\//, "");
      const absPath = path.join(uploadsDir, rel);
      await fs.rm(absPath, { force: true });
    },
  };
}

let storageImpl = null;

export async function initStorage() {
  if (storageImpl) return storageImpl;
  storageImpl = isFirebaseConfigured()
    ? await createFirebaseStorage()
    : await createLocalStorage();
  console.log(`[api] 파일 저장소 드라이버: ${storageImpl.driver}`);
  return storageImpl;
}

export function getStorage() {
  if (!storageImpl) {
    throw new Error("Storage 가 초기화되지 않았습니다. initStorage() 호출 필요.");
  }
  return storageImpl;
}
