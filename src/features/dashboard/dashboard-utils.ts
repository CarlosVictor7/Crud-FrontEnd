import type { DashboardComputedData, DashboardRawData, LastLoginItem, RecentRegistrationItem, RoleDistributionItem } from './dashboard-types';

const userRoleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  client: 'Client',
} as const;

const roleColors: Record<'super_admin' | 'admin' | 'client', string> = {
  super_admin: '#8b5cf6',
  admin: '#06b6d4',
  client: '#64748b',
};

export const formatDashboardDateTime = (value?: string | null): string => {
  if (!value) {
    return 'Nunca acessou';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Nunca acessou';
  }

  const datePart = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${datePart} às ${timePart}`;
};

export const formatDashboardDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getRoleDistribution = (raw: DashboardRawData): RoleDistributionItem[] => {
  const counters = {
    super_admin: 0,
    admin: 0,
    client: 0,
  };

  raw.users.forEach((user) => {
    counters[user.role] += 1;
  });

  return (Object.keys(counters) as Array<'super_admin' | 'admin' | 'client'>).map((role) => ({
    key: role,
    label: userRoleLabels[role],
    value: counters[role],
    color: roleColors[role],
  }));
};

const getLastLogins = (raw: DashboardRawData, limit = 6): LastLoginItem[] => {
  return raw.users
    .filter((user) => Boolean(user.lastLoginAt))
    .sort((a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime())
    .slice(0, limit)
    .map((user) => ({
      id: user._id,
      name: user.name,
      role: user.role,
      lastLoginAt: user.lastLoginAt ?? null,
    }));
};

const getRecentUsers = (raw: DashboardRawData, limit = 6): RecentRegistrationItem[] => {
  return raw.users
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((user) => ({
      id: user._id,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }));
};

export const buildDashboardComputedData = (raw: DashboardRawData): DashboardComputedData => {
  const usersTotal = raw.users.length;
  const usersActive = raw.users.filter((item) => item.active).length;

  const clientsActive = raw.clients.filter((item) => item.active).length;
  const clientsInactive = raw.clients.length - clientsActive;

  const productsActive = raw.products.filter((item) => item.active).length;
  const productsInactive = raw.products.length - productsActive;

  return {
    kpis: [
      {
        title: 'Usuários cadastrados',
        value: String(usersTotal),
        colorClass: 'text-cyan-500',
      },
      {
        title: 'Clientes ativos',
        value: String(clientsActive),
        colorClass: 'text-emerald-500',
      },
      {
        title: 'Produtos registrados',
        value: String(raw.products.length),
        colorClass: 'text-blue-500',
      },
      {
        title: 'Produtos ativos',
        value: String(productsActive),
        colorClass: 'text-indigo-500',
      },
    ],
    roleDistribution: getRoleDistribution(raw),
    systemStatus: [
      {
        label: 'Usuários',
        active: usersActive,
        inactive: usersTotal - usersActive,
      },
      {
        label: 'Clientes',
        active: clientsActive,
        inactive: clientsInactive,
      },
      {
        label: 'Produtos',
        active: productsActive,
        inactive: productsInactive,
      },
    ],
    lastLogins: getLastLogins(raw),
    recentUsers: getRecentUsers(raw),
  };
};
