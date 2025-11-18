import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me')
};

export const categoryAPI = {
  getCategories: () => api.get('/categories')
};

export const serviceAPI = {
  getServices: (params) => api.get('/services', { params }),
  getService: (serviceId) => api.get(`/services/${serviceId}`)
};

export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  deliverOrder: (orderId, deliveryData) => api.put(`/orders/${orderId}/deliver`, deliveryData),
  acceptOrder: (orderId) => api.put(`/orders/${orderId}/accept`),
  requestRevision: (orderId, revisionData) => api.put(`/orders/${orderId}/revision`, revisionData)
};

export const messageAPI = {
  getMessages: (orderId) => api.get(`/messages/${orderId}`),
  sendMessage: (messageData) => api.post('/messages', messageData)
};

export const reviewAPI = {
  getReviews: (serviceId) => api.get(`/reviews/${serviceId}`)
};

export const userAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  getUserServices: (userId) => api.get(`/users/${userId}/services`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData)
};

export default api;
