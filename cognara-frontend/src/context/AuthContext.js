import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, getAuthStatus } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to check authentication status
  const checkAuthStatus = async () => {
    console.log('[AuthContext] Checking auth status...');
    try {
      const data = await getAuthStatus();
      console.log('[AuthContext] Auth status response:', data);
      
      // Modified to match your API structure
      if (data.authenticated) {
        setUser({
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          bio: data.bio,
          email_verified: data.email_verified
        });
      } else {
        setUser(null);
      }
      
      return data.authenticated;
    } catch (err) {
      console.error('[AuthContext] Error checking auth status:', err);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const isAuthenticated = await checkAuthStatus();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null); // Immediately clear user state
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
  };

  

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);