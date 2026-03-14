import axiosClient from './axiosClient';
import type {AuthResponse, LoginRequest, RegisterRequest} from '../types/Auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Logout requires auth header
  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },

  // Refresh token endpoint
  refreshToken: async (token: string, refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/refresh-token', {
      token,
      refreshToken
    });
    return response.data;
  }
};