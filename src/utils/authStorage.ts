import type { AuthResponse, AuthUser } from '../types/Auth';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// ─── Mapper ───────────────────────────────────────────────────────
export function userFromResponse(res: AuthResponse): AuthUser {
    const resolvedId = res.userId || res.id || '';

    return {
        id: res.id || resolvedId,
        userId: resolvedId,
        email: res.email,
        firstName: res.firstName,
        lastName: res.lastName,
        profilePictureUrl: res.profilePictureUrl,
        dateOfBirth: res.dateOfBirth,
    };
}

export function persistSession(res: AuthResponse): void {
    try {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userFromResponse(res)));
    } catch (error) {
        console.error('Error saving session to localStorage:', error);
    }
}

export function clearSession(): void {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error deleting session from localStorage:', error);
    }
}

export function loadSession(): { token: string; user: AuthUser } | null {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const raw = localStorage.getItem(USER_KEY);
        if (token && raw) {
            const persistedUser = JSON.parse(raw) as Partial<AuthUser>;
            const resolvedUserId = persistedUser.userId || persistedUser.id;

            if (!resolvedUserId || !persistedUser.email || !persistedUser.firstName || !persistedUser.lastName) {
                clearSession();
                return null;
            }

            const user: AuthUser = {
                userId: resolvedUserId,
                id: persistedUser.id || resolvedUserId,
                email: persistedUser.email,
                firstName: persistedUser.firstName,
                lastName: persistedUser.lastName,
                profilePictureUrl: persistedUser.profilePictureUrl,
                dateOfBirth: persistedUser.dateOfBirth,
            };

            return { token, user };
        }
    } catch (error) {
        console.error('Error loading session from localStorage:', error);
        clearSession();
    }
    return null;
}
