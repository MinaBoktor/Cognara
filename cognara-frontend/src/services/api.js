import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Articles API
export const articlesAPI = {
  // Get all articles
  getAll: () => apiClient.get('/articles/'),
  
  // Get approved articles only
  getApproved: () => apiClient.get('/articles/?approved=true'),
  
  // Get single article by ID
  getById: (id) => apiClient.get(`/articles/${id}/`),
  
  // Get article by slug
  getBySlug: (slug) => apiClient.get(`/articles/by-slug/${slug}/`),
  
  // Create new article
  create: (articleData) => apiClient.post('/articles/', articleData),
  
  // Update article
  update: (id, articleData) => apiClient.put(`/articles/${id}/`, articleData),
  
  // Delete article
  delete: (id) => apiClient.delete(`/articles/${id}/`),
  
  // Approve article
  approve: (id) => apiClient.post(`/articles/${id}/approve/`),
};

// Subscribers API
export const subscribersAPI = {
  // Get all subscribers
  getAll: () => apiClient.get('/subscribers/'),
  
  // Create new subscriber
  create: (subscriberData) => apiClient.post('/subscribers/', subscriberData),
  
  // Delete subscriber
  delete: (id) => apiClient.delete(`/subscribers/${id}/`),
};

export default apiClient;

