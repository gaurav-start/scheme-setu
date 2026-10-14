import { create } from 'zustand';
import { authApi } from '../api/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'csc_operator' | 'ngo_worker' | 'admin';
  phone?: string;
  avatar?: string;
  age?: number;
  gender?: string;
  category?: string;
  maritalStatus?: string;
  disabilityStatus?: string;
  annualIncome?: number;
  occupation?: string;
  employmentStatus?: string;
  state?: string;
  district?: string;
  block?: string;
  ruralUrban?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await authApi.getMe();
      if (res.success && res.user) {
        set({ user: res.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
