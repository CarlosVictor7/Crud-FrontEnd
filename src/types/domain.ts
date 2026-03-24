export type ProductCategory =
  | 'informatica'
  | 'perifericos'
  | 'acessorios'
  | 'escritorio'
  | 'redes'
  | 'energia'
  | 'outros';

export interface ClientRecord {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: ProductCategory;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
