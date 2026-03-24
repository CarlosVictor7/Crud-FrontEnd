import { toCategory } from '../../lib/product-category';

export type ProductSort = 'newest' | 'priceAsc' | 'priceDesc' | 'stockLow';

export interface ProductTableRecord {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export const filterAndSortProducts = (
  products: ProductTableRecord[],
  filters: {
    searchTerm: string;
    categoryFilter: string;
    statusFilter: 'all' | 'active' | 'inactive';
    sortBy: ProductSort;
  }
): ProductTableRecord[] => {
  let result = [...products];

  if (filters.searchTerm) {
    const low = filters.searchTerm.toLowerCase();
    result = result.filter(
      (product) => product.name.toLowerCase().includes(low) || product.sku.toLowerCase().includes(low)
    );
  }

  if (filters.categoryFilter !== 'all') {
    result = result.filter((product) => toCategory(product.category) === toCategory(filters.categoryFilter));
  }

  if (filters.statusFilter !== 'all') {
    result = result.filter((product) => product.active === (filters.statusFilter === 'active'));
  }

  result.sort((a, b) => {
    if (filters.sortBy === 'priceAsc') return a.price - b.price;
    if (filters.sortBy === 'priceDesc') return b.price - a.price;
    if (filters.sortBy === 'stockLow') return a.stock - b.stock;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
};

export const productDeleteErrorFeedback = (message?: string): string => {
  const text = (message || '').toLowerCase();
  if (text.includes('inativ')) {
    return 'Para excluir definitivamente, primeiro inative o produto e tente novamente.';
  }

  return message || 'Erro ao excluir';
};
