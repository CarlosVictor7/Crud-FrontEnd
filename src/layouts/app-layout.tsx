import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/navigation/app-header'
import { DesktopSidebar, MobileSidebar } from '@/components/navigation/sidebar'

export function AppLayout() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='flex min-h-screen'>
        <DesktopSidebar />
        <MobileSidebar />
        <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
          <AppHeader />
          <main className='flex-1 p-4 md:p-6'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
