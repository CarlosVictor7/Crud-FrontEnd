import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center'>
      <h2 className='text-3xl font-semibold'>Pagina nao encontrada</h2>
      <p className='text-muted-foreground'>A rota informada nao existe dentro do ambiente LoboCore.</p>
      <Link to='/'>
        <Button>Voltar ao dashboard</Button>
      </Link>
    </div>
  )
}
