import type { Recipe, RecipeSummary } from './Recipe';

export interface SsrInitialData {
    landingRecipes?: RecipeSummary[];
    recipe?: Recipe;
}

declare global {
    interface Window {
        __INITIAL_DATA__?: SsrInitialData;
    }
}

export {};