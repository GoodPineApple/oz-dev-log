import { createSwaggerSpec } from "next-swagger-doc";

export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "DevLog Next API",
        version: "1.0.0",
        description:
          "Next.js 풀스택 프로젝트의 서버 사이드 API.\n\n" +
          "모든 보호 엔드포인트는 `Authorization: Bearer <JWT>` 헤더가 필요합니다.\n" +
          "토큰은 `/api/auth/login` 또는 `/api/auth/register`로 발급받을 수 있습니다.",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              nickname: { type: "string" },
              totalCredits: { type: "integer" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          Log: {
            type: "object",
            properties: {
              id: { type: "integer" },
              userId: { type: "string" },
              title: { type: "string" },
              content: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          Attachment: {
            type: "object",
            properties: {
              id: { type: "integer" },
              logId: { type: "integer" },
              fileName: { type: "string" },
              fileUrl: { type: "string" },
              fileType: { type: "string", enum: ["image", "file"] },
              fileSize: { type: "integer" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          CreditTransaction: {
            type: "object",
            properties: {
              id: { type: "integer" },
              userId: { type: "string" },
              logId: { type: "integer", nullable: true },
              amount: { type: "integer" },
              type: { type: "string", enum: ["earn", "spend", "bonus", "adjust"] },
              description: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  });
}
