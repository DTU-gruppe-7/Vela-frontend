import { useEffect, useState } from 'react';

export function useWeekOffset(totalDays: number, visibleColumns: number) {
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const maxOffset = Math.max(0, totalDays - visibleColumns);
    setWeekOffset((offset) => Math.min(offset, maxOffset));
  }, [totalDays, visibleColumns]);

  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset < totalDays - visibleColumns;
  const translateX = (Math.min(weekOffset, totalDays - visibleColumns) / totalDays) * 100;

  return { weekOffset, setWeekOffset, canGoBack, canGoForward, translateX };
}
