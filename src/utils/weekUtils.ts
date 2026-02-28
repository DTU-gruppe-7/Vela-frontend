export const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'] as const;

export interface WeekInfo {
  weekNumber: number;
  dateRange: string;
  monday: Date;
  sunday: Date;
}

/**
 * Beregner ugenummer og datointerval for en given ugeforskydning.
 * @param weekOffset - 0 = denne uge, -1 = forrige uge, +1 = næste uge osv.
 */
export function getWeekInfo(weekOffset: number): WeekInfo {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const d = new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  const fmt = (date: Date) =>
    date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
  const dateRange = `${fmt(monday)} – ${fmt(sunday)}`;

  return { weekNumber, dateRange, monday, sunday };
}
