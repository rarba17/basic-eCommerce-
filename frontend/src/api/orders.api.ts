import { api } from './axios';
import type { Order, OrderCreate } from '@/types';

export const ordersApi = {
    create: async (data: OrderCreate) => {
        const response = await api.post<Order>('/orders/', data);  // Added trailing slash
        return response.data;
    },

    getAll: async () => {
        // We patched backend to allow GET /orders/ for list
        const response = await api.get<Order[]>('/orders/');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Order>(`/orders/${id}`);
        return response.data;
    }
};
