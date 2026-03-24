import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { LoboCoreLogo } from '@/components/branding/lobocore-logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { clientsService } from '@/services/clients-service'
import { productsService } from '@/services/products-service'
import { useAuthStore } from '@/store/auth-store'
import { InventoryChart } from '@/features/dashboard/inventory-chart'
import { KpiCard } from '@/features/dashboard/kpi-card'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const [clientsQuery, productsQuery] = useQueries({
    queries: [
      {
        queryKey: ['clients', 'dashboard'],
        queryFn: () => clientsService.list({ active: 'true' }),
        enabled: user?.role !== 'client',
      },
      {
        queryKey: ['products', 'dashboard'],
        queryFn: () => productsService.list({ active: 'true' }),
      },
    ],
  })

  const products = productsQuery.data ?? []
  const clients = clientsQuery.data ?? []

  const chartData = useMemo(
    () =>
      products
        .slice(0, 8)
        .map((product) => ({
          name: product.name.length > 10 ? `${product.name.slice(0, 10)}...` : product.name,
          stock: product.stock,
        })),
    [products]
  )

  if (productsQuery.isLoading || (user?.role !== 'client' && clientsQuery.isLoading)) {
    return (
      <div className='grid gap-4'>
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-80 w-full' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Card className='overflow-hidden'>
        <CardContent className='flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm text-muted-foreground'>Bem-vindo de volta</p>
            <h2 className='text-2xl font-semibold'>Ola, {user?.name}</h2>
            <p className='text-sm text-muted-foreground'>Visao geral operacional da plataforma LoboCore.</p>
          </div>
          <div className='w-full max-w-xs rounded-xl bg-[linear-gradient(155deg,#020617,#0f172a)] p-3'>
            <LoboCoreLogo variant='compact' className='h-10 w-full' />
          </div>
        </CardContent>
      </Card>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <KpiCard label='Produtos ativos' value={products.length} helper='Contagem simples por listagem' />
        <KpiCard
          label='Estoque total'
          value={products.reduce((total, item) => total + item.stock, 0)}
          helper='Soma do estoque exibido'
        />
        <KpiCard
          label='Clientes ativos'
          value={user?.role === 'client' ? 0 : clients.length}
          helper={user?.role === 'client' ? 'Nao disponivel para este perfil' : 'Contagem simples por listagem'}
        />
        <KpiCard
          label='Seu perfil'
          value={1}
          helper={`Role atual: ${user?.role ?? 'desconhecida'}`}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Panorama de estoque</CardTitle>
          <CardDescription>
            {chartData.length > 0
              ? 'Visualizacao com base nos primeiros produtos ativos retornados pela API.'
              : 'Sem dados suficientes para grafico. Fallback elegante aplicado.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <InventoryChart data={chartData} />
          ) : (
            <div className='rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
              Nenhum produto ativo encontrado para montar o grafico.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
