import axios from 'axios';


function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : null;
}

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to inject CSRF and App token
apiClient.interceptors.request.use((config) => {
  config.headers['Content-Type'] = 'application/json';
  config.headers['App-Token'] = process.env.REACT_APP_API_TOKEN;
  console.log(process.env.REACT_APP_API_TOKEN)
  config.headers['X-CSRFToken'] = getCookie('csrftoken');
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Articles API
export const articlesAPI = {
  // Get all articles
  getAll: () => apiClient.get('articles'),
  getById: (id) => apiClient.get(`articles/${id}`),
  getComments: (id) => apiClient.get(`articles/${id}/comments`),
  postComment: async (article_id, comment) => {
    try {
      // Check if user is authenticated first
      const authStatus = await getAuthStatus();
      if (!authStatus.authenticated) {
        throw new Error('User not authenticated');
      }
      
      // Ensure CSRF token is available
      await fetchCSRFToken();
      
      const response = await apiClient.post('articles/add-comment', {
        comment: comment,
        article_id: article_id
      });
      
      return response;
    } catch (error) {
      console.error('Error posting comment:', error);
      
      // If authentication failed, redirect to login
      if (error.response?.status === 401) {
        // Handle authentication error (redirect to login, etc.)
        window.location.href = '/login';
      }
      
      throw error;
    }
  },
  getImages: (articleId) => apiClient.post('get-article-images', { article_id: articleId }),
  submit: async (articleData, articleId = -1, isDraft = false) => {
    try {
      await fetchCSRFToken();
      
      // Prepare the payload with explicit type conversion
      const payload = {
        article_id: articleId !== -1 ? Number(articleId) : null, // Explicit null for new articles
        title: articleData.title,
        subtitle: articleData.subtitle,
        content: articleData.content,
        status: isDraft ? 'draft' : 'published',
        is_draft: isDraft // Additional boolean flag if needed
      };

      const response = await apiClient.post('submit', payload);
      return response.data;
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  },
  // Upload photo for article
  uploadImage: async (articleId, file) => {
      try {
          // 1. Authentication check
          const authStatus = await getAuthStatus();
          if (!authStatus.authenticated) {
            throw new Error('User not authenticated');
          }
          
          // 2. Get CSRF token
          await fetchCSRFToken();
          
          // 3. Prepare FormData
          const formData = new FormData();
          formData.append('file', file);
          
          // 4. Create custom config that overrides the interceptor
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data', // Required for file uploads
              'X-CSRFToken': getCookie('csrftoken'),
              'App-Token': process.env.REACT_APP_API_TOKEN
            },
            transformRequest: (data) => data // Prevent axios from transforming FormData
          };
          
          // 5. Use apiClient instead of raw axios
          const response = await apiClient.post(
            `upload-article-image/${articleId}`,
            formData,
            config
          );
          
          return response.data;
          
        } catch (error) {
          console.error('Image upload error:', {
            error: error.message,
            response: error.response?.data
          });
          
          if (error.response?.status === 401) {
            window.location.href = '/login';
            return;
          }
          
          throw new Error(error.response?.data?.error || 'Image upload failed');
        }
  },
  // Add this to the articlesAPI object in api.js
  deleteImage: async (articleId) => {
    try {
      const authStatus = await getAuthStatus();
      if (!authStatus.authenticated) {
        throw new Error('User not authenticated');
      }
      
      await fetchCSRFToken();
      
      const response = await apiClient.post(`delete-article-image/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      
      throw error;
    }
  }
};

// Authentication API
export const authAPI = {
  // Regular login
  login: (email, password) => 
    apiClient.post('login', {
      email: email.toLowerCase(),
      password_hash: password
    }),

  logout: () => apiClient.post('logout'),

  // Social authentication
  googleAuth: (credential) =>
    apiClient.post('auth/google', {
      credential: credential
    }),

  facebookAuth: (accessToken, userId, userInfo) =>
    apiClient.post('auth/facebook', {
      access_token: accessToken,
      user_id: userId,
      user_info: userInfo
    }),
};

// User management API
export const userAPI = {
  // Check if username exists
  checkUsername: (username) =>
    apiClient.post('usercheck', {
      username: username
    }),

  // Check if email exists
  checkEmail: (email) =>
    apiClient.post('emailcheck', {
      email: email.toLowerCase()
    }),

  // Sign up new user
  signup: (userData) =>
    apiClient.post('signup', {
      username: userData.username,
      email: userData.email.toLowerCase(),
      password_hash: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName
    }),
};

// Email verification API
export const emailAPI = {
  // Request verification code
  requestCode: (email) =>
    apiClient.post('coderequest', {
      email: email.toLowerCase()
    }),

  // Verify code
  verifyCode: (email, code) =>
    apiClient.post('verifycode', {
      email: email.toLowerCase(),
      code: code
    }),
};

// Password reset API
export const passwordAPI = {
  // Reset password
  resetPassword: (email, newPassword) =>
    apiClient.post('forgetpass', {
      email: email.toLowerCase(),
      password: newPassword
    }),
};

// Newsletter API
export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: (email) =>
    apiClient.post('newsletter/subscribe', {
      email: email
    }),
};

// Generic API helper for custom requests
export const makeRequest = async (method, endpoint, data = null, customHeaders = {}) => {
  try {
    const config = {
      method,
      url: endpoint,
      headers: {
        ...apiClient.defaults.headers,
        ...customHeaders,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await apiClient(config);
    return response;
  } catch (error) {
    throw error;
  }
};


export const fetchCSRFToken = async () => {
  try {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/get_csrf_token`, {
      method: 'GET',
      credentials: 'include',
    });
    console.log('✅ CSRF token fetched');
  } catch (error) {
    console.error('❌ Failed to fetch CSRF token:', error);
  }
};


export const getAuthStatus = async () => {
  const response = await apiClient.get('auth/status');
  return response.data;
};


// Export the configured axios instance for direct use if needed
export default apiClient;