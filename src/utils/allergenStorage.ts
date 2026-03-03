import type { Allergen } from '../types/User';

const ALLERGEN_STORAGE_KEY = 'user_allergens';
const ALLERGEN_FILTER_STORAGE_KEY = 'allergen_filter_enabled';

export function getAllergensFromStorage(): Allergen[] {
  try {
    const stored = localStorage.getItem(ALLERGEN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Allergen[];
    }
  } catch (error) {
    console.error('Fejl ved indlæsning af allergener fra localStorage:', error);
  }
  return [];
}

export function saveAllergensToStorage(allergens: Allergen[]): void {
  try {
    localStorage.setItem(ALLERGEN_STORAGE_KEY, JSON.stringify(allergens));
  } catch (error) {
    console.error('Fejl ved gemning af allergener til localStorage:', error);
  }
}

export function clearAllergensFromStorage(): void {
  try {
    localStorage.removeItem(ALLERGEN_STORAGE_KEY);
  } catch (error) {
    console.error('Fejl ved sletning af allergener fra localStorage:', error);
  }
}

export function isAllergenFilterEnabled(): boolean {
  try {
    const stored = localStorage.getItem(ALLERGEN_FILTER_STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    console.error('Fejl ved indlæsning af allergen-filter-indstilling:', error);
  }
  return false;
}

export function setAllergenFilterEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ALLERGEN_FILTER_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Fejl ved gemning af allergen-filter-indstilling:', error);
  }
}
