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
    rememberMe: boolean;

    hydrate: () => Promise<void>;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const REMEMBER_ME_KEY = 'vela_remember_me';

let currentTimer: ReturnType<typeof setTimeout> | null = null;

function getTokenExpiry(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.exp * 1000;
    } catch {
        return null;
    }
}

function startAutoRefresh() {
    const { token } = useAuthStore.getState();
    if (!token) return;

    stopAutoRefresh();

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const refreshIn = Math.max(0, expiry - Date.now() - 5 * 60 * 1000);
    currentTimer = setTimeout(performAutoRefresh, refreshIn);
}

function stopAutoRefresh() {
    if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
    }
}

async function performAutoRefresh() {
    const { token, rememberMe } = useAuthStore.getState();
    if (!token) return;

    try {
        const response = await authApi.refresh(token);
        updateToken(response.accessToken);
        useAuthStore.setState({ token: response.accessToken });

        if (rememberMe) startAutoRefresh();
    } catch {
        stopAutoRefresh();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isHydrating: true,
    rememberMe: typeof window !== 'undefined' && localStorage.getItem(REMEMBER_ME_KEY) === 'true',

    hydrate: async () => {
        try {
            const res = await authApi.validateSession();
            updateToken(res.accessToken);
            set({
                user: res.user,
                token: res.accessToken,
                isAuthenticated: true,
                isHydrating: false,
            });

            if (get().rememberMe) {
                startAutoRefresh();
            }
        } catch {
            updateToken(null);
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isHydrating: false,
            });
            stopAutoRefresh();
        }
    },

    login: async (data) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login(data);
            updateToken(res.accessToken);

            const rememberMe = data.rememberMe ?? false;
            if (rememberMe) {
                localStorage.setItem(REMEMBER_ME_KEY, 'true');
            }

            set({
                user: res.user,
                token: res.accessToken,
                isAuthenticated: true,
                rememberMe,
            });

            if (rememberMe) {
                startAutoRefresh();
            }
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (data) => {
        set({ isLoading: true });
        try {
            const res = await authApi.register(data);
            updateToken(res.accessToken);
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
            localStorage.removeItem(REMEMBER_ME_KEY);
            updateToken(null);
            stopAutoRefresh();
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                rememberMe: false,
            });
        }
    },
}));
