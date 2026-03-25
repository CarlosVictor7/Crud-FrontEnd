import { clientsService } from '../../services/clients-service';
import { productsService } from '../../services/products-service';
import { usersService } from '../../services/users-service';
import type { DashboardRawData } from './dashboard-types';

const mergeById = <T extends { _id: string }>(items: T[]): T[] => {
  const map: Record<string, T> = {};

  items.forEach((item) => {
    map[item._id] = item;
  });

  return Object.values(map);
};

export const dashboardService = {
  async fetchRawData(): Promise<DashboardRawData> {
    const [users, activeClients, inactiveClients, activeProducts, inactiveProducts] = await Promise.all([
      usersService.list(),
      clientsService.list({ active: true }),
      clientsService.list({ active: false }),
      productsService.list({ active: true }),
      productsService.list({ active: false }),
    ]);

    return {
      users,
      clients: mergeById([...activeClients, ...inactiveClients]),
      products: mergeById([...activeProducts, ...inactiveProducts]),
    };
  },
};
