export interface GroupMember {
    userId: string;
    groupId: string;
    role: 'admin' | 'member';
}

export interface Group {
    id: string;
    name: string;
<<<<<<< HEAD
    status: string;
    members: GroupMember[];
    matches: any[]
=======
    status?: 'active' | 'inactive';
    description?: string;
    members: GroupMember[];
>>>>>>> origin/feature/groups
}