import http from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type { Product, ProductCategory } from '@/types/domain'

export interface ProductPayload {
  name: string
  price: number
  stock: number
  category: ProductCategory
  description?: string
}

export interface ProductsQuery {
  active?: 'true' | 'false'
  category?: ProductCategory
  search?: string
}

export const productsService = {
  list: async (params?: ProductsQuery) => {
    const response = await http.get<ApiResponse<Product[]>>('/products', { params })
    return response.data.data
  },
  create: async (payload: ProductPayload) => {
    const response = await http.post<ApiResponse<Product>>('/products', payload)
    return response.data.data
  },
  update: async (id: string, payload: Partial<ProductPayload>) => {
    const response = await http.put<ApiResponse<Product>>(`/products/${id}`, payload)
    return response.data.data
  },
  updateStatus: async (id: string, active: boolean) => {
    const response = await http.patch<ApiResponse<Product>>(`/products/${id}/status`, { active })
    return response.data.data
  },
  deleteDefinitive: async (id: string) => {
    const response = await http.delete<ApiResponse<null>>(`/products/${id}`)
    return response.data
  },
}
