import http from '../lib/http';
import type { ApiResponse } from '../types/api';
import type { ProductCategory, ProductRecord } from '../types/domain';

export interface ProductPayload {
  name: string;
  price: number;
  stock: number;
  category: ProductCategory;
  description?: string;
}

export const productsService = {
  async list(params?: { active?: boolean; search?: string; category?: ProductCategory }) {
    const response = await http.get<ApiResponse<ProductRecord[]>>('/products', {
      params: {
        active: typeof params?.active === 'boolean' ? String(params.active) : undefined,
        search: params?.search,
        category: params?.category
      }
    });
    return response.data.data;
  },

  async create(payload: ProductPayload) {
    const response = await http.post<ApiResponse<ProductRecord>>('/products', payload);
    return response.data.data;
  },

  async update(id: string, payload: Partial<ProductPayload>) {
    const response = await http.put<ApiResponse<ProductRecord>>(`/products/${id}`, payload);
    return response.data.data;
  },

  async patchStatus(id: string, active: boolean) {
    const response = await http.patch<ApiResponse<ProductRecord>>(`/products/${id}/status`, { active });
    return response.data.data;
  },

  async remove(id: string) {
    await http.delete(`/products/${id}`);
  }
};
