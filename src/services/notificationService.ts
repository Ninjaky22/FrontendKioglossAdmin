import httpClient from './httpClient';
import { getToken } from '../utils/tokenManagement';

const BASE_URL = 'http://localhost:8000/API/V1.0';

export interface NotificationDTO {
    id: number;
    type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    title: string;
    message: string;
    relatedEntityType: string | null;
    relatedEntityId: number | null;
    read: boolean;
    createdAt: string;
}

export interface NotificationPage {
    content: NotificationDTO[];
    totalElements: number;
    last: boolean;
    number: number;
}

const notificationService = {
    getNotifications: async (page = 0, pageSize = 20): Promise<NotificationPage> => {
        const res = await httpClient.get('/admin/notifications', {
            params: { page, page_size: pageSize },
        });
        return (res as any).data;
    },

    getUnreadCount: async (): Promise<number> => {
        const res = await httpClient.get('/admin/notifications/unread-count');
        return (res as any).data.count;
    },

    markRead: async (id: number): Promise<void> => {
        await httpClient.patch(`/admin/notifications/${id}/read`);
    },

    markAllRead: async (): Promise<void> => {
        await httpClient.patch('/admin/notifications/read-all');
    },

    deleteNotification: async (id: number): Promise<void> => {
        await httpClient.delete(`/admin/notifications/${id}`);
    },

    getStreamUrl: (): string => {
        const token = getToken();
        return `${BASE_URL}/admin/notifications/stream?token=${token ?? ''}`;
    },
};

export default notificationService;
