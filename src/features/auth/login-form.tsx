import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/store/auth-store'

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail valido'),
  password: z.string().min(6, 'A senha precisa ter no minimo 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
      navigate(nextPath, { replace: true })
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values)
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-2'>
        <Label htmlFor='email'>E-mail</Label>
        <Input id='email' type='email' placeholder='carlos@admin.com' autoComplete='email' {...register('email')} />
        {errors.email ? <p className='text-xs text-destructive'>{errors.email.message}</p> : null}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Senha</Label>
        <Input id='password' type='password' placeholder='••••••••' autoComplete='current-password' {...register('password')} />
        {errors.password ? <p className='text-xs text-destructive'>{errors.password.message}</p> : null}
      </div>

      {loginMutation.isError ? (
        <p className='rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
          Nao foi possivel autenticar. Verifique as credenciais e tente novamente.
        </p>
      ) : null}

      <Button className='w-full' type='submit' disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <>
            <Loader2 className='size-4 animate-spin' />
            Entrando...
          </>
        ) : (
          <>
            Entrar no LoboCore
            <ArrowRight className='size-4' />
          </>
        )}
      </Button>
    </form>
  )
}
