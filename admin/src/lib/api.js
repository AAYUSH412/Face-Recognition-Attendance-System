import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
};

// Users endpoints
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  bulkDelete: (userIds) => api.delete('/users/bulk', { data: { userIds } }),
  bulkStatus: (userIds, isActive) => api.patch('/users/bulk-status', { userIds, isActive }),
  getStats: () => api.get('/users/stats'),
  export: (params) => api.get('/users/export', { params }),
};

// Attendance endpoints
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  verify: (id, action) => api.patch(`/attendance/${id}/verify`, action),
  reject: (id, action) => api.patch(`/attendance/${id}/reject`, action),
  delete: (id) => api.delete(`/attendance/${id}`),
  bulkVerify: (recordIds, action) => api.patch('/attendance/bulk-verify', { recordIds, action }),
  getStats: (params) => api.get('/attendance/admin/stats', { params }),
  export: (params) => api.get('/attendance/export', { params, responseType: 'blob' }),
};

// Events endpoints
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  getAttendees: (id, params) => api.get(`/events/${id}/attendees`, { params }),
  generateQR: (id) => api.post(`/events/${id}/qr`),
  regenerateQR: (id) => api.post(`/events/${id}/regenerate-qr`),
};

// Departments endpoints
export const departmentsAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (deptData) => api.post('/departments', deptData),
  update: (id, deptData) => api.put(`/departments/${id}`, deptData),
  delete: (id) => api.delete(`/departments/${id}`),
};

export default api;
