export type ClientSort = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';

export interface ClientTableRecord {
  id: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  active: boolean;
  createdAt: string;
}

export const filterAndSortClients = (
  clients: ClientTableRecord[],
  filters: {
    searchTerm: string;
    statusFilter: 'all' | 'active' | 'inactive';
    sortBy: ClientSort;
  }
): ClientTableRecord[] => {
  let result = [...clients];

  if (filters.searchTerm) {
    const low = filters.searchTerm.toLowerCase();
    result = result.filter(
      (client) => client.name.toLowerCase().includes(low) || (client.document || '').includes(filters.searchTerm)
    );
  }

  if (filters.statusFilter !== 'all') {
    result = result.filter((client) => client.active === (filters.statusFilter === 'active'));
  }

  result.sort((a, b) => {
    if (filters.sortBy === 'nameAsc') return a.name.localeCompare(b.name);
    if (filters.sortBy === 'nameDesc') return b.name.localeCompare(a.name);
    if (filters.sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
};

export const clientDeleteErrorFeedback = (message?: string): string => {
  const text = (message || '').toLowerCase();
  if (text.includes('inativ')) {
    return 'Para excluir definitivamente, primeiro inative o cliente e tente novamente.';
  }

  return message || 'Erro ao excluir';
};
