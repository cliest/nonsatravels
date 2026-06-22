import axios from 'axios';
import { toast } from '../utils/toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds to handle slow database queries
  headers: {
    'Content-Type': 'application/json',
  },
  // Mobile-friendly settings
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
  // Retry configuration for mobile networks
  retry: 3,
  retryDelay: 1000,
});

// Function to get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  async (config) => {
    // Add JWT token if available
    const token = getToken();
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
  async (error) => {
    const config = error.config;
    
    // Check if it's a network error (no internet connection)
    if (!navigator.onLine) {
      toast.error('No internet connection. Please check your network and try again.');
      return Promise.reject(error);
    }

    // Handle authorization errors
    if (error.response?.status === 401) {
      const message = error.response.data?.message || 'Authentication failed';
      // Clear token if unauthorized
      localStorage.removeItem('token');
      toast.error(message);
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      return Promise.reject(error);
    }

    // Retry logic for network timeouts and mobile connectivity issues
    if (config && !config.__isRetryRequest && 
        (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || 
         error.message.includes('Network Error') || error.message.includes('timeout'))) {
      
      config.__isRetryRequest = true;
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount < (config.retry || 3)) {
        config.__retryCount += 1;
        
        // Exponential backoff for mobile networks
        const delay = Math.pow(2, config.__retryCount) * (config.retryDelay || 1000);
        
        toast.warning(`Connection issue. Retrying... (${config.__retryCount}/${config.retry || 3})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
    }

    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      toast.error(message);
    } else if (error.request) {
      // Request made but no response - could be network or server down
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again with a better connection.');
      } else {
        toast.error('Server is not responding. Please try again later.');
      }
    } else {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Hotel API
export const hotelAPI = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  getFeatured: () => api.get('/hotels/featured'),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
  toggleFeatured: (id) => api.patch(`/hotels/${id}/featured`),
  getAllHotels: (params) => api.get('/hotels', { params }), // Alias for compatibility
};

// Booking API
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  modify: (id, data) => api.put(`/bookings/${id}/modify`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
  deletePermanently: (id) => api.delete(`/bookings/${id}/permanent`),
  getStats: () => api.get('/bookings/stats'),
};

// Review API
export const reviewAPI = {
  getByHotel: (hotelId) => api.get(`/reviews/hotel/${hotelId}`),
  getAll: (params) => api.get('/reviews/admin/all', { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.patch(`/reviews/${id}/helpful`),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  reject: (id) => api.delete(`/reviews/${id}/reject`),
};

// Offer API
export const offerAPI = {
  getAll: () => api.get('/offers'),
  getById: (id) => api.get(`/offers/${id}`),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

// Testimonial API
export const testimonialAPI = {
  getAll: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/admin'),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
  toggleStatus: (id) => api.patch(`/testimonials/${id}/toggle`),
};

// Stats API
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post('/contact/send', data),
  subscribeNewsletter: (email) => api.post('/contact/newsletter', { email }),
  unsubscribe: (email) => api.post('/contact/newsletter/unsubscribe', { email }),
};

// Newsletter Admin API
export const newsletterAPI = {
  getSubscribers: (active) => api.get('/contact/newsletter/subscribers', { params: active !== undefined ? { active } : {} }),
  deleteSubscriber: (id) => api.delete(`/contact/newsletter/subscribers/${id}`),
  sendNewsletter: (data) => api.post('/contact/newsletter/send', data),
};

// Referral API
export const referralAPI = {
  getMyCode: () => api.get('/referrals/my-code'),
  getStats: () => api.get('/referrals/stats'),
  validate: (code) => api.get(`/referrals/validate/${code}`),
};

// Loyalty API
export const loyaltyAPI = {
  getMyPoints: () => api.get('/loyalty/my-points'),
  getHistory: (limit) => api.get('/loyalty/history', { params: { limit } }),
  redeemPoints: (points) => api.post('/loyalty/redeem', { points }),
};

// Availability API
export const availabilityAPI = {
  check: (hotelId, checkIn, checkOut, roomsNeeded) =>
    api.get(`/availability/check/${hotelId}`, {
      params: { checkIn, checkOut, roomsNeeded }
    }),
  getPricing: (hotelId, checkIn, checkOut, roomsNeeded, roomTypeId) =>
    api.get(`/availability/pricing/${hotelId}`, {
      params: { checkIn, checkOut, roomsNeeded, ...(roomTypeId ? { roomTypeId } : {}) }
    }),
};

// Auth API
export const authAPI = {
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  uploadAvatar: (avatar) => api.put('/auth/avatar', { avatar }),
  removeAvatar: () => api.delete('/auth/avatar'),
  // Admin user management
  getUsers: (params) => api.get('/auth/admin/users', { params }),
  getUserById: (id) => api.get(`/auth/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/auth/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}`),
};

// Promo Code API
export const promoAPI = {
  validate: (code, bookingAmount, hotelId) => api.post('/promo/validate', { code, bookingAmount, hotelId }),
  apply: (code, bookingId) => api.post('/promo/apply', { code, bookingId }),
  getAll: () => api.get('/promo'),
  create: (data) => api.post('/promo', data),
  update: (id, data) => api.put(`/promo/${id}`, data),
  delete: (id) => api.delete(`/promo/${id}`),
  toggle: (id) => api.patch(`/promo/${id}/toggle`),
};

export default api;
