import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PRODUCT_CATEGORIES, type Product } from '@/types/domain'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no minimo 2 caracteres'),
  price: z.number().positive('Preco deve ser maior que zero'),
  stock: z.number().int('Estoque precisa ser inteiro').min(0, 'Estoque minimo 0'),
  category: z.enum(PRODUCT_CATEGORIES),
  description: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Product | null
  onSubmit: (payload: ProductFormData) => Promise<void>
  isPending: boolean
}

export function ProductFormDialog({ open, onOpenChange, initialData, onSubmit, isPending }: ProductFormDialogProps) {
  const isEditing = Boolean(initialData)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      category: 'informatica',
      description: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        price: initialData.price,
        stock: initialData.stock,
        category: initialData.category,
        description: initialData.description ?? '',
      })
      return
    }

    reset({
      name: '',
      price: 0,
      stock: 0,
      category: 'informatica',
      description: '',
    })
  }, [initialData, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            SKU e readonly e definido no backend. Status deve ser alterado apenas por PATCH /status.
          </DialogDescription>
        </DialogHeader>

        <form className='space-y-4' onSubmit={handleSubmit(async (values) => onSubmit(values))}>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome</Label>
            <Input id='name' {...register('name')} />
            {errors.name ? <p className='text-xs text-destructive'>{errors.name.message}</p> : null}
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='price'>Preco</Label>
              <Input
                id='price'
                type='number'
                step='0.01'
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price ? <p className='text-xs text-destructive'>{errors.price.message}</p> : null}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='stock'>Estoque</Label>
              <Input id='stock' type='number' {...register('stock', { valueAsNumber: true })} />
              {errors.stock ? <p className='text-xs text-destructive'>{errors.stock.message}</p> : null}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Categoria</Label>
            <Select value={watch('category')} onValueChange={(value) => setValue('category', value as ProductFormData['category'])}>
              <SelectTrigger>
                <SelectValue placeholder='Selecione a categoria' />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? <p className='text-xs text-destructive'>{errors.category.message}</p> : null}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Descricao</Label>
            <Textarea id='description' {...register('description')} />
          </div>

          {initialData ? (
            <div className='rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
              SKU: {initialData.sku} (somente leitura)
            </div>
          ) : null}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='ghost' onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? <Loader2 className='size-4 animate-spin' /> : null}
              {isEditing ? 'Salvar alteracoes' : 'Criar produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
