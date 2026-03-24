import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoboCoreLogo } from '@/components/branding/lobocore-logo'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/hooks/use-theme'
import type { User } from '@/types/domain'

interface ProfileSummaryProps {
  user: User
}

export function ProfileSummary({ user }: ProfileSummaryProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
      <Card>
        <CardHeader>
          <CardTitle>Perfil institucional</CardTitle>
          <CardDescription>Informacoes da sessao autenticada no LoboCore.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex items-center justify-between rounded-xl border border-border p-3'>
            <span className='text-muted-foreground'>Nome</span>
            <span className='font-medium'>{user.name}</span>
          </div>
          <div className='flex items-center justify-between rounded-xl border border-border p-3'>
            <span className='text-muted-foreground'>E-mail</span>
            <span className='font-medium'>{user.email}</span>
          </div>
          <div className='flex items-center justify-between rounded-xl border border-border p-3'>
            <span className='text-muted-foreground'>Role</span>
            <Badge variant='default'>{user.role}</Badge>
          </div>
          <div className='flex items-center justify-between rounded-xl border border-border p-3'>
            <span className='text-muted-foreground'>Tema escuro</span>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-[linear-gradient(155deg,#020617,#0f172a)] text-white'>
        <CardHeader>
          <CardTitle>Marca oficial</CardTitle>
          <CardDescription className='text-slate-300'>Identidade visual institucional da plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoboCoreLogo variant='large' className='h-16 w-full' />
        </CardContent>
      </Card>
    </div>
  )
}
