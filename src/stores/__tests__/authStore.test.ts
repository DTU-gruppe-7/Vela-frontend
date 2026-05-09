import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock dependencies
vi.mock('../../api/authApi', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        validateSession: vi.fn(),
        refresh: vi.fn(),
    },
}));

vi.mock('../../api/axiosClient', () => ({
    updateToken: vi.fn(),
    default: { defaults: { baseURL: '/api/v1' } },
}));

import { authApi } from '../../api/authApi';
import { updateToken } from '../../api/axiosClient';

const mockUser = {
    userId: 'user-1',
    email: 'test@vela.dk',
    firstName: 'Test',
    lastName: 'Bruger',
};

const mockLoginResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEiLCJleHAiOjk5OTk5OTk5OTl9.sig',
    user: mockUser,
};

describe('authStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store to initial state
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrating: true,
            rememberMe: false,
        });
        localStorage.clear();
    });

    describe('initial state', () => {
        it('starts unauthenticated', () => {
            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
        });
    });

    describe('login', () => {
        it('sets user and token on successful login', async () => {
            vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

            await useAuthStore.getState().login({
                email: 'test@vela.dk',
                password: 'password123',
            });

            const state = useAuthStore.getState();
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(mockLoginResponse.accessToken);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(updateToken).toHaveBeenCalledWith(mockLoginResponse.accessToken);
        });

        it('saves rememberMe to localStorage', async () => {
            vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

            await useAuthStore.getState().login({
                email: 'test@vela.dk',
                password: 'password123',
                rememberMe: true,
            });

            expect(localStorage.getItem('vela_remember_me')).toBe('true');
            expect(useAuthStore.getState().rememberMe).toBe(true);
        });

        it('sets isLoading false even on error', async () => {
            vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

            try {
                await useAuthStore.getState().login({
                    email: 'test@vela.dk',
                    password: 'wrong',
                });
            } catch {
                // expected
            }

            expect(useAuthStore.getState().isLoading).toBe(false);
        });
    });

    describe('register', () => {
        it('sets user and token on successful registration', async () => {
            vi.mocked(authApi.register).mockResolvedValue(mockLoginResponse);

            await useAuthStore.getState().register({
                email: 'new@vela.dk',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
            });

            const state = useAuthStore.getState();
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
        });
    });

    describe('logout', () => {
        it('clears all auth state', async () => {
            // Set up authenticated state first
            useAuthStore.setState({
                user: mockUser,
                token: 'some-token',
                isAuthenticated: true,
                rememberMe: true,
            });
            localStorage.setItem('vela_remember_me', 'true');

            vi.mocked(authApi.logout).mockResolvedValue(undefined);

            await useAuthStore.getState().logout();

            const state = useAuthStore.getState();
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.rememberMe).toBe(false);
            expect(localStorage.getItem('vela_remember_me')).toBeNull();
            expect(updateToken).toHaveBeenCalledWith(null);
        });

        it('clears state even if API logout fails', async () => {
            useAuthStore.setState({ user: mockUser, token: 'token', isAuthenticated: true });
            vi.mocked(authApi.logout).mockRejectedValue(new Error('Server error'));

            await useAuthStore.getState().logout();

            expect(useAuthStore.getState().isAuthenticated).toBe(false);
        });
    });

    describe('hydrate', () => {
        it('restores session on successful validation', async () => {
            vi.mocked(authApi.validateSession).mockResolvedValue(mockLoginResponse);

            await useAuthStore.getState().hydrate();

            const state = useAuthStore.getState();
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isHydrating).toBe(false);
        });

        it('clears state on validation failure', async () => {
            vi.mocked(authApi.validateSession).mockRejectedValue(new Error('Expired'));

            await useAuthStore.getState().hydrate();

            const state = useAuthStore.getState();
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isHydrating).toBe(false);
            expect(updateToken).toHaveBeenCalledWith(null);
        });
    });
});
