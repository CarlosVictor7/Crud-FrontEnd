import type { UserRole } from '../../types/auth';

export interface UsersTableRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export type UsersSort = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';

export const usersRoleNames: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  client: 'Client'
};

export const filterAndSortUsers = (
  users: UsersTableRecord[],
  filters: {
    searchTerm: string;
    roleFilter: UserRole | 'all';
    statusFilter: 'all' | 'active' | 'inactive';
    sortBy: UsersSort;
  }
): UsersTableRecord[] => {
  let result = [...users];

  if (filters.searchTerm) {
    const lowerTerm = filters.searchTerm.toLowerCase();
    result = result.filter((user) =>
      user.name.toLowerCase().includes(lowerTerm) || user.email.toLowerCase().includes(lowerTerm)
    );
  }

  if (filters.roleFilter !== 'all') {
    result = result.filter((user) => user.role === filters.roleFilter);
  }

  if (filters.statusFilter !== 'all') {
    result = result.filter((user) => user.active === (filters.statusFilter === 'active'));
  }

  result.sort((a, b) => {
    if (filters.sortBy === 'nameAsc') {
      return a.name.localeCompare(b.name);
    }

    if (filters.sortBy === 'nameDesc') {
      return b.name.localeCompare(a.name);
    }

    if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
};

export const formatUserDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};
