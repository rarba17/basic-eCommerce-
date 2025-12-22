import { api } from './axios';
import type { Cart } from '@/types';

export const cartApi = {
    get: async () => {
        const response = await api.get<Cart>('/cart');
        return response.data;
    },

    addItem: async (productId: string, quantity: number) => {
        const response = await api.post<Cart>('/cart/items', { product_id: productId, quantity });
        return response.data;
    },

    updateItem: async (productId: string, quantity: number) => {
        const response = await api.put<Cart>(`/cart/items/${productId}`, { quantity });
        return response.data;
    },

    removeItem: async (productId: string) => {
        const response = await api.delete<Cart>(`/cart/items/${productId}`);
        return response.data;
    },

    clear: async () => {
        const response = await api.delete('/cart/clear');
        return response.data;
    },

    checkout: async () => {
        // This endpoint exists but just returns message and items. 
        // Real checkout flow might use POST /orders directly from frontend using cart data?
        // cart.py: router.post("/checkout") 
        const response = await api.post('/cart/checkout');
        return response.data;
    }
};
