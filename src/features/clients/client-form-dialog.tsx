import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import type { Client } from '@/types/domain'

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no minimo 2 caracteres'),
  phone: z.string().min(8, 'Telefone deve ter no minimo 8 caracteres'),
  email: z.string().email('E-mail invalido').optional().or(z.literal('')),
  document: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Client | null
  onSubmit: (payload: ClientFormData) => Promise<void>
  isPending: boolean
}

export function ClientFormDialog({ open, onOpenChange, initialData, onSubmit, isPending }: ClientFormDialogProps) {
  const isEditing = Boolean(initialData)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      document: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email ?? '',
        document: initialData.document ?? '',
      })
      return
    }

    reset({
      name: '',
      phone: '',
      email: '',
      document: '',
    })
  }, [initialData, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          <DialogDescription>Gerencie os dados essenciais do cliente no LoboCore.</DialogDescription>
        </DialogHeader>

        <form className='space-y-4' onSubmit={handleSubmit(async (values) => onSubmit(values))}>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome</Label>
            <Input id='name' {...register('name')} />
            {errors.name ? <p className='text-xs text-destructive'>{errors.name.message}</p> : null}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Telefone</Label>
            <Input id='phone' {...register('phone')} />
            {errors.phone ? <p className='text-xs text-destructive'>{errors.phone.message}</p> : null}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>E-mail</Label>
            <Input id='email' {...register('email')} />
            {errors.email ? <p className='text-xs text-destructive'>{errors.email.message}</p> : null}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='document'>Documento</Label>
            <Input id='document' {...register('document')} />
          </div>

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='ghost' onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? <Loader2 className='size-4 animate-spin' /> : null}
              {isEditing ? 'Salvar alteracoes' : 'Criar cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
