import axiosClient from './axiosClient';
import type { UserProfile } from '../types/User';

export const authApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await axiosClient.get<UserProfile>('/auth/profile');
    return response.data;
  },

  // Update user allergens
  updateAllergens: async (allergens: string[]): Promise<UserProfile> => {
    const response = await axiosClient.put<UserProfile>('/auth/profile/allergens', { allergens });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },
};
