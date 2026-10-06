import { create } from 'zustand';
import { AuthSession } from '@domain/models/Auth';
import { TokenStorage } from '@infrastructure/storage/TokenStorage';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  setSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  setSession: (session: AuthSession) => {
    set({ isAuthenticated: true, token: session.token });
  },
  logout: async () => {
    await TokenStorage.deleteToken();
    set({ isAuthenticated: false, token: null });
  },
  checkSession: async () => {
    const token = await TokenStorage.getToken();
    if (token) {
      set({ isAuthenticated: true, token });
    }
  }
}));
