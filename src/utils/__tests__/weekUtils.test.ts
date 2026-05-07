import { describe, it, expect } from 'vitest';
import { formatDateForApi, getPeriodInfo } from '../weekUtils';

describe('formatDateForApi', () => {
    it('formats a normal date as YYYY-MM-DD', () => {
        const date = new Date(2026, 4, 7); // May 7, 2026
        expect(formatDateForApi(date)).toBe('2026-05-07');
    });

    it('zero-pads single-digit day and month', () => {
        const date = new Date(2026, 0, 5); // Jan 5, 2026
        expect(formatDateForApi(date)).toBe('2026-01-05');
    });

    it('handles last day of year', () => {
        const date = new Date(2026, 11, 31); // Dec 31, 2026
        expect(formatDateForApi(date)).toBe('2026-12-31');
    });
});

describe('getPeriodInfo', () => {
    describe('1week mode', () => {
        it('returns 7 days', () => {
            const result = getPeriodInfo('1week', 0);
            expect(result.days).toHaveLength(7);
        });

        it('starts on a Monday', () => {
            const result = getPeriodInfo('1week', 0);
            // getDay() returns 0=Sun, 1=Mon, ..., so Monday = 1
            expect(result.startDate.getDay()).toBe(1);
        });

        it('ends on a Sunday', () => {
            const result = getPeriodInfo('1week', 0);
            expect(result.endDate.getDay()).toBe(0);
        });

        it('offset +1 moves start one week forward', () => {
            const current = getPeriodInfo('1week', 0);
            const next = getPeriodInfo('1week', 1);
            const diffDays = (next.startDate.getTime() - current.startDate.getTime()) / 86400000;
            expect(diffDays).toBe(7);
        });

        it('offset -1 moves start one week backward', () => {
            const current = getPeriodInfo('1week', 0);
            const prev = getPeriodInfo('1week', -1);
            const diffDays = (current.startDate.getTime() - prev.startDate.getTime()) / 86400000;
            expect(diffDays).toBe(7);
        });
    });

    describe('work mode', () => {
        it('returns 5 days (Monday–Friday)', () => {
            const result = getPeriodInfo('work', 0);
            expect(result.days).toHaveLength(5);
        });

        it('starts on Monday, ends on Friday', () => {
            const result = getPeriodInfo('work', 0);
            expect(result.startDate.getDay()).toBe(1); // Monday
            expect(result.endDate.getDay()).toBe(5);   // Friday
        });
    });

    describe('1day mode', () => {
        it('returns exactly 1 day', () => {
            const result = getPeriodInfo('1day', 0);
            expect(result.days).toHaveLength(1);
        });

        it('start and end are the same date', () => {
            const result = getPeriodInfo('1day', 0);
            expect(formatDateForApi(result.startDate)).toBe(formatDateForApi(result.endDate));
        });

        it('offset +1 moves to tomorrow', () => {
            const today = getPeriodInfo('1day', 0);
            const tomorrow = getPeriodInfo('1day', 1);
            const diffDays = (tomorrow.startDate.getTime() - today.startDate.getTime()) / 86400000;
            expect(diffDays).toBe(1);
        });
    });

    describe('2weeks mode', () => {
        it('returns 14 days', () => {
            const result = getPeriodInfo('2weeks', 0);
            expect(result.days).toHaveLength(14);
        });

        it('spans exactly 13 days from start to end', () => {
            const result = getPeriodInfo('2weeks', 0);
            const diffDays = (result.endDate.getTime() - result.startDate.getTime()) / 86400000;
            expect(diffDays).toBe(13);
        });
    });

    describe('shared properties', () => {
        it('returns a valid weekNumber', () => {
            const result = getPeriodInfo('1week', 0);
            expect(result.weekNumber).toBeGreaterThanOrEqual(1);
            expect(result.weekNumber).toBeLessThanOrEqual(53);
        });

        it('returns a formatted dateRange string', () => {
            const result = getPeriodInfo('1week', 0);
            expect(result.dateRange).toContain('–');
        });
    });
});
