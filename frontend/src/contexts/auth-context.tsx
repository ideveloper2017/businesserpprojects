import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {isAuthenticated, logout, refreshAccessToken} from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Check authentication status on mount

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          try {
            // Try to refresh the token on app load
            await refreshAccessToken();
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, clear tokens and set as not authenticated
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
          }
        } else {
          // No tokens available, not authenticated
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const isAuth = await isAuthenticated();
  //       setIsLoggedIn(isAuth);
  //     } catch (error) {
  //       console.error('Auth check failed:', error);
  //       setIsLoggedIn(false);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //
  //   checkAuth();
  // }, []);

  const login = (tokens: { token: string; refreshToken: string; expiresIn?: number }) => {
    console.log('=== AUTH LOGIN START ===');
    console.log('Received tokens:', tokens);
    
    const { token, refreshToken } = tokens;
    
    if (!token || !refreshToken) {
      console.error('Missing required tokens');
      throw new Error('Authentication failed: Missing required tokens');
    }
    
    try {
      console.log('Storing tokens in localStorage');
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set a timeout to refresh the token before it expires
      if (tokens.expiresIn) {
        const expiresInMs = (tokens.expiresIn - 60) * 1000; // Refresh 1 minute before expiration
        console.log(`Token will expire in ${tokens.expiresIn} seconds`);
        // You might want to set up token refresh logic here
      }
      
      setIsAuthenticated(true);
      console.log('=== AUTH LOGIN SUCCESS ===');
      return true;
    } catch (error) {
      console.error('Error storing tokens:', error);
      // Clear any partial authentication data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Failed to store authentication data');
    }
  };

  // Function to check if user is authenticated
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const authStatus = await isAuthenticated();
      setIsAuthenticated(authStatus);
      return authStatus;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Function to log out user
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
