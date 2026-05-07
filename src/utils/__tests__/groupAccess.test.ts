import { describe, it, expect } from 'vitest';
import { canManageGroup, getCurrentUserGroupRole } from '../groupAccess';
import type { Group } from '../../types/Group';

describe('canManageGroup', () => {
    it('returns true for owner', () => {
        expect(canManageGroup('owner')).toBe(true);
    });

    it('returns true for admin', () => {
        expect(canManageGroup('admin')).toBe(true);
    });

    it('returns true for administrator', () => {
        expect(canManageGroup('administrator')).toBe(true);
    });

    it('returns false for member', () => {
        expect(canManageGroup('member')).toBe(false);
    });

    it('returns false for null', () => {
        expect(canManageGroup(null)).toBe(false);
    });
});

describe('getCurrentUserGroupRole', () => {
    const baseGroup: Group = {
        id: 'group-1',
        name: 'Test Group',
        ownerId: 'owner-123',
        currentUserRole: undefined,
        members: [
            { userId: 'member-456', role: 'Member', firstName: 'Test', lastName: 'User', email: 'test@test.dk' },
            { userId: 'admin-789', role: 'Admin', firstName: 'Admin', lastName: 'User', email: 'admin@test.dk' },
        ],
    } as Group;

    it('returns normalized role from currentUserRole when present', () => {
        const group = { ...baseGroup, currentUserRole: 'Owner' };
        expect(getCurrentUserGroupRole(group as Group, 'any-id')).toBe('owner');
    });

    it('returns owner when user ID matches group ownerId', () => {
        expect(getCurrentUserGroupRole(baseGroup, 'owner-123')).toBe('owner');
    });

    it('returns member role from members array', () => {
        expect(getCurrentUserGroupRole(baseGroup, 'member-456')).toBe('member');
    });

    it('returns admin role from members array', () => {
        expect(getCurrentUserGroupRole(baseGroup, 'admin-789')).toBe('admin');
    });

    it('returns null when no match found', () => {
        expect(getCurrentUserGroupRole(baseGroup, 'unknown-user')).toBeNull();
    });

    it('returns null when group is null', () => {
        expect(getCurrentUserGroupRole(null, 'any-id')).toBeNull();
    });

    it('matches IDs case-insensitively', () => {
        expect(getCurrentUserGroupRole(baseGroup, 'OWNER-123')).toBe('owner');
        expect(getCurrentUserGroupRole(baseGroup, 'MEMBER-456')).toBe('member');
    });

    it('supports multiple identifier arguments', () => {
        expect(getCurrentUserGroupRole(baseGroup, 'no-match', 'member-456')).toBe('member');
    });
});
