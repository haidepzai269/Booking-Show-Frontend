import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';

interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  themePreference: string;
  rank?: string;
  totalSpending?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  setAuth: (token: string, user: User) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  requestMagicLink: (email: string) => Promise<{success: boolean, message?: string, error?: string}>;
  verifyMagicLink: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPass: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      setAuth: (token, user) => set({ token, user, error: null }),
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<any, {success: boolean, data?: {access_token: string, user: any}, error?: string}>("/auth/login", {
            email,
            password
          });
          if (res.success && res.data) {
            const rawUser = res.data.user;
            const user: User = {
              id: rawUser.id,
              email: rawUser.email,
              fullName: rawUser.full_name,
              role: rawUser.role,
              themePreference: rawUser.theme_preference || 'dark',
              rank: rawUser.rank || 'BRONZE',
              totalSpending: rawUser.total_spending || 0,
            };
            set({ token: res.data.access_token, user, loading: false });
            return true;
          } else {
            set({ error: res.error || "Đăng nhập thất bại", loading: false });
            return false;
          }
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Sai email hoặc mật khẩu.", loading: false });
          return false;
        }
      },
      requestMagicLink: async (email) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<any, {success: boolean, message?: string, error?: string}>("/auth/magic-link", { email });
          set({ loading: false });
          return res;
        } catch (err: any) {
          const error = err.response?.data?.error || "Gửi yêu cầu thất bại.";
          set({ error, loading: false });
          return { success: false, error };
        }
      },
      verifyMagicLink: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<any, {success: boolean, data?: {access_token: string, user: any}, error?: string}>("/auth/magic-link/verify", { token });
          if (res.success && res.data) {
            const rawUser = res.data.user;
            const user: User = {
              id: rawUser.id,
              email: rawUser.email,
              fullName: rawUser.full_name,
              role: rawUser.role,
              themePreference: rawUser.theme_preference || 'dark',
              rank: rawUser.rank || 'BRONZE',
              totalSpending: rawUser.total_spending || 0,
            };
            set({ token: res.data.access_token, user, loading: false });
            return true;
          } else {
            set({ error: res.error || "Liên kết không hợp lệ hoặc đã hết hạn.", loading: false });
            return false;
          }
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Xác thực thất bại.", loading: false });
          return false;
        }
      },
      resetPassword: async (token, newPassword) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<any, {success: boolean, error?: string}>("/auth/reset-password", { token, new_password: newPassword });
          set({ loading: false });
          return res;
        } catch (err: any) {
          const error = err.response?.data?.error || "Đổi mật khẩu thất bại.";
          set({ error, loading: false });
          return { success: false, error };
        }
      },
      logout: () => set({ token: null, user: null }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
