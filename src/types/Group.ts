import type {Match} from "./Match.ts";

export interface GroupMember {
    userId: string;
    groupId: string;
    role: 'admin' | 'member';
}

export interface Group {
    id: string;
    name: string;
    status: string;
    members: GroupMember[];
    matches: Match[];
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