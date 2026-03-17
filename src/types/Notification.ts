export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string; // F.eks. 'GroupInvite' eller 'NewMatch'
    relatedEntityId?: string | null;
    isRead: boolean;
    createdAt: string;
}