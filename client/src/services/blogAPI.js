import api from './api';

// Blog API
export const blogAPI = {
  // Public routes
  getAll: (params) => api.get('/blog', { params }),
  getFeatured: (limit = 3) => api.get('/blog/featured', { params: { limit } }),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  getCategories: () => api.get('/blog/categories'),
  getTags: () => api.get('/blog/tags'),
  
  // Admin routes
  getAllAdmin: (params) => api.get('/blog/admin/all', { params }),
  getById: (id) => api.get(`/blog/admin/${id}`),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
  toggleFeatured: (id) => api.patch(`/blog/${id}/featured`),
};

export default blogAPI;
