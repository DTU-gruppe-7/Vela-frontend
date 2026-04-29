import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { updateToken } from '../api/axiosClient';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/Auth';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isHydrating: boolean;

    hydrate:  ()                      => Promise<void>;
    login:    (data: LoginRequest)    => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout:   ()                      => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isHydrating: true,

    hydrate: async () => {
        const storedToken = localStorage.getItem('accessToken');
        if (!storedToken) {
            set({ isHydrating: false });
            return;
        }
        try {
            const res = await authApi.refresh(storedToken);
            updateToken(res.accessToken);
            localStorage.setItem('accessToken', res.accessToken);
            set({ user: res.user, token: res.accessToken, isAuthenticated: true, isHydrating: false });
        } catch {
            localStorage.removeItem('accessToken');
            set({ isHydrating: false });
        }
    },

    login: async (data) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login(data);
            updateToken(res.accessToken);
            localStorage.setItem('accessToken', res.accessToken);
            set({
                user: res.user,
                token: res.accessToken,
                isAuthenticated: true,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (data) => {
        set({ isLoading: true });
        try {
            const res = await authApi.register(data);
            updateToken(res.accessToken);
            localStorage.setItem('accessToken', res.accessToken);
            set({
                user: res.user,
                token: res.accessToken,
                isAuthenticated: true,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch {
            // server error doesn't stop local logout
        } finally {
            updateToken(null);
            localStorage.removeItem('accessToken');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));
