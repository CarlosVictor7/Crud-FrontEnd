import { runtimeApi } from '../../services/runtime-api';
import { clientDeleteErrorFeedback } from './clients-utils';

export const loadClientsAction = async ({
  setLoading,
  setClients,
  showToast,
}: {
  setLoading: (value: boolean) => void;
  setClients: (value: any[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}) => {
  setLoading(true);
  try {
    const data = await runtimeApi.clients.get();
    setClients(data);
  } catch {
    showToast('Erro ao carregar clientes', 'error');
  } finally {
    setLoading(false);
  }
};

export const submitClientAction = async ({
  editingClient,
  formData,
  setSaving,
  showToast,
  closeModal,
  reload,
}: {
  editingClient: any;
  formData: { name: string; email: string; phone: string; document: string };
  setSaving: (value: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  closeModal: () => void;
  reload: () => Promise<void>;
}) => {
  setSaving(true);
  try {
    if (editingClient) {
      await runtimeApi.clients.put(editingClient.id, formData);
      showToast('Cliente atualizado com sucesso', 'success');
    } else {
      await runtimeApi.clients.post(formData);
      showToast('Cliente criado com sucesso', 'success');
    }

    closeModal();
    await reload();
  } catch {
    showToast('Erro ao salvar cliente', 'error');
  } finally {
    setSaving(false);
  }
};

export const toggleClientStatusAction = async ({
  id,
  currentStatus,
  clients,
  setClients,
  showToast,
}: {
  id: string;
  currentStatus: boolean;
  clients: any[];
  setClients: (value: any[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}) => {
  try {
    await runtimeApi.clients.patchStatus(id, !currentStatus);
    showToast(`Cliente ${!currentStatus ? 'ativado' : 'inativado'}`, 'success');
    setClients(clients.map((client) => (client.id === id ? { ...client, active: !currentStatus } : client)));
  } catch {
    showToast('Erro ao alterar status', 'error');
  }
};

export const deleteClientAction = async ({
  itemToDelete,
  setSaving,
  clients,
  setClients,
  closeDeleteModal,
  showToast,
}: {
  itemToDelete: any;
  setSaving: (value: boolean) => void;
  clients: any[];
  setClients: (value: any[]) => void;
  closeDeleteModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}) => {
  if (!itemToDelete) return;

  setSaving(true);
  try {
    await runtimeApi.clients.delete(itemToDelete.id);
    showToast('Cliente excluído permanentemente', 'success');
    setClients(clients.filter((client) => client.id !== itemToDelete.id));
    closeDeleteModal();
  } catch (error: any) {
    const feedback = clientDeleteErrorFeedback(error?.message);
    const level = feedback.includes('primeiro inative') ? 'warning' : 'error';
    showToast(feedback, level);
  } finally {
    setSaving(false);
  }
};
