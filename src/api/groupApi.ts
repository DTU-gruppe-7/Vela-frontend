import axiosClient from './axiosClient';
import type { 
    Group,
    CreateGroupRequest,
    GroupInvite
 } from '../types/Group';
import type {Match} from "../types/Match.ts";

export const groupApi = {
    getGroups: async (): Promise<Group[]> => {
        const response = await axiosClient.get<Group[]>(`/Group`);
        return response.data;
    },

  getGroup: async (id: string): Promise<Group> => {
    const response = await axiosClient.get<Group>(`/Group/${id}`);
    return response.data;
  },

  createGroup: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await axiosClient.post<Group>('/Group', data);
    return response.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosClient.delete(`/Group/${id}`);
  },

  removeMember: async (id: string, userId: string): Promise<void> => {
    await axiosClient.delete(`/Group/${id}/members/${userId}`);
  },

  getMatches: async (id: string): Promise<Match[]> => {
    const response = await axiosClient.get<Match[]>(`/Group/${id}/matches`);
    return response.data;
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