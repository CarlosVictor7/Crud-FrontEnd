import type { UserRole } from '../types/auth';

export type AppView = 'dashboard' | 'users' | 'clients' | 'products' | 'profile';

export const canAccessView = (role: UserRole, view: AppView): boolean => {
  if (view === 'profile' || view === 'products') {
    return true;
  }

  if (view === 'clients') {
    return role === 'super_admin' || role === 'admin';
  }

  if (view === 'dashboard' || view === 'users') {
    return role === 'super_admin';
  }

  return false;
};

export const getDefaultViewByRole = (role: UserRole): AppView => {
  if (role === 'super_admin') {
    return 'dashboard';
  }

  if (role === 'admin') {
    return 'clients';
  }

  return 'products';
};

export const canDeleteUsers = (role: UserRole): boolean => role === 'super_admin';
export const canDeleteClients = (role: UserRole): boolean => role === 'super_admin';
export const canDeleteProducts = (role: UserRole): boolean => role === 'super_admin';
