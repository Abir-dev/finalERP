import { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type UserRole = "admin" | "md" | "client-manager" | "store" | "accounts" | "site" | "client";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'RESET_AUTH' };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload, isLoading: false };
    case 'RESET_AUTH':
      return { ...initialState, isLoading: false, isInitialized: true };
    default:
      return state;
  }
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const isLoggingOutRef = useRef(false);
  const mountedRef = useRef(true);

  // Centralized navigation logic
  const navigateByRole = useCallback((role: UserRole) => {
    const roleRoutes: Record<UserRole, string> = {
      admin: "/",
      md: "/md-dashboard",
      "client-manager": "/client-manager",
      store: "/store-manager",
      accounts: "/accounts-manager",
      site: "/site-manager",
      client: "/client-portal",
    };
    navigate(roleRoutes[role] || "/");
  }, [navigate]);

  // Helper function to check if we're on login page
  const isOnLoginPage = useCallback(() => {
    return window.location.pathname === '/login';
  }, []);

  // Helper function to get current session
  const getCurrentSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }, []);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async (accessToken: string): Promise<User | null> => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        timeout: 10000, // 10 second timeout
      });
      return response.data || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't throw here - let the caller handle the null return
      return null;
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    if (isLoggingOutRef.current || !mountedRef.current) return;

    try {
      isLoggingOutRef.current = true;
      
      // Clear user state immediately for better UX
      dispatch({ type: 'RESET_AUTH' });
      
      const session = await getCurrentSession();
      
      // Try to logout from backend first (don't await to avoid blocking)
      if (session?.access_token) {
        axios.post(`${API_URL}/auth/logout`, null, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          timeout: 5000,
        }).catch(error => {
          console.warn('Backend logout failed:', error);
        });
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login page
      if (mountedRef.current && !isOnLoginPage()) {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the state and redirect
      if (mountedRef.current) {
        dispatch({ type: 'RESET_AUTH' });
        navigate("/login", { replace: true });
      }
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [navigate, getCurrentSession, isOnLoginPage]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    if (!mountedRef.current) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.session?.access_token) {
        throw new Error('No session received from authentication');
      }

      // Fetch user profile
      const userProfile = await fetchUserProfile(authData.session.access_token);
      
      if (!userProfile) {
        throw new Error('Failed to fetch user profile');
      }

      if (mountedRef.current) {
        dispatch({ type: 'SET_USER', payload: userProfile });
        navigateByRole(userProfile.role);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login";
      if (mountedRef.current) {
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [fetchUserProfile, navigateByRole]);

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const session = await getCurrentSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          timeout: 10000,
        }
      );

      if (response.data && mountedRef.current) {
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during profile update";
      if (mountedRef.current) {
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
      throw error;
    }
  }, [getCurrentSession]);

  // Initialize auth state and set up listener
  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      // Skip initialization if on login page
      if (isOnLoginPage()) {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        return;
      }

      try {
        const session = await getCurrentSession();
        
        if (session?.access_token && mountedRef.current) {
          const userProfile = await fetchUserProfile(session.access_token);
          
          if (userProfile && mountedRef.current) {
            dispatch({ type: 'SET_USER', payload: userProfile });
          } else if (mountedRef.current) {
            // Profile fetch failed, but we have a session - logout
            await logout();
            return;
          }
        } else if (mountedRef.current && !isOnLoginPage()) {
          // No session and not on login page - redirect
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mountedRef.current && !isOnLoginPage()) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mountedRef.current) {
          dispatch({ type: 'SET_INITIALIZED', payload: true });
        }
      }
    };

    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current || isLoggingOutRef.current || isOnLoginPage()) {
          return;
        }

        try {
          if (event === 'SIGNED_IN' && session?.access_token) {
            const userProfile = await fetchUserProfile(session.access_token);
            
            if (userProfile && mountedRef.current) {
              dispatch({ type: 'SET_USER', payload: userProfile });
              navigateByRole(userProfile.role);
            } else if (mountedRef.current) {
              dispatch({ type: 'RESET_AUTH' });
              navigate("/login", { replace: true });
            }
          } else if (event === 'SIGNED_OUT' && mountedRef.current) {
            dispatch({ type: 'RESET_AUTH' });
            navigate("/login", { replace: true });
          } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
            // Optionally refresh user profile on token refresh
            const userProfile = await fetchUserProfile(session.access_token);
            if (userProfile && mountedRef.current) {
              dispatch({ type: 'SET_USER', payload: userProfile });
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (mountedRef.current) {
            dispatch({ type: 'SET_ERROR', payload: 'Authentication error occurred' });
          }
        } finally {
          if (mountedRef.current) {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      });

      authSubscription = subscription;
    };

    initializeAuth();
    setupAuthListener();

    return () => {
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [getCurrentSession, fetchUserProfile, navigateByRole, navigate, logout, isOnLoginPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const contextValue: UserContextType = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    login,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!state.user,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}