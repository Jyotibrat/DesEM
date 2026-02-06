import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
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

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update-profile', data),
    changePassword: (data) => api.put('/auth/change-password', data)
};

// Events API
export const eventsAPI = {
    getAll: (params) => api.get('/events', { params }),
    getMyEvents: () => api.get('/events/my-events'),
    getById: (id) => api.get(`/events/${id}`),
    getBySlug: (slug) => api.get(`/events/slug/${slug}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
    register: (id, data) => api.post(`/events/${id}/register`, data),
    getRegistrations: (id) => api.get(`/events/${id}/registrations`)
};

// Media API
export const mediaAPI = {
    upload: (formData) => api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/media', { params }),
    delete: (id) => api.delete(`/media/${id}`)
};

export default api;
