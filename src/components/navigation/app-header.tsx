import { LogOut, Menu, MoonStar, Sun, User2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/use-theme'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'

const pageTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/products': 'Products',
  '/profile': 'Profile',
}

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const setMobileSidebar = useUiStore((state) => state.setMobileSidebar)
  const { isDark, toggleTheme } = useTheme()

  const pageTitle = pageTitleMap[location.pathname] ?? 'LoboCore'

  return (
    <header className='sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl'>
      <div className='flex h-16 items-center justify-between gap-4 px-4 md:px-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' className='md:hidden' onClick={() => setMobileSidebar(true)}>
            <Menu className='size-5' />
          </Button>
          <Button variant='ghost' size='icon' className='hidden md:inline-flex' onClick={toggleSidebar}>
            <Menu className='size-5' />
          </Button>
          <div>
            <p className='text-sm text-muted-foreground'>Painel Administrativo Tecnologico</p>
            <h1 className='text-lg font-semibold text-foreground'>{pageTitle}</h1>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={toggleTheme}>
            {isDark ? <Sun className='size-4' /> : <MoonStar className='size-4' />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='h-10 gap-2 rounded-full px-3'>
                <User2 className='size-4' />
                <span className='hidden text-xs md:inline'>{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>
                <p className='font-semibold'>{user?.name}</p>
                <p className='text-xs text-muted-foreground'>{user?.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                <LogOut className='mr-2 size-4' />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
