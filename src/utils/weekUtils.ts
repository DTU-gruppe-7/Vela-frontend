export const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'] as const;
export const WORK_DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'] as const;

export type ViewMode = '1day' | 'work' | '1week' | '2weeks';

export interface PeriodInfo {
  weekNumber: number;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  days: typeof DAYS | typeof WORK_DAYS;
}

/**
 * Formaterer en dato til API-format (YYYY-MM-DD).
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Beregner ugenummer for en given dato.
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Formaterer et datointerval til visning.
 */
function formatDateRange(start: Date, end: Date): string {
  const fmt = (date: Date) =>
    date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

/**
 * Beregner periode-info baseret på view mode og offset.
 * @param viewMode - '1day', 'work', '1week', '2weeks'
 * @param offset - 0 = nuværende periode, +/- for navigation
 */
export function getPeriodInfo(viewMode: ViewMode, offset: number): PeriodInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date;
  let days: typeof DAYS | typeof WORK_DAYS;

  switch (viewMode) {
    case '1day': {
      // Start from today, add offset days
      startDate = new Date(today);
      startDate.setDate(today.getDate() + offset);
      endDate = new Date(startDate);
      days = [DAYS[(startDate.getDay() + 6) % 7]] as unknown as typeof DAYS;
      break;
    }

    case 'work': {
      // Get current week's Monday
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      // Add offset weeks
      startDate = new Date(currentMonday);
      startDate.setDate(currentMonday.getDate() + offset * 7);

      // Friday of that week
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4);

      days = WORK_DAYS;
      break;
    }

    case '2weeks': {
      // Get current week's Monday
      const currentMonday2 = new Date(today);
      currentMonday2.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      // Add offset * 2 weeks
      startDate = new Date(currentMonday2);
      startDate.setDate(currentMonday2.getDate() + offset * 14);

      // Sunday after 2 weeks
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13);

      // For 2 weeks, repeat DAYS twice (14 days total)
      days = [...DAYS, ...DAYS] as unknown as typeof DAYS;
      break;
    }

    case '1week':
    default: {
      // Get current week's Monday
      const currentMonday3 = new Date(today);
      currentMonday3.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      // Add offset weeks
      startDate = new Date(currentMonday3);
      startDate.setDate(currentMonday3.getDate() + offset * 7);

      // Sunday of that week
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      days = DAYS;
      break;
    }
  }

  const weekNumber = getWeekNumber(startDate);
  const dateRange = formatDateRange(startDate, endDate);

  return { weekNumber, dateRange, startDate, endDate, days };
}

/**
 * @deprecated Brug getPeriodInfo i stedet
 * Beregner ugenummer og datointerval for en given ugeforskydning.
 * @param weekOffset - 0 = denne uge, -1 = forrige uge, +1 = næste uge osv.
 */
export function getWeekInfo(weekOffset: number): { weekNumber: number; dateRange: string; monday: Date; sunday: Date } {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekNumber = getWeekNumber(monday);
  const dateRange = formatDateRange(monday, sunday);

  return { weekNumber, dateRange, monday, sunday };
}
