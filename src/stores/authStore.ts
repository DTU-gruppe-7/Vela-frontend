import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { persistSession, clearSession, loadSession, userFromResponse } from '../utils/authStorage';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/Auth';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login:    (data: LoginRequest)    => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout:   ()                      => Promise<void>;
    hydrate:  ()                      => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (data) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login(data);
            persistSession(res);
            set({
                user: userFromResponse(res),
                token: res.token,
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
            persistSession(res);
            set({
                user: userFromResponse(res),
                token: res.token,
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
            // Server-fejl stopper ikke logout lokalt
        } finally {
            clearSession();
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    hydrate: () => {
        const session = loadSession();
        if (session) {
            set({
                user: session.user,
                token: session.token,
                isAuthenticated: true,
            });
        }
    },
}));