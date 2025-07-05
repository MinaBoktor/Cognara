import { createContext, useContext, useEffect, useState } from 'react';
import { getAuthStatus } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // important to delay route decisions

    useEffect(() => {
    const loadAuth = async () => {
        console.log('[AuthContext] Calling /auth/status...');
        try {
        const data = await getAuthStatus();
        console.log('[AuthContext] Response:', data);
        setUser(data.authenticated ? data : null);
        } catch (err) {
        console.error('[AuthContext] Error checking auth status:', err);
        setUser(null);
        } finally {
        setLoading(false);
        }
    };

    loadAuth();
    }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
