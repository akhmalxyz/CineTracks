'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
  email?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateUser: (username: string, email?: string) => Promise<void>;
  deleteUser: () => Promise<void>;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  useGuestAccess: () => Promise<void>;
  upgradeGuestAccount: (username: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const router = useRouter();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedExpiry = localStorage.getItem('token_expiry');
    const storedIsGuest = localStorage.getItem('is_guest') === 'true';
    
    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      // Check if token is expired
      if (Date.now() > expiryTime) {
        // Token expired, log out
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('is_guest');
        setToken(null);
        setUser(null);
        setTokenExpiry(null);
        setIsGuest(false);
        setIsLoading(false);
      } else {
        // Token is valid
        setToken(storedToken);
        setTokenExpiry(expiryTime);
        setIsGuest(storedIsGuest);
        
        // Try to fetch user details
        fetchCurrentUser(storedToken);
      }
    } else {
      // No stored token, check if we should use guest access by default
      tryDefaultGuestAccess();
    }
  }, []);

  // Automatically try to set guest access when the app loads (if no existing session)
  const tryDefaultGuestAccess = async () => {
    // Only attempt guest access if there's no existing user session
    if (!token && !user) {
      try {
        await useGuestAccess();
      } catch (error) {
        // Silently fail and let the user continue without auto guest login
        console.error("Could not auto-enable guest access:", error);
        setIsLoading(false);
      }
    }
  };

  // Fetch current user details using an existing token
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoading(false);
      } else {
        // Not authorized or other error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('is_guest');
        setToken(null);
        setUser(null);
        setTokenExpiry(null);
        setIsGuest(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setIsLoading(false);
    }
  };

  // User login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store auth token and expiry
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      localStorage.setItem('is_guest', 'false');
      
      setToken(data.token);
      setTokenExpiry(expiryTime);
      setIsGuest(false);
      
      // Set user data
      setUser({
        username,
        email: data.user?.email || undefined,
        role: data.user?.role || 'USER'
      });
      
      // Redirect to home page instead of dashboard
      router.push('/home');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // User registration
  const register = async (username: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto login after successful registration
      await login(username, password);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred during registration');
      }
      setIsLoading(false);
    }
  };

  // Guest access
  const useGuestAccess = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not create guest session');
      }

      // Store guest token
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      localStorage.setItem('is_guest', 'true');
      
      setToken(data.token);
      setTokenExpiry(expiryTime);
      setIsGuest(true);
      
      // Set guest user data
      setUser({
        username: 'Guest',
        role: 'GUEST'
      });
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Upgrade guest account to permanent account
  const upgradeGuestAccount = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    if (!token || !isGuest) {
      setError('No guest session to upgrade');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/auth/upgrade-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account creation failed');
      }

      // Update session with new user details
      localStorage.setItem('is_guest', 'false');
      
      setUser({
        username,
        email,
        role: 'USER'
      });
      
      setIsGuest(false);
      
      // Redirect to home page instead of dashboard
      router.push('/home');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (username: string, email?: string) => {
    if (!token) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update user data
      setUser(prevUser => ({
        ...prevUser!,
        username,
        email: email || prevUser?.email
      }));
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      
      return data;
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        const genericError = new Error('An unexpected error occurred');
        setError(genericError.message);
        throw genericError;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset email
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user account
  const deleteUser = async () => {
    if (!token) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      // Clear user data and redirect to home
      logout();
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('is_guest');
    setUser(null);
    setToken(null);
    setTokenExpiry(null);
    setIsGuest(false);
    setError(null);
    router.push('/login');
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isGuest,
        login,
        register,
        logout,
        updateUser,
        deleteUser,
        clearError,
        requestPasswordReset,
        resetPassword,
        changePassword,
        useGuestAccess,
        upgradeGuestAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}