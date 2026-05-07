import { Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clearStoredUserId, getStoredUserId } from '../lib/auth'
import { fetchUser } from '../api/devlog'
import { AppLayout } from '../components/Layout'

export function RequireAuth() {
  const userId = getStoredUserId()
  const navigate = useNavigate()

  const { data: user, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  })

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (isError) {
    clearStoredUserId()
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-zinc-500">
        불러오는 중…
      </div>
    )
  }

  return (
    <AppLayout
      user={user}
      onLogout={() => {
        clearStoredUserId()
        navigate('/login', { replace: true })
      }}
    />
  )
}
