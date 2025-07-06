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

