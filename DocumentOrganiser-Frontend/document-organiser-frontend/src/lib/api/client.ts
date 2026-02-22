import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/lib/types';
import { useAuthStore } from '@/lib/store/authStore';

// In the browser, use the Next.js rewrite proxy (/api/backend → Internal ALB).
// On the server (SSR), call the Internal ALB directly.
const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api/backend'
    : process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh concurrency guard: queue concurrent 401s behind a single refresh.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Response interceptor — handle 401 + token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<null>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt token refresh in the browser
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post<
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update both localStorage and Zustand store to keep them in sync
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Notify all queued requests with the new token
        onTokenRefreshed(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Clear any queued subscribers so they don't hang
        refreshSubscribers = [];
        // Don't hard-redirect here — let React components handle auth state.
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
