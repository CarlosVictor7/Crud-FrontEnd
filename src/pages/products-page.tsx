import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, ToggleLeft, Trash2 } from 'lucide-react'
import { ProductFormDialog } from '@/features/products/product-form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { canDeleteDefinitive, canManageProducts } from '@/lib/permissions'
import { formatCurrency } from '@/lib/utils'
import { productsService } from '@/services/products-service'
import { useAuthStore } from '@/store/auth-store'
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from '@/types/domain'

export function ProductsPage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const productsQuery = useQuery({
    queryKey: ['products', search, category, user?.role],
    queryFn: () =>
      productsService.list({
        active: 'true',
        search,
        category: category === 'all' ? undefined : category,
      }),
  })

  const createMutation = useMutation({
    mutationFn: productsService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setDialogOpen(false)
      setFeedback('Produto salvo com sucesso.')
    },
    onError: () => setFeedback('Nao foi possivel salvar o produto.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof productsService.update>[1] }) =>
      productsService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setDialogOpen(false)
      setEditingProduct(null)
      setFeedback('Produto atualizado com sucesso.')
    },
    onError: () => setFeedback('Nao foi possivel atualizar o produto.'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => productsService.updateStatus(id, active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: productsService.deleteDefinitive,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setFeedback('Produto removido definitivamente.')
    },
    onError: () => setFeedback('Delete bloqueado: inative antes de excluir definitivamente.'),
  })

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const canWrite = canManageProducts(user?.role)

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-3'>
          <CardTitle>Gestao de products</CardTitle>
          {canWrite ? (
            <Button
              onClick={() => {
                setEditingProduct(null)
                setDialogOpen(true)
              }}
            >
              <Plus className='size-4' />
              Novo produto
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className='mb-4 grid gap-2 md:grid-cols-[1fr_220px]'>
            <div className='flex items-center gap-2'>
              <Search className='size-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome...'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder='Categoria' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas</SelectItem>
                {PRODUCT_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {feedback ? <p className='mb-4 text-sm text-muted-foreground'>{feedback}</p> : null}

          <div className='overflow-hidden rounded-xl border border-border'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant='neutral'>{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.active ? 'success' : 'neutral'}>{product.active ? 'Ativo' : 'Inativo'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-end gap-2'>
                          {canWrite ? (
                            <>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  setEditingProduct(product)
                                  setDialogOpen(true)
                                }}
                              >
                                <Pencil className='size-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => statusMutation.mutate({ id: product._id, active: !product.active })}
                                title='Alterar status'
                              >
                                <ToggleLeft className='size-4' />
                              </Button>
                            </>
                          ) : null}
                          {canDeleteDefinitive(user?.role) ? (
                            <Button
                              variant='destructive'
                              size='icon'
                              onClick={() => {
                                if (window.confirm('Excluir definitivamente este produto?')) {
                                  deleteMutation.mutate(product._id)
                                }
                              }}
                              title='Delete definitivo'
                            >
                              <Trash2 className='size-4' />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingProduct}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (payload) => {
          if (editingProduct) {
            await updateMutation.mutateAsync({ id: editingProduct._id, payload })
            return
          }

          await createMutation.mutateAsync(payload)
        }}
      />
    </div>
  )
}
