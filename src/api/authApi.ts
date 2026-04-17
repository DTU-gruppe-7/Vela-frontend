import axiosClient from './axiosClient';
import type {AuthResponse, LoginRequest, RegisterRequest} from '../types/Auth';
import type { UpdateUserDietaryPreferencesRequestDto, UserDietaryPreferencesDto } from '../types/User';

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
  },

  getPreferences: async (): Promise<UserDietaryPreferencesDto> => {
    const response = await axiosClient.get<UserDietaryPreferencesDto>('/auth/preferences');
    return response.data;
  },

  updatePreferences: async (data: UpdateUserDietaryPreferencesRequestDto): Promise<UserDietaryPreferencesDto> => {
    const response = await axiosClient.patch<UserDietaryPreferencesDto>('/auth/preferences', data);
    return response.data;
  }
};