import { MoonStar, ShieldCheck, Sun } from 'lucide-react'
import { LoboCoreLogo } from '@/components/branding/lobocore-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/hooks/use-theme'
import { LoginForm } from '@/features/auth/login-form'

export function LoginPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className='grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
      <section className='hidden rounded-3xl border border-border/70 bg-[linear-gradient(155deg,#020617,#0b1120_45%,#0e1d36)] p-8 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between'>
        <div>
          <div className='inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs'>
            Plataforma oficial
          </div>
          <LoboCoreLogo variant='large' className='mt-8 h-20 w-full max-w-md' />
          <h1 className='mt-8 text-3xl font-semibold'>Painel Administrativo Tecnologico</h1>
          <p className='mt-3 max-w-xl text-sm text-slate-300'>
            Controle total de operacoes, produtos e clientes com seguranca, velocidade e identidade visual premium.
          </p>
        </div>
        <div className='grid gap-3 text-sm text-slate-200'>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='size-4 text-cyan-300' />
            JWT com refresh token
          </div>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='size-4 text-cyan-300' />
            Controle por role em tempo real
          </div>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='size-4 text-cyan-300' />
            Interface responsiva e otimizada
          </div>
        </div>
      </section>

      <Card className='relative overflow-hidden border-border/80 bg-card/95'>
        <div className='absolute right-4 top-4'>
          <Button variant='outline' size='icon' onClick={toggleTheme}>
            {isDark ? <Sun className='size-4' /> : <MoonStar className='size-4' />}
          </Button>
        </div>

        <CardHeader className='pt-8'>
          <div className='rounded-xl bg-[linear-gradient(155deg,#020617,#0f172a)] p-3'>
            <LoboCoreLogo variant='large' className='h-14 w-full' />
          </div>
          <CardTitle className='text-xl'>Acesse sua conta</CardTitle>
          <CardDescription>Entre para continuar no ambiente administrativo da LoboCore.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
