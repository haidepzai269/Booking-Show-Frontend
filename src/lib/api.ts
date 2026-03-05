import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  withCredentials: true, // Gửi cookie httpOnly (refresh_token) theo mỗi request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor thêm Access Token vào header
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Refresh Token Logic ---
let isRefreshing = false;
// Hàng đợi các request bị lỗi 401 đang chờ token mới
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor xử lý lỗi Unauthorized — tự động refresh token
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và request này chưa được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu chính request /auth/refresh bị 401 -> logout luôn, tránh vòng lặp vô tận
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang có một request refresh rồi → xếp vào hàng đợi
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh — cookie refresh_token được gửi tự động nhờ withCredentials
        // Dùng axios thuần (không qua apiClient) để tránh interceptor đệ quy
        // axios.post trả về AxiosResponse nên phải lấy .data để lấy body thực sự
        const axiosRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const res = axiosRes.data as { success: boolean; data?: { access_token: string } };

        if (res.success && res.data?.access_token) {
          const newToken = res.data.access_token;
          // Cập nhật token vào store (sẽ persist vào localStorage)
          useAuthStore.getState().setAuth(newToken, useAuthStore.getState().user!);
          // Cập nhật header cho request gốc và thông báo cho hàng đợi
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Refresh failed'), null);
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
