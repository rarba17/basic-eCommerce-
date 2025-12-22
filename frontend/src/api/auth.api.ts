import { api } from './axios';
import type { AuthResponse, User } from '@/types';
import { z } from 'zod';

// We can define Zod schemas here or in a separate file, but for API call inputs, 
// usually we rely on the types or Zod inferred types if we use React Hook Form.

// Schemas for forms (reused type)
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(12, "Password must be at least 12 characters"),
    full_name: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const authApi = {
    login: async (data: LoginInput): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterInput): Promise<User> => { // Register returns UserResponse (User)
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.post<User>('/auth/me'); // Backend uses POST /auth/me
        return response.data;
    }
};
