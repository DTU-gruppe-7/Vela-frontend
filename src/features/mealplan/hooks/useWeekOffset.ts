import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

export function useWeekOffset(totalDays: number, visibleColumns: number, is1Day: boolean = false) {
  const [internalWeekOffset, setInternalWeekOffset] = useState(0);
  const maxOffset = Math.max(0, totalDays - visibleColumns);
  const weekOffset = Math.min(internalWeekOffset, maxOffset);

  const setWeekOffset: Dispatch<SetStateAction<number>> = useCallback((nextOffset) => {
    setInternalWeekOffset((previousOffset) => {
      const safePreviousOffset = Math.min(previousOffset, maxOffset);
      const resolvedOffset = typeof nextOffset === 'function'
        ? (nextOffset as (value: number) => number)(safePreviousOffset)
        : nextOffset;

      return Math.max(0, Math.min(resolvedOffset, maxOffset));
    });
  }, [maxOffset]);

  // For 1-day view, center the single day; otherwise, calculate standard carousel offset
  let translateX: number;
  if (is1Day) {
    // Center single day: shift by (visibleColumns - 1) / 2 positions
    const centerOffset = (visibleColumns - 1) / 2;
    translateX = (centerOffset / totalDays) * 100;
  } else {
    translateX = (weekOffset / totalDays) * 100;
  }

  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset < maxOffset;

  return { weekOffset, setWeekOffset, canGoBack, canGoForward, translateX };
}
