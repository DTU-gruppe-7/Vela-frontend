import { create } from 'zustand';
import * as signalR from '@microsoft/signalr';
import type { Notification } from '../types/Notification';
import { notificationApi } from '../api/notificationApi';
import { groupApi } from '../api/groupApi';
import { useAuthStore } from './authStore'; // For at hente JWT token

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    connection: signalR.HubConnection | null;
    isLoading: boolean;
    error: string | null;
    // Dropdown state
    dropdownVisible: boolean;
    latestNotification: Notification | null;

    // Actions
    fetchNotifications: () => Promise<void>;
    connectToSignalR: () => void;
    disconnectSignalR: () => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    acceptGroupInvite: (notificationId: string, groupId: string) => Promise<void>;
    declineGroupInvite: (notificationId: string, groupId: string) => Promise<void>;
    showDropdown: (notification: Notification) => void;
    hideDropdown: () => void;
}

// BEMÆRK: Ret denne URL, så den peger på din rigtige backend adresse
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    connection: null,
    isLoading: false,
    error: null,
    dropdownVisible: false,
    latestNotification: null,
    showDropdown: (notification: Notification) => {
        set({ dropdownVisible: true, latestNotification: notification });
    },
    hideDropdown: () => {
        set({ dropdownVisible: false, latestNotification: null });
    },

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await notificationApi.getNotifications();

            const unread = data.filter(n => !n.isRead);

            set({
                notifications: data,
                unreadCount: unread.length,
                isLoading: false
            });
        } catch (error) {
            set({ error: 'Kunne ikke hente notifikationer', isLoading: false });
            console.error(error);
        }
    },

    connectToSignalR: () => {
        // Hvis der allerede er en forbindelse, gør ingenting
        if (get().connection) return;

        // Hent token fra authStore for at autentificere mod SignalR Hubben
        const token = useAuthStore.getState().token;
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${BACKEND_URL}/hubs/notifications`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        set({ connection: newConnection });

        // Definer hvad der skal ske, når vi modtager begivenheden "ReceiveNotification"
        newConnection.on('ReceiveNotification', (notification: any) => {
            // SignalR sender ofte camelCase eller PascalCase afhængig af dine backend settings.
            // Sørg for at mappe felterne, så de passer til din NotificationDto.
            const newNotif: Notification = {
                id: notification.payload?.notificationId || crypto.randomUUID(),
                title: notification.title ?? '',
                message: notification.message ?? '',
                type: String(notification.type ?? ''),
                relatedEntityId: notification.payload?.relatedEntityId || null,
                isRead: false,
                createdAt: notification.timestamp || new Date().toISOString()
            };

            // Tilføj den nye notifikation i toppen af listen og opdater tælleren
            set((state) => {
                if (state.notifications.some(n => n.id === newNotif.id)) return state;
                return {
                    notifications: [newNotif, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                    dropdownVisible: true,
                    latestNotification: newNotif
                };
            });
        });

        // Start forbindelsen
        newConnection.start()
            .then(() => console.log('SignalR Connected to Notifications Hub'))
            .catch(err => {
                if (err instanceof Error && err.message.includes('stopped')) return;
                console.error('SignalR Connection Error: ', err);
            });
    },

    disconnectSignalR: () => {
        const { connection } = get();
        if (connection) {
            connection.stop();
            set({ connection: null });
        }
    },

    acceptGroupInvite: async (notificationId: string, groupId: string) => {
        await groupApi.acceptInvite(groupId);
        await get().markAsRead(notificationId);
    },

    declineGroupInvite: async (notificationId: string, groupId: string) => {
        await groupApi.declineInvite(groupId);
        await get().markAsRead(notificationId);
    },

    markAsRead: async (id: string) => {
        try {
            set((state) => {
                const updatedList = state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updatedList,
                    unreadCount: updatedList.filter(n => !n.isRead).length
                };
            });
            await notificationApi.markAsRead(id);
        } catch (error) {
            console.error('Kunne ikke markere notifikation som læst', error);
        }
    },

    markAllAsRead: async () => {
        try {
            set((state) => {
                const updatedList = state.notifications.map(n => ({ ...n, isRead: true }));
                return {
                    notifications: updatedList,
                    unreadCount: 0
                };
            });
            // Optionally call API for each notification
            const unread = get().notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => notificationApi.markAsRead(n.id)));
        } catch (error) {
            console.error('Kunne ikke markere alle som læst', error);
        }
    }
}));