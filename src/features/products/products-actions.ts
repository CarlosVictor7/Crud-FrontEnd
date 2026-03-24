import { runtimeApi } from '../../services/runtime-api';
import { productDeleteErrorFeedback } from './products-utils';

export const loadProductsAction = async ({
  isClient,
  setLoading,
  setProducts,
  showToast,
}: {
  isClient: boolean;
  setLoading: (value: boolean) => void;
  setProducts: (value: any[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}) => {
  setLoading(true);
  try {
    const data = await runtimeApi.products.get();
    setProducts(isClient ? data.filter((product) => product.active) : data);
  } catch {
    showToast('Erro ao carregar produtos', 'error');
  } finally {
    setLoading(false);
  }
};

export const submitProductAction = async ({
  editingProduct,
  formData,
  setSaving,
  showToast,
  closeModal,
  reload,
}: {
  editingProduct: any;
  formData: {
    name: string;
    sku: string;
    price: string;
    stock: string;
    category: string;
    description: string;
  };
  setSaving: (value: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  closeModal: () => void;
  reload: () => Promise<void>;
}) => {
  setSaving(true);
  const payload = {
    ...formData,
    price: parseFloat(formData.price || '0'),
    stock: parseInt(formData.stock || '0', 10),
  };

  try {
    if (editingProduct) {
      await runtimeApi.products.put(editingProduct.id, payload);
      showToast('Produto atualizado', 'success');
    } else {
      await runtimeApi.products.post(payload);
      showToast('Produto criado', 'success');
    }

    closeModal();
    await reload();
  } catch {
    showToast('Erro ao salvar produto', 'error');
  } finally {
    setSaving(false);
  }
};

export const toggleProductStatusAction = async ({
  id,
  currentStatus,
  products,
  setProducts,
  showToast,
}: {
  id: string;
  currentStatus: boolean;
  products: any[];
  setProducts: (value: any[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}) => {
  try {
    await runtimeApi.products.patchStatus(id, !currentStatus);
    showToast(`Produto ${!currentStatus ? 'ativado' : 'inativado'}`, 'success');
    setProducts(products.map((product) => (product.id === id ? { ...product, active: !currentStatus } : product)));
  } catch {
    showToast('Erro ao alterar status', 'error');
  }
};

export const deleteProductAction = async ({
  itemToDelete,
  setSaving,
  products,
  setProducts,
  closeDeleteModal,
  showToast,
}: {
  itemToDelete: any;
  setSaving: (value: boolean) => void;
  products: any[];
  setProducts: (value: any[]) => void;
  closeDeleteModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}) => {
  if (!itemToDelete) return;

  setSaving(true);
  try {
    await runtimeApi.products.delete(itemToDelete.id);
    showToast('Produto excluído', 'success');
    setProducts(products.filter((product) => product.id !== itemToDelete.id));
    closeDeleteModal();
  } catch (error: any) {
    const feedback = productDeleteErrorFeedback(error?.message);
    const level = feedback.includes('primeiro inative') ? 'warning' : 'error';
    showToast(feedback, level);
  } finally {
    setSaving(false);
  }
};
