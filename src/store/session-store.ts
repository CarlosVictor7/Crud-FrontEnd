import { create } from 'zustand';
import { authService } from '../services/auth-service';
import { tokenStorage } from '../lib/http';
import type { AuthUser } from '../types/auth';

interface SessionState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  bootstrap: () => Promise<void>;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  loading: true,

  async login(email, password) {
    const data = await authService.login({ email, password });
    set({ user: data.user });
    return data.user;
  },

  async bootstrap() {
    const token = tokenStorage.getAccessToken();

    if (!token) {
      set({ loading: false, user: null });
      return;
    }

    try {
      const user = await authService.me();
      set({ user, loading: false });
    } catch {
      authService.logout();
      set({ user: null, loading: false });
    }
  },

  logout() {
    authService.logout();
    set({ user: null });
  }
}));
