import type { Group } from '../types/Group';

export type GroupRole = 'owner' | 'admin' | 'administrator' | 'member';

function normalizeRole(role: string | undefined | null): GroupRole | null {
    if (!role) return null;

    const value = role.toLowerCase();

    if (value === 'owner') return 'owner';
    if (value === 'admin') return 'admin';
    if (value === 'administrator') return 'administrator';
    if (value === 'member') return 'member';

    return null;
}

export function canManageGroup(role: GroupRole | null): boolean {
    return role === 'owner' || role === 'admin' || role === 'administrator';
}

function idsMatch(left: string | undefined, right: string | undefined): boolean {
    if (!left || !right) return false;
    return left.toLowerCase() === right.toLowerCase();
}

export function getCurrentUserGroupRole(
    group: Group | null,
    userId: string | undefined,
    userEmail?: string | undefined
): GroupRole | null {
    if (!group) return null;

    const explicitRole = normalizeRole(group.currentUserRole);
    if (explicitRole) return explicitRole;

    if (idsMatch(group.ownerId, userId) || idsMatch(group.ownerId, userEmail)) {
        return 'owner';
    }

    const membership = group.members.find(
        (member) => idsMatch(member.userId, userId) || idsMatch(member.userId, userEmail)
    );

    return normalizeRole(membership?.role);
}
