/**
 * true이면 라우트가 mock-data만 사용하고 DB 연결을 생략합니다.
 */
export function useMockData() {
  return process.env.USE_MOCK_DATA === "true";
}
