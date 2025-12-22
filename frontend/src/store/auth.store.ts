import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi, type LoginInput, type RegisterInput } from '@/api/auth.api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (data: LoginInput) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login(data);
                    // Backend returns access_token in response.
                    // Note: Backend might rely on token in localStorage, but updated axios interceptor reads it.
                    // Here we save it to Zustand store which uses persist (localStorage).
                    const token = response.access_token;

                    // Now fetch user details
                    // Wait, login response usually contains user info?
                    // auth.api.ts: login returns AuthResponse { access_token, user }
                    // Yes it does.

                    set({
                        user: response.user,
                        token: token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    // Also set localStorage for axios interceptor (although persist middleware does it, 
                    // axios reads from localStorage('token') ?? 
                    // The persist middleware saves the WHOLE state to 'auth-storage'. 
                    // My axios interceptor reads 'token'. 
                    // I should explicitly sync token to 'token' key or change axios to read from persistent store.
                    // Simplest is to save 'token' separately or change axios to read from useAuthStore.getState().token

                    localStorage.setItem('token', token);

                } catch (error: any) {
                    set({
                        error: error.response?.data?.detail || 'Login failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.register(data);
                    // Register just creates user, doesn't return token usually? 
                    // auth.api.ts: register returns User. 
                    // User needs to login after register? Or auto-login?
                    // Usually auto-login or redirect to login.
                    // I'll assume redirect to login.
                    set({ isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.detail || 'Registration failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) return;

                set({ isLoading: true });
                try {
                    // We can just rely on stored user, but better to validate token 
                    // by calling getMe if backend supports it
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true, token, isLoading: false });
                } catch (error) {
                    // Token invalid
                    get().logout();
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
