/** 서버 저장 전 로컬 작성용 크레딧 안내 (기획서 예시 규칙과 유사) */
export function estimateCredits(params: {
  hasAttachment: boolean
  contentLength: number
  isFirstPostToday: boolean
}) {
  let total = 0
  const parts: string[] = []
  if (params.isFirstPostToday) {
    total += 100
    parts.push('일지 작성 100 CP')
  }
  if (params.hasAttachment) {
    total += 20
    parts.push('첨부 보너스 +20 CP')
  }
  if (params.contentLength >= 300) {
    total += 10
    parts.push('300자 이상 +10 CP')
  }
  return { total, parts }
}
