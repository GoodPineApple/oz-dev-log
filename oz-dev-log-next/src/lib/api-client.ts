import { getStoredToken, clearStoredToken } from "./client-auth";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type ErrorBody = {
  error?: { code?: string; message?: string; status?: number };
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

async function throwErrorFromResponse(res: Response): Promise<never> {
  let body: ErrorBody | null = null;
  try {
    body = await parseJson<ErrorBody>(res.clone());
  } catch {
    /* non-JSON */
  }
  const message =
    body?.error?.message ?? res.statusText ?? `요청 실패 (${res.status})`;
  const code = body?.error?.code ?? "UNKNOWN";
  throw new ApiError(message, res.status, code);
}

export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (
    init?.body &&
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    if (res.status === 401) clearStoredToken();
    await throwErrorFromResponse(res);
  }
  return parseJson<T>(res);
}
