import axiosClient from "./axiosClient.ts";
import type { Notification } from "../types/Notification.ts";

export const notificationApi = {

    getNotifications: async (): Promise<Notification[]> => {
        const response = await axiosClient.get("/notifications");
        return response.data.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await axiosClient.put(`/notifications/${id}/read`);
    }
};