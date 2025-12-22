import { create } from 'zustand';
import type { Cart } from '@/types';
import { cartApi } from '@/api/cart.api';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;

    fetchCart: () => Promise<void>;
    addItem: (productId: string, quantity: number) => Promise<void>;
    updateItem: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
    cart: null,
    isLoading: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.get();
            set({ cart, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to fetch cart',
                isLoading: false
            });
        }
    },

    addItem: async (productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.addItem(productId, quantity);
            set({ cart, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to add item',
                isLoading: false
            });
            throw error;
        }
    },

    updateItem: async (productId, quantity) => {
        set({ isLoading: true });
        try {
            const cart = await cartApi.updateItem(productId, quantity);
            set({ cart, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to update item',
                isLoading: false
            });
        }
    },

    removeItem: async (productId) => {
        set({ isLoading: true });
        try {
            const cart = await cartApi.removeItem(productId);
            set({ cart, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to remove item',
                isLoading: false
            });
        }
    },

    clearCart: async () => {
        set({ isLoading: true });
        try {
            await cartApi.clear();
            // After clear, we can set cart to empty or refetch
            // Backend clear returns message. We should set local cart items to empty.
            set((state) => ({
                cart: state.cart ? { ...state.cart, items: [], total_amount: 0 } : null,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to clear cart',
                isLoading: false
            });
        }
    }
}));
