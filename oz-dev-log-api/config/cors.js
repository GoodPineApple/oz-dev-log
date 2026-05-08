import cors from "cors";

const isProduction = process.env.NODE_ENV === "production";

const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const extraCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

const allowedCorsOrigins = [
  ...new Set([...defaultCorsOrigins, ...extraCorsOrigins]),
];

function isLocalDevOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

/** Express용 CORS 미들웨어 */
export function corsMiddleware() {
  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedCorsOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!isProduction && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  });
}
