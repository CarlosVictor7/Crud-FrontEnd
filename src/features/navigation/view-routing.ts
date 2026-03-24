export const viewPathMap = {
  dashboard: '/dashboard',
  users: '/users',
  clients: '/clients',
  products: '/products',
  profile: '/profile',
} as const;

export const pathViewMap = {
  '/dashboard': 'dashboard',
  '/users': 'users',
  '/clients': 'clients',
  '/products': 'products',
  '/profile': 'profile',
} as const;

export type AppView = keyof typeof viewPathMap;
