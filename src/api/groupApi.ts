import axiosClient from './axiosClient';
import type { 
    Group, 
    GroupMember, 
    CreateGroupRequest, 
    AddMemberRequest, 
    SendInviteRequest, 
    GroupInvite
 } from '../types/Group';

 interface ApiResponse<T> {
  data: T;
  success: boolean;
  errorMessage: string | null;
}

export const groupApi = {
    getGroups: async (): Promise<Group[]> => {
        const response = await axiosClient.get<Group[]>(`/Group`);
        return response.data;
    },

  getGroup: async (id: string): Promise<Group> => {
    const response = await axiosClient.get<ApiResponse<Group>>(`/Group/${id}`);
    return response.data.data;
  },

  createGroup: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await axiosClient.post<Group>('/Group', data);
    return response.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosClient.delete(`/Group/${id}`);
  },

  addMember: async (id: string, data: AddMemberRequest): Promise<void> => {
    await axiosClient.post(`/Group/${id}/members`, data);
  },

  removeMember: async (id: string, userId: string): Promise<void> => {
    await axiosClient.delete(`/Group/${id}/members/${userId}`);
  },

  getMatches: async (id: string): Promise<any> => {
    const response = await axiosClient.get<ApiResponse<any>>(`/Group/${id}/matches`);
    return response.data.data;
  },

  /* --- INVITATIONS --- */

  
  sendInvite: async (id: string, email: string): Promise<void> => {
    // Din kollega forventer et objekt med userId (som kan være email/id)
    await axiosClient.post(`/Group/${id}/invites`, { email: email });
  },

  getInvitesByGroup: async (id: string): Promise<GroupInvite[]> => {
    const response = await axiosClient.get<GroupInvite[]>(`/Group/${id}/invites`);
    return response.data;
  },

  getMyInvites: async (): Promise<GroupInvite[]> => {
    const response = await axiosClient.get<GroupInvite[]>('/Group/invites');
    return response.data;
  },

  acceptInvite: async (inviteId: string): Promise<void> => {
    await axiosClient.patch(`/Group/invites/${inviteId}/accept`);
  },


  declineInvite: async (inviteId: string): Promise<void> => {
    await axiosClient.patch(`/Group/invites/${inviteId}/decline`);
  },
};