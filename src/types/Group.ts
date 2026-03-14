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
    matches: any[]
}