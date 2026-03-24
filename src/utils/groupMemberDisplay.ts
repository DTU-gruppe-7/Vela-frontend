import type { GroupMember } from '../types/Group';
import type { AuthUser } from '../types/Auth';

function normalize(value: string | undefined): string {
    return (value ?? '').trim();
}

export function getGroupMemberDisplayName(member: GroupMember): string {
    const fullName = `${normalize(member.firstName)} ${normalize(member.lastName)}`.trim();
    if (fullName) return fullName;

    const email = normalize(member.email);
    if (email) return email;

    return member.userId;
}

export function getCurrentUserDisplayName(user: AuthUser | null | undefined): string {
    const fullName = `${normalize(user?.firstName)} ${normalize(user?.lastName)}`.trim();
    if (fullName) return fullName;

    const email = normalize(user?.email);
    if (email) return email;

    return normalize(user?.userId) || normalize(user?.id) || 'Ukendt bruger';
}

export function getDisplayInitials(displayName: string): string {
    const tokens = displayName
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);

    if (tokens.length === 0) return 'U';
    if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();

    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
}
