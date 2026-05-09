import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotificationStore } from '../notificationStore';
import type { Notification } from '../../types/Notification';

vi.mock('../../api/notificationApi', () => ({
    notificationApi: {
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
    },
}));

vi.mock('../../api/groupApi', () => ({
    groupApi: {
        acceptInvite: vi.fn(),
        declineInvite: vi.fn(),
    },
}));

vi.mock('../authStore', () => ({
    useAuthStore: {
        getState: vi.fn(() => ({ token: 'mock-token' })),
    },
}));

import { notificationApi } from '../../api/notificationApi';
import { groupApi } from '../../api/groupApi';

const mockNotifications: Notification[] = [
    { id: '1', title: 'Ny opskrift', message: 'Du har et nyt match!', type: 'NewMatch', isRead: false, createdAt: '2026-05-07T10:00:00Z' },
    { id: '2', title: 'Gruppe-invitation', message: 'Du er inviteret', type: 'GroupInvite', isRead: false, createdAt: '2026-05-07T09:00:00Z' },
    { id: '3', title: 'Gammel besked', message: 'Allerede læst', type: 'NewMatch', isRead: true, createdAt: '2026-05-06T10:00:00Z' },
];

describe('notificationStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useNotificationStore.setState({
            notifications: [],
            unreadCount: 0,
            connection: null,
            isConnecting: false,
            isLoading: false,
            error: null,
            dropdownVisible: false,
            latestNotification: null,
        });
    });

    describe('fetchNotifications', () => {
        it('fetches and sorts notifications (unread first, newest first)', async () => {
            vi.mocked(notificationApi.getNotifications).mockResolvedValue(mockNotifications);

            await useNotificationStore.getState().fetchNotifications();

            const state = useNotificationStore.getState();
            expect(state.notifications).toHaveLength(3);
            // Unread should come first
            expect(state.notifications[0].isRead).toBe(false);
            expect(state.notifications[1].isRead).toBe(false);
            // Read last
            expect(state.notifications[2].isRead).toBe(true);
            expect(state.unreadCount).toBe(2);
            expect(state.isLoading).toBe(false);
        });

        it('sets error on fetch failure', async () => {
            vi.mocked(notificationApi.getNotifications).mockRejectedValue(new Error('Network error'));

            await useNotificationStore.getState().fetchNotifications();

            expect(useNotificationStore.getState().error).toBe('Kunne ikke hente notifikationer');
        });
    });

    describe('markAsRead', () => {
        it('marks a notification as read and updates unreadCount', async () => {
            vi.mocked(notificationApi.markAsRead).mockResolvedValue(undefined);
            useNotificationStore.setState({
                notifications: mockNotifications,
                unreadCount: 2,
            });

            await useNotificationStore.getState().markAsRead('1');

            const state = useNotificationStore.getState();
            const notification = state.notifications.find(n => n.id === '1');
            expect(notification?.isRead).toBe(true);
            expect(state.unreadCount).toBe(1);
            expect(notificationApi.markAsRead).toHaveBeenCalledWith('1');
        });
    });

    describe('markAllAsRead', () => {
        it('marks all non-GroupInvite notifications as read', async () => {
            vi.mocked(notificationApi.markAsRead).mockResolvedValue(undefined);
            useNotificationStore.setState({
                notifications: [...mockNotifications],
                unreadCount: 2,
            });

            await useNotificationStore.getState().markAllAsRead();

            const state = useNotificationStore.getState();
            // NewMatch (id=1) should be read now
            expect(state.notifications.find(n => n.id === '1')?.isRead).toBe(true);
            // GroupInvite (id=2) should still be unread
            expect(state.notifications.find(n => n.id === '2')?.isRead).toBe(false);
            // API should only be called for the non-group notification
            expect(notificationApi.markAsRead).toHaveBeenCalledTimes(1);
            expect(notificationApi.markAsRead).toHaveBeenCalledWith('1');
        });
    });

    describe('acceptGroupInvite', () => {
        it('calls acceptInvite API and marks notification as read', async () => {
            vi.mocked(groupApi.acceptInvite).mockResolvedValue(undefined);
            vi.mocked(notificationApi.markAsRead).mockResolvedValue(undefined);
            useNotificationStore.setState({
                notifications: [...mockNotifications],
                unreadCount: 2,
            });

            await useNotificationStore.getState().acceptGroupInvite('2', 'group-abc');

            expect(groupApi.acceptInvite).toHaveBeenCalledWith('group-abc');
            expect(notificationApi.markAsRead).toHaveBeenCalledWith('2');
        });
    });

    describe('declineGroupInvite', () => {
        it('calls declineInvite API and marks notification as read', async () => {
            vi.mocked(groupApi.declineInvite).mockResolvedValue(undefined);
            vi.mocked(notificationApi.markAsRead).mockResolvedValue(undefined);
            useNotificationStore.setState({
                notifications: [...mockNotifications],
                unreadCount: 2,
            });

            await useNotificationStore.getState().declineGroupInvite('2', 'group-abc');

            expect(groupApi.declineInvite).toHaveBeenCalledWith('group-abc');
            expect(notificationApi.markAsRead).toHaveBeenCalledWith('2');
        });
    });

    describe('dropdown state', () => {
        it('showDropdown sets visible and latestNotification', () => {
            const notif = mockNotifications[0];
            useNotificationStore.getState().showDropdown(notif);

            const state = useNotificationStore.getState();
            expect(state.dropdownVisible).toBe(true);
            expect(state.latestNotification).toEqual(notif);
        });

        it('hideDropdown clears state', () => {
            useNotificationStore.setState({ dropdownVisible: true, latestNotification: mockNotifications[0] });
            useNotificationStore.getState().hideDropdown();

            const state = useNotificationStore.getState();
            expect(state.dropdownVisible).toBe(false);
            expect(state.latestNotification).toBeNull();
        });
    });
});
