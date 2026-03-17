import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { ApiResponse, User } from '@/types/api';

// Moved User to @/types/api

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
          const res = await apiClient.post<ApiResponse<{access_token: string, user: any}>>("/auth/login", {
            email,
            password
          }) as unknown as ApiResponse<{access_token: string, user: any}>;
          
          if (res.success && res.data) {
            const rawUser = res.data.user;
            const user: User = {
              id: rawUser.id,
              email: rawUser.email,
              fullName: rawUser.full_name,
              role: rawUser.role,
              theme: rawUser.theme || 'dark',
              language: rawUser.language || 'vi',
              rank: rawUser.rank || 'BRONZE',
              totalSpending: rawUser.total_spending || 0,
            };
            set({ token: res.data.access_token, user, loading: false });
            return true;
          } else {
            set({ error: res.error || "Đăng nhập thất bại", loading: false });
            return false;
          }
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { error?: string } } };
          const error = axiosError.response?.data?.error || "Sai email hoặc mật khẩu.";
          set({ error, loading: false });
          return false;
        }
      },
      requestMagicLink: async (email) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<ApiResponse<void>>("/auth/magic-link", { email }) as unknown as ApiResponse<void>;
          set({ loading: false });
          return res;
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { error?: string } } };
          const error = axiosError.response?.data?.error || "Gửi yêu cầu thất bại.";
          set({ error, loading: false });
          return { success: false, error };
        }
      },
      verifyMagicLink: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<ApiResponse<{access_token: string, user: any}>>("/auth/magic-link/verify", { token }) as unknown as ApiResponse<{access_token: string, user: any}>;
          if (res.success && res.data) {
            const rawUser = res.data.user;
            const user: User = {
              id: rawUser.id,
              email: rawUser.email,
              fullName: rawUser.full_name,
              role: rawUser.role,
              theme: rawUser.theme || 'dark',
              language: rawUser.language || 'vi',
              rank: rawUser.rank || 'BRONZE',
              totalSpending: rawUser.total_spending || 0,
            };
            set({ token: res.data.access_token, user, loading: false });
            return true;
          } else {
            set({ error: res.error || "Liên kết không hợp lệ hoặc đã hết hạn.", loading: false });
            return false;
          }
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { error?: string } } };
          const error = axiosError.response?.data?.error || "Xác thực thất bại.";
          set({ error, loading: false });
          return false;
        }
      },
      resetPassword: async (token, newPassword) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<ApiResponse<void>>("/auth/reset-password", { token, new_password: newPassword }) as unknown as ApiResponse<void>;
          set({ loading: false });
          return res;
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { error?: string } } };
          const error = axiosError.response?.data?.error || "Đổi mật khẩu thất bại.";
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
