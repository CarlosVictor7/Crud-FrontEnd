import { clientsService } from './clients-service';
import { productsService } from './products-service';
import { authService } from './auth-service';
import { usersService } from './users-service';
import { toCategory, toCategoryLabel } from '../lib/product-category';

const normalizeUser = (item: any) => ({
  id: item._id,
  ...item,
});

const normalizeClient = (item: any) => ({
  id: item._id,
  ...item,
});

const normalizeProduct = (item: any) => ({
  id: item._id,
  ...item,
  category: toCategoryLabel(item.category),
});

const errorMessageFrom = (error: any, fallback: string): string => {
  return error?.response?.data?.message || error?.message || fallback;
};

export const runtimeApi = {
  auth: {
    login: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data = await authService.login({ email, password });
        return { token: data.accessToken, user: data.user };
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Falha ao autenticar'));
      }
    },

    me: async () => {
      try {
        const user = await authService.me();
        return { user };
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Sessao expirada'));
      }
    },
  },

  users: {
    get: async () => {
      try {
        const data = await usersService.list();
        return data.map(normalizeUser);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao listar usuarios'));
      }
    },

    post: async (data: any) => {
      try {
        const created = await usersService.create({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          active: data.active ?? true,
        });
        return normalizeUser(created);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao criar usuario'));
      }
    },

    put: async (id: string, data: any) => {
      try {
        const updated = await usersService.update(id, {
          name: data.name,
          email: data.email,
          role: data.role,
        });
        return normalizeUser(updated);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao atualizar usuario'));
      }
    },

    patchStatus: async (id: string, status: boolean) => {
      try {
        const updated = await usersService.patchStatus(id, status);
        return normalizeUser(updated);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao alterar status do usuario'));
      }
    },

    patchPassword: async (id: string, password: string) => {
      try {
        await usersService.patchPassword(id, password);
        return { success: true };
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao atualizar senha do usuario'));
      }
    },

    delete: async (id: string) => {
      try {
        await usersService.remove(id);
        return { success: true };
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao excluir usuario'));
      }
    },
  },

  clients: {
    get: async () => {
      const [activeRecords, inactiveRecords] = await Promise.all([
        clientsService.list({ active: true }),
        clientsService.list({ active: false }),
      ]);

      const merged = [...activeRecords, ...inactiveRecords].reduce<Record<string, any>>((acc, item) => {
        acc[item._id] = item;
        return acc;
      }, {});

      return Object.values(merged)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(normalizeClient);
    },

    post: async (data: any) => {
      try {
        const created = await clientsService.create({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          document: data.document || undefined,
        });
        return normalizeClient(created);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao criar cliente'));
      }
    },

    put: async (id: string, data: any) => {
      try {
        const updated = await clientsService.update(id, {
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          document: data.document || undefined,
        });
        return normalizeClient(updated);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao atualizar cliente'));
      }
    },

    patchStatus: async (id: string, status: boolean) => {
      try {
        const updated = await clientsService.patchStatus(id, status);
        return normalizeClient(updated);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao alterar status do cliente'));
      }
    },

    delete: async (id: string) => {
      try {
        await clientsService.remove(id);
        return { success: true };
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao excluir cliente'));
      }
    },
  },

  products: {
    get: async () => {
      const records = await productsService.list();
      return records.map(normalizeProduct);
    },

    post: async (data: any) => {
      try {
        const created = await productsService.create({
          name: data.name,
          price: Number(data.price),
          stock: Number(data.stock),
          category: toCategory(data.category),
          description: data.description || undefined,
        });
        return normalizeProduct(created);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao criar produto'));
      }
    },

    put: async (id: string, data: any) => {
      try {
        const updated = await productsService.update(id, {
          name: data.name,
          price: Number(data.price),
          stock: Number(data.stock),
          category: toCategory(data.category),
          description: data.description || undefined,
        });
        return normalizeProduct(updated);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao atualizar produto'));
      }
    },

    patchStatus: async (id: string, status: boolean) => {
      try {
        const updated = await productsService.patchStatus(id, status);
        return normalizeProduct(updated);
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao alterar status do produto'));
      }
    },

    delete: async (id: string) => {
      try {
        await productsService.remove(id);
        return { success: true };
      } catch (error) {
        throw new Error(errorMessageFrom(error, 'Erro ao excluir produto'));
      }
    },
  },
};
