export interface ProfileUserLike {
  name: string;
  email: string;
  role: string;
  active?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export const profileService = {
  findProfileByEmail(_email: string, fallback: ProfileUserLike) {
    return {
      ...fallback,
      active: fallback.active ?? true,
      createdAt: fallback.createdAt ?? new Date().toISOString(),
    };
  },

  async updateProfileByEmail(
    _email: string,
    payload: {
      name: string;
      email: string;
    }
  ) {
    return {
      ...payload,
    };
  },
};
