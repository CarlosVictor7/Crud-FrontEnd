import type { ProductCategory } from '../types/domain';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  informatica: 'Informática',
  perifericos: 'Periféricos',
  acessorios: 'Acessórios',
  escritorio: 'Escritório',
  redes: 'Redes',
  energia: 'Energia',
  outros: 'Outros'
};

export const LABEL_TO_CATEGORY: Record<string, ProductCategory> = {
  Software: 'informatica',
  Hardware: 'perifericos',
  Servico: 'acessorios',
  'Serviço': 'acessorios',
  Plugin: 'outros',
  Informatica: 'informatica',
  'Informática': 'informatica',
  Perifericos: 'perifericos',
  'Periféricos': 'perifericos',
  Acessorios: 'acessorios',
  'Acessórios': 'acessorios',
  Escritorio: 'escritorio',
  'Escritório': 'escritorio',
  Redes: 'redes',
  Energia: 'energia',
  Outros: 'outros'
};

export const toCategory = (value: string): ProductCategory => {
  return LABEL_TO_CATEGORY[value] ?? 'outros';
};

export const toCategoryLabel = (category: ProductCategory): string => {
  return CATEGORY_LABELS[category] ?? 'Outros';
};
