import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '../constants/config';

// User interface matching backend response
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  enrollment_status?: string;
  churchAssignments?: Array<{
    id: number;
    user_id: number;
    church_id: number;
    church_name: string;
  }>;
}

// Authentication Context
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app load
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/auth/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid && data.user) {
              setUser(data.user);
              setIsLoggedIn(true);
            } else {
              localStorage.removeItem('authToken');
            }
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkExistingAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        
        // Update auth state
        setUser(data.user);
        setIsLoggedIn(true);
        setLoading(false);
        return true;
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUser(null);
    setError(null);
  };

  const refreshUser = async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('User refresh failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
