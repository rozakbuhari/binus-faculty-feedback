import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
    api.put('/auth/profile', data),
};

export const feedbackService = {
  create: (formData: FormData) =>
    api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: { status?: string; categoryId?: number; page?: number; limit?: number }) =>
    api.get('/reports', { params }),
  getMyFeedbacks: (params?: { page?: number; limit?: number }) =>
    api.get('/reports/my', { params }),
  getById: (id: string) => api.get(`/reports/${id}`),
  updateStatus: (id: string, data: { status: string; assignedUnitId?: string }) =>
    api.patch(`/reports/${id}/status`, data),
  addResponse: (id: string, message: string) =>
    api.post(`/reports/${id}/responses`, { message }),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: { categoryName: string; description: string }) =>
    api.post('/categories', data),
  update: (id: number, data: { categoryName?: string; description?: string; isActive?: boolean }) =>
    api.put(`/categories/${id}`, data),
};

export const notificationService = {
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const dashboardService = {
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/dashboard/stats', { params }),
  getUnitPerformance: () => api.get('/dashboard/unit-performance'),
};

export default api;
