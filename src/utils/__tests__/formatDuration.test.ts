import { describe, it, expect } from 'vitest';
import { formatDuration } from '../formatDuration';

describe('formatDuration', () => {
    it('parses hours and minutes', () => {
        expect(formatDuration('PT1H20M')).toBe('1 t 20 min');
    });

    it('parses only minutes', () => {
        expect(formatDuration('PT45M')).toBe('45 min');
    });

    it('parses only hours', () => {
        expect(formatDuration('PT2H')).toBe('2 t');
    });

    it('returns "0 min" for zero duration', () => {
        expect(formatDuration('PT0H0M')).toBe('0 min');
    });

    it('returns raw input for invalid format', () => {
        expect(formatDuration('invalid')).toBe('invalid');
        expect(formatDuration('')).toBe('');
        expect(formatDuration('2 timer')).toBe('2 timer');
    });

    it('ignores seconds but still parses hours/minutes', () => {
        expect(formatDuration('PT1H30M15S')).toBe('1 t 30 min');
    });

    it('is case-insensitive', () => {
        expect(formatDuration('pt1h20m')).toBe('1 t 20 min');
        expect(formatDuration('Pt2H')).toBe('2 t');
    });

    it('handles only seconds (no hours or minutes)', () => {
        expect(formatDuration('PT30S')).toBe('0 min');
    });
});
