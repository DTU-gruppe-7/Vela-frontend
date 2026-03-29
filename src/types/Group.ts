import type {Match} from "./Match.ts";

export type GroupRole = 'owner' | 'administrator' | 'member';

export interface GroupMember {
    userId: string;
    groupId: string;
    role: GroupRole;
    joinedAt: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface Group {
    id: string;
    name: string;
    status: string;
    members: GroupMember[];
    matches: Match[];
    ownerId?: string;
    currentUserRole?: GroupRole;
}

export interface CreateGroupRequest {
    name: string;
    description?: string;
}

export interface SendInviteRequest {
    userId: string;
}

export  interface GroupInvite {
    id: string;
    groupId: string;
    userId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}