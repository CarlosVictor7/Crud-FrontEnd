import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap'
import { AppLayout } from '@/layouts/app-layout'
import { AuthLayout } from '@/layouts/auth-layout'
import { ClientsPage } from '@/pages/clients-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ProductsPage } from '@/pages/products-page'
import { ProfilePage } from '@/pages/profile-page'
import { ProtectedRoute } from '@/routes/protected-route'
import { RoleRoute } from '@/routes/role-route'
import { useAuthStore } from '@/store/auth-store'

function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user)
  return user ? <Navigate to='/' replace /> : <AuthLayout />
}

export function AppRouter() {
  useAuthBootstrap()

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path='/login' element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/products' element={<ProductsPage />} />
          <Route path='/profile' element={<ProfilePage />} />

          <Route element={<RoleRoute allowedRoles={['super_admin', 'admin']} fallbackPath='/' />}>
            <Route path='/clients' element={<ClientsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
