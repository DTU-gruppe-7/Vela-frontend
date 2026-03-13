export interface GroupMember {
    userId: string;
    groupId: string;
    role: 'admin' | 'member';
}

export interface Group {
    id: string;
    name: string;
    status?: 'active' | 'inactive';
    description?: string;
    members: GroupMember[];
}