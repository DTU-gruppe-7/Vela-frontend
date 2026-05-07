import { describe, it, expect } from 'vitest';
import { getGroupMemberDisplayName, getCurrentUserDisplayName, getDisplayInitials } from '../groupMemberDisplay';

describe('getGroupMemberDisplayName', () => {
    it('returns full name when first and last name exist', () => {
        const member = { userId: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.dk', role: 'member' };
        expect(getGroupMemberDisplayName(member)).toBe('John Doe');
    });

    it('returns email when name is empty', () => {
        const member = { userId: '1', firstName: '', lastName: '', email: 'john@test.dk', role: 'member' };
        expect(getGroupMemberDisplayName(member)).toBe('john@test.dk');
    });

    it('returns userId as last fallback', () => {
        const member = { userId: 'abc-123', firstName: '', lastName: '', email: '', role: 'member' };
        expect(getGroupMemberDisplayName(member)).toBe('abc-123');
    });

    it('trims whitespace from names', () => {
        const member = { userId: '1', firstName: '  John  ', lastName: '  Doe  ', email: '', role: 'member' };
        expect(getGroupMemberDisplayName(member)).toBe('John Doe');
    });

    it('returns only first name if last name is undefined', () => {
        const member = { userId: '1', firstName: 'Alice', lastName: undefined, email: '', role: 'member' } as any;
        expect(getGroupMemberDisplayName(member)).toBe('Alice');
    });
});

describe('getCurrentUserDisplayName', () => {
    it('returns full name for auth user', () => {
        const user = { userId: '1', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.dk' };
        expect(getCurrentUserDisplayName(user as any)).toBe('Jane Smith');
    });

    it('returns email when name is missing', () => {
        const user = { userId: '1', firstName: '', lastName: '', email: 'jane@test.dk' };
        expect(getCurrentUserDisplayName(user as any)).toBe('jane@test.dk');
    });

    it('returns "Ukendt bruger" when no data available', () => {
        expect(getCurrentUserDisplayName(null)).toBe('Ukendt bruger');
        expect(getCurrentUserDisplayName(undefined)).toBe('Ukendt bruger');
    });
});

describe('getDisplayInitials', () => {
    it('returns initials from two-word name', () => {
        expect(getDisplayInitials('John Doe')).toBe('JD');
    });

    it('returns first two chars for single-word name', () => {
        expect(getDisplayInitials('Alice')).toBe('AL');
    });

    it('returns "U" for empty string', () => {
        expect(getDisplayInitials('')).toBe('U');
    });

    it('returns uppercase initials', () => {
        expect(getDisplayInitials('john doe')).toBe('JD');
    });

    it('handles names with extra whitespace', () => {
        expect(getDisplayInitials('  John   Doe  ')).toBe('JD');
    });

    it('uses only first two words for names with more', () => {
        expect(getDisplayInitials('John Michael Doe')).toBe('JM');
    });
});
