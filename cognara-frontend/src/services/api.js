import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if available
API.interceptors.request.use(
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

export const getArticles = async (params = {}) => {
  try {
    const response = await API.get('/articles/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getArticleBySlug = async (slug) => {
  try {
    const response = await API.get(`/articles/${slug}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitArticle = async (articleData) => {
  try {
    const response = await API.post('/articles/submit/', articleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const approveArticle = async (articleId) => {
  try {
    const response = await API.put(`/articles/${articleId}/approve/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteArticle = async (articleId) => {
  try {
    const response = await API.delete(`/articles/${articleId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const subscribeNewsletter = async (email) => {
  try {
    const response = await API.post('/newsletter/subscribe/', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendNewsletter = async (articleId) => {
  try {
    const response = await API.post('/newsletter/send/', { article_id: articleId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default API;