import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/store/auth-store'

export function useAuthBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const setUser = useAuthStore((state) => state.setUser)
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap)
  const logout = useAuthStore((state) => state.logout)

  const meQuery = useQuery({
    queryKey: ['auth', 'bootstrap'],
    enabled: Boolean(accessToken && refreshToken),
    queryFn: authService.me,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      finishBootstrap()
      return
    }

    if (meQuery.isSuccess) {
      setUser(meQuery.data)
      finishBootstrap()
      return
    }

    if (meQuery.isError) {
      logout()
    }
  }, [accessToken, refreshToken, finishBootstrap, logout, meQuery.data, meQuery.isError, meQuery.isSuccess, setUser])

  if (!accessToken || !refreshToken) {
    finishBootstrap()
  }
}
