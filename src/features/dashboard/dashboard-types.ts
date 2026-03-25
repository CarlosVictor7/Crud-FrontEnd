import type { ClientRecord, ProductRecord } from '../../types/domain';
import type { UserRecord } from '../../services/users-service';

export interface DashboardRawData {
  users: UserRecord[];
  clients: ClientRecord[];
  products: ProductRecord[];
}

export interface DashboardKpi {
  title: string;
  value: string;
  colorClass: string;
}

export interface RoleDistributionItem {
  key: 'super_admin' | 'admin' | 'client';
  label: string;
  value: number;
  color: string;
}

export interface EntityStatusSummary {
  label: string;
  active: number;
  inactive: number;
}

export interface LastLoginItem {
  id: string;
  name: string;
  role: 'super_admin' | 'admin' | 'client';
  lastLoginAt: string | null;
}

export interface RecentRegistrationItem {
  id: string;
  name: string;
  role: 'super_admin' | 'admin' | 'client';
  createdAt: string;
}

export interface DashboardComputedData {
  kpis: DashboardKpi[];
  roleDistribution: RoleDistributionItem[];
  systemStatus: EntityStatusSummary[];
  lastLogins: LastLoginItem[];
  recentUsers: RecentRegistrationItem[];
}
