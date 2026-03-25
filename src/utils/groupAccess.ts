import type { Group } from '../types/Group';

export type GroupRole = 'owner' | 'admin' | 'administrator' | 'member';

function normalizeRole(role: string | undefined | null): GroupRole | null {
    if (!role) return null;

    const value = role.trim().toLowerCase();

    if (value === 'owner') return 'owner';
    if (value === 'admin') return 'admin';
    if (value === 'administrator') return 'administrator';
    if (value === 'member') return 'member';

    return null;
}

function hasAnyIdMatch(candidate: string | undefined, identifiers: Array<string | undefined>): boolean {
    return identifiers.some((identifier) => idsMatch(candidate, identifier));
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
    ...identifiers: Array<string | undefined>
): GroupRole | null {
    if (!group) return null;

    const explicitRole = normalizeRole(group.currentUserRole);
    if (explicitRole) return explicitRole;

    if (hasAnyIdMatch(group.ownerId, identifiers)) {
        return 'owner';
    }

    const membership = group.members.find((member) => hasAnyIdMatch(member.userId, identifiers));

    return normalizeRole(membership?.role);
}
