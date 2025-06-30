import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Articles API
export const articlesAPI = {
  // Get all articles
  getAll: () => apiClient.get('articles'),
  getById: (id) => apiClient.get(`articles/${id}`),
  getComments: (id) => apiClient.get(`articles/${id}/comments`),
};

export default apiClient;

