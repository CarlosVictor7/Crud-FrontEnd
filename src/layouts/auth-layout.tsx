import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className='relative min-h-screen overflow-hidden bg-background'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.16),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.22),transparent_35%),radial-gradient(circle_at_50%_85%,rgba(6,182,212,0.12),transparent_45%)]' />
      <div className='relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center p-4 md:p-8'>
        <Outlet />
      </div>
    </div>
  )
}
