import { matchPath } from 'react-router-dom';

const SSR_ROUTE_PATTERNS = ['/landing', '/login', '/register', '/recipes/:id'] as const;

export function isSsrRoute(pathname: string): boolean {
    return SSR_ROUTE_PATTERNS.some((pattern) => matchPath({ path: pattern, end: true }, pathname) !== null);
}

export function isGuestOnlyRoute(pathname: string): boolean {
    return pathname === '/login' || pathname === '/register';
}

export function getRecipeId(pathname: string): string | null {
    const match = matchPath({ path: '/recipes/:id', end: true }, pathname);
    return match?.params.id ?? null;
}