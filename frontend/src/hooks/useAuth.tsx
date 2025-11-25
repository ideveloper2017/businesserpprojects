import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken } from '@/lib/api';
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/token';
import { User, AuthResponse, RefreshTokenResponse } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }, []);

  const clearAuthData = useCallback(() => {
    removeToken();
    removeRefreshToken();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      console.log('Refresh already in progress, skipping...');
      return false;
    }
    
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      console.log('No refresh token available');
      return false;
    }

    console.log('Starting token refresh...');
    setIsRefreshing(true);
    
    try {
      console.log('Calling apiRefreshToken...');
      const response = await apiRefreshToken();
      console.log('Token refresh response received');
      
      // Verify the new token is valid
      if (!response?.token || typeof response.token !== 'string' || response.token.split('.').length !== 3) {
        console.error('Invalid token format received from refresh:', response?.token);
        throw new Error('Invalid token format received from server');
      }
      
      console.log('Saving new tokens...');
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      
      // Update user data from the new token
      try {
        const decoded = jwtDecode<{ sub: string; username?: string; roles?: string[] }>(response.token);
        console.log('Decoded refreshed token:', decoded);
        
        if (!decoded.sub) {
          throw new Error('Refreshed token missing required fields');
        }
        
        const userData = {
          id: decoded.sub,
          username: decoded.username || 'user',
          roles: Array.isArray(decoded.roles) ? decoded.roles : []
        };
        
        console.log('Updating user data from refreshed token:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (decodeError) {
        console.error('Error decoding refreshed token:', decodeError);
        // If we can't decode the new token, log out to be safe
        throw new Error('Failed to decode refreshed token');
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, clearAuthData]);

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken();
        const userData = localStorage.getItem('user');
        
        console.log('Initializing auth...', { hasToken: !!token, hasUserData: !!userData });
        
        if (token) {
          if (isTokenExpired(token)) {
            console.log('Token expired, attempting to refresh...');
            const refreshed = await refreshToken();
            if (!refreshed) {
              console.log('Token refresh failed, clearing auth data');
              throw new Error('Session expired');
            }
          } else {
            // Token is valid, set up user
            if (userData) {
              console.log('Setting user from localStorage');
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } else {
              // If we have a token but no user data, try to decode it
              try {
                console.log('Decoding token to get user data...');
                const decoded = jwtDecode<{ sub: string; username?: string; roles?: string[] }>(token);
                const userFromToken = {
                  id: decoded.sub || 'unknown',
                  username: decoded.username || 'user',
                  roles: decoded.roles || []
                };
                console.log('User data from token:', userFromToken);
                localStorage.setItem('user', JSON.stringify(userFromToken));
                setUser(userFromToken);
                setIsAuthenticated(true);
              } catch (decodeError) {
                console.error('Error decoding token:', decodeError);
                // If we can't decode the token, clear auth data
                throw new Error('Invalid token');
              }
            }
          }
        } else {
          console.log('No token found in localStorage');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isTokenExpired, refreshToken]);

  const login = async (username: string, password: string) => {
    try {
      console.log('Starting login process...');
      console.log('Calling apiLogin with:', { username, password: '***' });
      
      const response = await apiLogin({ username, password });
      console.log('Login API response:', JSON.stringify(response, null, 2));
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      // Extract token from response - handle different possible response structures
      let token: string | undefined;
      
      // Case 1: Direct token in response
      if (response.token && typeof response.token === 'string') {
        token = response.token;
      } 
      // Case 2: Token in data object
      else if (response.data?.token && typeof response.data.token === 'string') {
        token = response.data.token;
      }
      // Case 3: Access token in response
      else if (response.accessToken && typeof response.accessToken === 'string') {
        token = response.accessToken;
      }
      // Case 4: Access token in data object
      else if (response.data?.accessToken && typeof response.data.accessToken === 'string') {
        token = response.data.accessToken;
      }
      
      // Verify we have a valid token
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Invalid or missing token in response. Response structure:', response);
        throw new Error('Authentication failed: Invalid response format from server');
      }
      
      // Update response with the found token for consistent handling
      response.token = token;
      
      // Save tokens first
      console.log('Saving tokens...');
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      
      // Try to get user data from the token
      try {
        console.log('Decoding token...');
        const decoded = jwtDecode<{ sub: string; roles?: string[]; username?: string }>(response.token);
        console.log('Decoded token:', decoded);
        
        if (!decoded.sub) {
          throw new Error('Invalid token: missing required fields');
        }
        
        const userData = {
          id: decoded.sub,
          username: decoded.username || username,
          roles: Array.isArray(decoded.roles) ? decoded.roles : []
        };
        
        console.log('Setting user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('Login successful, isAuthenticated set to true');
        return true;
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        
        // Fallback to using just the username if we can't decode the token
        // This is a fallback and should ideally not happen in production
        console.warn('Using fallback user data due to token decode error');
        
        const userData = { 
          id: `user-${Date.now()}`, 
          username: username,
          roles: [] 
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('Login completed with fallback user data');
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    try {
      apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      navigate('/login');
    }
  }, [clearAuthData, navigate]);

  // Update isAuthenticated whenever user changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
