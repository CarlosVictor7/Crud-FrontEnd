import { usersMockService } from './users-mock-service';

export interface ProfileUserLike {
  name: string;
  email: string;
  role: string;
  active?: boolean;
  createdAt?: string;
}

export const profileService = {
  findProfileByEmail(email: string, fallback: ProfileUserLike) {
    return usersMockService.findByEmail(email) || {
      ...fallback,
      active: fallback.active ?? true,
      createdAt: fallback.createdAt ?? new Date().toISOString(),
    };
  },

  async updateProfileByEmail(
    email: string,
    payload: {
      name: string;
      email: string;
    }
  ) {
    return usersMockService.updateByEmail(email, payload);
  },
};
