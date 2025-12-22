import { api } from './axios';
import type { Product, ProductCreate } from '@/types';

export const productsApi = {
    getAll: async (params?: { skip?: number; limit?: number; category?: string; search?: string }) => {
        const response = await api.get<Product[]>('/products', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    create: async (data: ProductCreate) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    update: async (id: string, data: Partial<ProductCreate>) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    getCategories: async () => {
        // Fetch specific categories from the new seed endpoint
        const response = await api.get<{ categories: string[] }>('/seed/categories');
        return response.data.categories;
    }
};
