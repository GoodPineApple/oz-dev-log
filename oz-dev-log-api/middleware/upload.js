/**
 * multer 미들웨어 — 멀티파트 업로드를 메모리 버퍼로 받는다.
 *
 * 학습 포인트:
 *   - multer.memoryStorage(): 파일이 디스크에 닿기 전에 buffer 상태로 컨트롤러에 전달된다.
 *     이후 storage 계층이 Firebase Storage 등 외부 저장소로 그대로 흘려보낸다.
 *   - limits.fileSize: 클라이언트가 거대한 파일을 보내 메모리를 압박하지 못하게 한다.
 *   - fileFilter: MIME 타입 검사. 클라이언트의 accept="image/*" 는 가이드일 뿐이라
 *     서버에서 한 번 더 검증한다.
 *   - .single("file"): 폼 필드 이름이 "file" 인 한 개의 파일만 받는다.
 *   - 에러는 HttpError 로 통일 — 글로벌 에러 핸들러가 응답 스키마를 일원화한다.
 *     multer 의 LIMIT_FILE_SIZE 같은 라이브러리 고유 에러도 글로벌 핸들러가 잡아준다.
 */
import multer from "multer";
import { HttpError } from "../lib/http-error.js";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * 한글 파일명 복원.
 *
 * multer 는 multipart 의 filename 헤더를 항상 latin-1 로 디코드해
 * `file.originalname` 에 넣는다. 클라이언트(브라우저)는 UTF-8 로 보내므로,
 * 한글이 들어 있던 파일명은 "안녕.png" → "ìë…•.png" 같은 모양으로 깨진다.
 * 받자마자 latin-1 → UTF-8 로 재해석해 원본 한글을 복원한다.
 *
 * 이 함수는 ASCII 파일명에는 영향이 없다 (왕복 인코딩이 동등).
 */
function fixOriginalNameEncoding(file) {
  try {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8",
    );
  } catch {
    /* 변환 실패해도 원본 그대로 두고 통과 */
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter(_req, file, cb) {
    fixOriginalNameEncoding(file);
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        HttpError.badRequest(
          "이미지 파일만 업로드 가능합니다.",
          "UNSUPPORTED_MEDIA_TYPE",
        ),
      );
    }
  },
});

/** POST 시 사용할 단일 파일 multer 미들웨어 (필드명: "file") */
export const uploadSingleImage = upload.single("file");
