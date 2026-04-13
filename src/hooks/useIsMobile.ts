import { useSyncExternalStore } from 'react';

export function useIsMobile(breakpoint: number): boolean {
  const subscribe = (onStoreChange: () => void): (() => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mediaQuery.addEventListener('change', onStoreChange);

    return () => {
      mediaQuery.removeEventListener('change', onStoreChange);
    };
  };

  const getSnapshot = (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
