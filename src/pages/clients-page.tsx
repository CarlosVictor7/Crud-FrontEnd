import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, ToggleLeft, Trash2 } from 'lucide-react'
import { ClientFormDialog } from '@/features/clients/client-form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { canDeleteDefinitive } from '@/lib/permissions'
import { clientsService } from '@/services/clients-service'
import { useAuthStore } from '@/store/auth-store'
import type { Client } from '@/types/domain'

export function ClientsPage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const clientsQuery = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsService.list({ active: 'true', search }),
  })

  const createMutation = useMutation({
    mutationFn: clientsService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      setDialogOpen(false)
      setFeedback('Cliente salvo com sucesso.')
    },
    onError: () => setFeedback('Nao foi possivel salvar o cliente.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof clientsService.update>[1] }) =>
      clientsService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      setDialogOpen(false)
      setEditingClient(null)
      setFeedback('Cliente atualizado com sucesso.')
    },
    onError: () => setFeedback('Nao foi possivel atualizar o cliente.'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => clientsService.updateStatus(id, active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: clientsService.deleteDefinitive,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      setFeedback('Cliente removido definitivamente.')
    },
    onError: () => setFeedback('Delete bloqueado: inative antes de excluir definitivamente.'),
  })

  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data])

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-3'>
          <CardTitle>Gestao de clients</CardTitle>
          <Button
            onClick={() => {
              setEditingClient(null)
              setDialogOpen(true)
            }}
          >
            <Plus className='size-4' />
            Novo cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-2'>
            <Search className='size-4 text-muted-foreground' />
            <Input
              placeholder='Buscar por nome...'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {feedback ? <p className='mb-4 text-sm text-muted-foreground'>{feedback}</p> : null}

          <div className='overflow-hidden rounded-xl border border-border'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client._id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.email ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={client.active ? 'success' : 'neutral'}>{client.active ? 'Ativo' : 'Inativo'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              setEditingClient(client)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className='size-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => statusMutation.mutate({ id: client._id, active: !client.active })}
                            title='Alterar status'
                          >
                            <ToggleLeft className='size-4' />
                          </Button>
                          {canDeleteDefinitive(user?.role) ? (
                            <Button
                              variant='destructive'
                              size='icon'
                              onClick={() => {
                                if (window.confirm('Excluir definitivamente este cliente?')) {
                                  deleteMutation.mutate(client._id)
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

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingClient}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (payload) => {
          if (editingClient) {
            await updateMutation.mutateAsync({ id: editingClient._id, payload })
            return
          }

          await createMutation.mutateAsync(payload)
        }}
      />
    </div>
  )
}
