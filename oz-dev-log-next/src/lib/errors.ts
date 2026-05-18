export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return Response.json(
      { error: { code: err.code, message: err.message, status: err.status } },
      { status: err.status },
    );
  }
  console.error(err);
  return Response.json(
    { error: { code: "INTERNAL", message: "서버 내부 오류", status: 500 } },
    { status: 500 },
  );
}
