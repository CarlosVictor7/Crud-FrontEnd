import { LayoutDashboard, Package, ShieldUser, UserCircle2, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LoboCoreLogo } from '@/components/branding/lobocore-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  hiddenForClient?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Clients', path: '/clients', icon: Users, hiddenForClient: true },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Profile', path: '/profile', icon: UserCircle2 },
]

function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user)
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed)
  const setMobileSidebar = useUiStore((state) => state.setMobileSidebar)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground',
        isSidebarCollapsed && !mobile ? 'w-[88px]' : 'w-72'
      )}
    >
      <div className='flex h-20 items-center justify-between border-b border-border/80 px-4'>
        <div
          className={cn(
            'flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#020617,#0f172a)] px-3',
            isSidebarCollapsed && !mobile ? 'w-12' : 'w-full'
          )}
        >
          {isSidebarCollapsed && !mobile ? (
            <LoboCoreLogo variant='icon' className='h-7 w-7' />
          ) : (
            <LoboCoreLogo variant='compact' className='h-8 w-full max-w-44' />
          )}
        </div>
        {mobile ? (
          <Button variant='ghost' size='icon' onClick={() => setMobileSidebar(false)} aria-label='Fechar menu'>
            <X className='size-5' />
          </Button>
        ) : null}
      </div>

      <nav className='flex-1 space-y-2 p-3'>
        {navItems
          .filter((item) => (user?.role === 'client' ? !item.hiddenForClient : true))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  isSidebarCollapsed && !mobile ? 'justify-center px-0' : ''
                )
              }
              onClick={() => {
                if (mobile) {
                  setMobileSidebar(false)
                }
              }}
            >
              <item.icon className='size-5 shrink-0' />
              {isSidebarCollapsed && !mobile ? null : <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      <div className='border-t border-border/70 p-4 text-xs text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <ShieldUser className='size-4 text-primary' />
          {isSidebarCollapsed && !mobile ? null : <span>LoboCore • Painel Administrativo Tecnologico</span>}
        </div>
      </div>
    </aside>
  )
}

export function DesktopSidebar() {
  return (
    <div className='hidden h-screen shrink-0 md:block'>
      <SidebarContent />
    </div>
  )
}

export function MobileSidebar() {
  const isOpen = useUiStore((state) => state.isMobileSidebarOpen)

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 md:hidden'>
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' />
      <div className='absolute left-0 top-0 h-full'>
        <SidebarContent mobile />
      </div>
    </div>
  )
}
