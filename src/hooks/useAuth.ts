// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../types/Auth';

export function useAuth() {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);

    const storeLogin = useAuthStore((s) => s.login);
    const storeRegister = useAuthStore((s) => s.register);
    const storeLogout = useAuthStore((s) => s.logout);

    const login = useCallback(
        async (data: LoginRequest) => {
            await storeLogin(data);
        },
        [storeLogin]
    );

    const register = useCallback(
        async (data: RegisterRequest) => {
            await storeRegister(data);
        },
        [storeRegister]
    );

    const logout = useCallback(async () => {
        await storeLogout();
    }, [storeLogout]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
    } as const;
}