import apiClient from './client';
import type {
  ApiResponse,
  AuthResponse,
  GoogleAuthRequest,
  RefreshTokenRequest,
  UserResponse,
} from '@/lib/types';

export const authApi = {
  loginWithGoogle: async (data: GoogleAuthRequest) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/google', data);
    return res.data.data;
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', data);
    return res.data.data;
  },

  logout: async (refreshToken?: string) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
    return res.data;
  },

  logoutAll: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout-all');
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get<ApiResponse<UserResponse>>('/auth/me');
    return res.data.data;
  },
};
