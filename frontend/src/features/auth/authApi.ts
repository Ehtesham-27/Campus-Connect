import { apiClient } from '../../lib/api/client';
import type { User, ApiResponse } from '../../types';

export interface RegisterPayload {
  fullName: string;
  collegeEmail?: string;
  email?: string;
  password: string;
  confirmPassword?: string;
  college: string;
  course: string;
  branch?: string;
  yearOrSemester?: string;
  academicYear?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AuthSessionResponse {
  user: User;
  token?: string;
}

export const authApi = {
  async register(data: RegisterPayload): Promise<AuthSessionResponse> {
    const res = await apiClient.post<ApiResponse<AuthSessionResponse>>('/auth/register', data);
    return res.data.data!;
  },

  async login(credentials: LoginPayload): Promise<AuthSessionResponse> {
    const res = await apiClient.post<ApiResponse<AuthSessionResponse>>('/auth/login', credentials);
    return res.data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const res = await apiClient.post<ApiResponse<{ message: string; resetToken?: string }>>('/auth/forgot-password', {
      email,
    });
    return res.data.data!;
  },

  async resetPassword(data: ResetPasswordPayload): Promise<AuthSessionResponse> {
    const res = await apiClient.post<ApiResponse<AuthSessionResponse>>('/auth/reset-password', data);
    return res.data.data!;
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data!;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const res = await apiClient.patch<ApiResponse<User>>('/users/me', profileData);
    return res.data.data!;
  },

  async uploadAvatar(file: File): Promise<{ profileImage: string; user: User }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post<ApiResponse<{ profileImage: string; user: User }>>(
      '/upload/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data!;
  },
};
