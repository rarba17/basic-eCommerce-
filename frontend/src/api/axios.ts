import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401: Clear token and redirect to login if needed
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Ideally redirect to login, but we can handle it in the UI or store
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
