import type { Recipe, RecipeSummary } from '../src/types/Recipe';
import type { SsrInitialData } from '../src/types/ssr';
import { getRecipeId, isGuestOnlyRoute } from '../src/ssr/routes';

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:5203/api';

interface RequestContext {
    cookieHeader?: string;
    authorizationHeader?: string;
}

function buildHeaders(context: RequestContext): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (context.cookieHeader) {
        headers.Cookie = context.cookieHeader;
    }

    if (context.authorizationHeader) {
        headers.Authorization = context.authorizationHeader;
    }

    return headers;
}

async function fetchJson<T>(path: string, context: RequestContext): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: buildHeaders(context),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${path}`);
    }

    return response.json() as Promise<T>;
}

async function resolveAuthState(context: RequestContext): Promise<boolean> {
    try {
        const response = await fetch(`${apiBaseUrl}/auth/preferences`, {
            headers: buildHeaders(context),
            credentials: 'include',
        });

        return response.ok;
    } catch {
        return false;
    }
}

async function loadLandingRecipes(context: RequestContext): Promise<RecipeSummary[]> {
    try {
        return await fetchJson<RecipeSummary[]>('/recipe/most-liked?limit=10', context);
    } catch {
        return [];
    }
}

async function loadRecipe(pathname: string, context: RequestContext): Promise<Recipe | undefined> {
    const recipeId = getRecipeId(pathname);

    if (!recipeId) {
        return undefined;
    }

    try {
        return await fetchJson<Recipe>(`/recipe/${recipeId}`, context);
    } catch {
        return undefined;
    }
}

export async function resolveSsrInitialData(pathname: string, context: RequestContext): Promise<SsrInitialData> {
    const initialData: SsrInitialData = {};

    if (isGuestOnlyRoute(pathname) || pathname === '/landing') {
        initialData.landingRecipes = await loadLandingRecipes(context);
    }

    if (pathname.startsWith('/recipes/')) {
        initialData.recipe = await loadRecipe(pathname, context);
    }

    return initialData;
}

export async function shouldRedirectForAuth(pathname: string, context: RequestContext): Promise<boolean> {
    if (!isGuestOnlyRoute(pathname)) {
        return false;
    }

    return resolveAuthState(context);
}