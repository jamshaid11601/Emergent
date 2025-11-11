import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me')
};

// User APIs
export const userAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  getUserServices: (userId) => api.get(`/users/${userId}/services`)
};

// Category APIs
export const categoryAPI = {
  getCategories: () => api.get('/categories')
};

// Service APIs
export const serviceAPI = {
  getServices: (params) => api.get('/services', { params }),
  getService: (serviceId) => api.get(`/services/${serviceId}`),
  createService: (serviceData) => api.post('/services', serviceData)
};

// Order APIs
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  deliverOrder: (orderId, deliveryData) => api.put(`/orders/${orderId}/deliver`, deliveryData),
  acceptOrder: (orderId) => api.put(`/orders/${orderId}/accept`),
  requestRevision: (orderId, revisionData) => api.put(`/orders/${orderId}/revision`, revisionData)
};

// Message APIs
export const messageAPI = {
  getMessages: (orderId) => api.get(`/messages/${orderId}`),
  sendMessage: (messageData) => api.post('/messages', messageData)
};

// Review APIs
export const reviewAPI = {
  getReviews: (serviceId) => api.get(`/reviews/${serviceId}`),
  createReview: (reviewData) => api.post('/reviews', reviewData)
};

// Payment APIs
export const paymentAPI = {
  createIntent: (paymentData) => api.post('/payments/create-intent', paymentData),
  confirmPayment: (paymentData) => api.post('/payments/confirm', paymentData)
};

export default api;