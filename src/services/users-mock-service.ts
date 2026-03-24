import type { UserRole } from '../types/auth';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

let mockUsers: MockUser[] = [
  { id: '1', name: 'Lobo Master', email: 'super@lobocore.com', role: 'super_admin', active: true, createdAt: '2023-01-15T10:00:00Z' },
  { id: '2', name: 'System Admin', email: 'sys@lobocore.com', role: 'super_admin', active: true, createdAt: '2023-02-01T09:00:00Z' },
  { id: '3', name: 'Admin Silva', email: 'admin@lobocore.com', role: 'admin', active: true, createdAt: '2023-02-20T14:30:00Z' },
  { id: '4', name: 'Carlos Gestor', email: 'carlos@lobocore.com', role: 'admin', active: true, createdAt: '2023-03-10T09:15:00Z' },
  { id: '5', name: 'Ana Souza', email: 'ana.admin@lobocore.com', role: 'admin', active: false, createdAt: '2023-05-05T16:45:00Z' },
  { id: '6', name: 'Cliente Tech', email: 'client@lobocore.com', role: 'client', active: true, createdAt: '2023-06-12T11:20:00Z' },
  { id: '7', name: 'Joao Cliente', email: 'joao@cliente.com', role: 'client', active: true, createdAt: '2023-07-01T08:00:00Z' },
  { id: '8', name: 'Maria Empresa', email: 'maria@empresa.com', role: 'client', active: false, createdAt: '2023-08-15T13:10:00Z' },
  { id: '9', name: 'Pedro SaaS', email: 'pedro@saas.com', role: 'client', active: true, createdAt: '2023-09-20T15:50:00Z' },
  { id: '10', name: 'Lucas Dev', email: 'lucas@dev.com', role: 'client', active: true, createdAt: '2023-10-05T10:30:00Z' }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const usersMockService = {
  async list() {
    await delay(350);
    return [...mockUsers];
  },

  async create(payload: Omit<MockUser, 'id' | 'createdAt'>) {
    await delay(350);
    const newUser: MockUser = {
      ...payload,
      id: String(Date.now()),
      createdAt: new Date().toISOString()
    };

    mockUsers = [...mockUsers, newUser];
    return newUser;
  },

  async update(id: string, payload: Partial<Omit<MockUser, 'id' | 'createdAt'>>) {
    await delay(350);
    mockUsers = mockUsers.map((user) => (user.id === id ? { ...user, ...payload } : user));
    return mockUsers.find((user) => user.id === id)!;
  },

  async patchStatus(id: string, active: boolean) {
    await delay(250);
    mockUsers = mockUsers.map((user) => (user.id === id ? { ...user, active } : user));
    return mockUsers.find((user) => user.id === id)!;
  },

  async remove(id: string) {
    await delay(350);
    mockUsers = mockUsers.filter((user) => user.id !== id);
  },

  async updateByEmail(email: string, payload: Partial<Omit<MockUser, 'id' | 'createdAt'>>) {
    await delay(250);
    mockUsers = mockUsers.map((user) => (user.email === email ? { ...user, ...payload } : user));
    return mockUsers.find((user) => user.email === email) ?? null;
  },

  findByEmail(email: string) {
    return mockUsers.find((user) => user.email === email) ?? null;
  }
};
