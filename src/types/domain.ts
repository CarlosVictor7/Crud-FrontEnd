export type UserRole = 'super_admin' | 'admin' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
}

export interface Client {
  _id: string
  name: string
  phone: string
  email?: string
  document?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export const PRODUCT_CATEGORIES = [
  'informatica',
  'perifericos',
  'acessorios',
  'escritorio',
  'redes',
  'energia',
  'outros',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export interface Product {
  _id: string
  name: string
  sku: string
  price: number
  stock: number
  category: ProductCategory
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}
