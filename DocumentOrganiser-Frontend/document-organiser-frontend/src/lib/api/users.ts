import apiClient from './client';
import type {
  ApiResponse,
  UserResponse,
  UpdateProfileRequest,
  UpdateSettingsRequest,
} from '@/lib/types';

export const usersApi = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<UserResponse>>('/users/profile');
    return res.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const res = await apiClient.put<ApiResponse<UserResponse>>('/users/profile', data);
    return res.data.data;
  },

  /** Settings are embedded in UserResponse.settings — no separate GET.
   *  PUT /users/settings returns UserResponse. */
  updateSettings: async (data: UpdateSettingsRequest) => {
    const res = await apiClient.put<ApiResponse<UserResponse>>('/users/settings', data);
    return res.data.data;
  },

  deleteAccount: async () => {
    const res = await apiClient.delete<ApiResponse<null>>('/users/account');
    return res.data;
  },
};
