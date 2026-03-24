import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

export function ProtectedRoute() {
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)

  if (isBootstrapping) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground'>
          Carregando sessão...
        </div>
      </div>
    )
  }

  if (!accessToken || !user) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  return <Outlet />
}
