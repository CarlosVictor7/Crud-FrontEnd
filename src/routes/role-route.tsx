import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '@/types/domain'
import { useAuthStore } from '@/store/auth-store'

interface RoleRouteProps {
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export function RoleRoute({ allowedRoles, fallbackPath = '/' }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
