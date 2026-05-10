import { useEffect, useState } from 'react'
import { getBackend, onBackendChange, setBackend, type Backend } from '../lib/backend'

/**
 * 활성 백엔드를 React 상태로 노출. 변경 시 자동 재렌더된다.
 * 모든 useQuery는 queryKey에 backend를 포함시켜 백엔드 간 캐시 충돌을 막는다.
 */
export function useBackend(): [Backend, (next: Backend) => void] {
  const [backend, setLocal] = useState<Backend>(getBackend)
  useEffect(() => onBackendChange((next) => setLocal(next)), [])
  return [backend, setBackend]
}
