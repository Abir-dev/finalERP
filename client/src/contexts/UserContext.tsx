import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session and get user profile
    const checkSession = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.access_token) {
          // Get user profile from backend
          const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.data.session.access_token}`
            }
          });
          
          if (response.data) {
            setUser(response.data);
            // Navigate based on role instead of email
            switch (response.data.role) {
              case "admin":
              case "md":
                navigate("/");
                break;
              case "client-manager":
                navigate("/client-manager");
                break;
              case "store":
                navigate("/store-manager");
                break;
              case "accounts":
                navigate("/accounts-manager");
                break;
              case "site":
                navigate("/site-manager");
                break;
              case "client":
                navigate("/client-portal");
                break;
              default:
                navigate("/");
            }
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        try {
          const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          console.log(response.data)
          if (response.data) {

            setUser(response.data);
            // Navigate based on role instead of email
            switch (response.data.role) {
              case "admin":
              case "md":
                navigate("/md-dashboard");
                break;
              case "client-manager":
                navigate("/client-manager");
                break;
              case "store":
                navigate("/store-manager");
                break;
              case "accounts":
                navigate("/accounts-manager");
                break;
              case "site":
                navigate("/site-manager");
                break;
              case "client":
                navigate("/client-portal");
                break;
              default:
                navigate("/");
            }
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, authenticate with Supabase to get the token
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      if (authData.session) {
        // Get user profile from backend
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`
          }
        });
        
        if (response.data) {
          setUser(response.data);
          // Navigate based on role instead of email
          switch (response.data.user.role) {
            case "admin":
            case "md":
              navigate("/md-dashboard");
              break;
            case "client-manager":
              navigate("/client-manager");
              break;
            case "store":
              navigate("/store-manager");
              break;
            case "accounts":
              navigate("/accounts-manager");
              break;
            case "site":
              navigate("/site-manager");
              break;
            case "client":
              navigate("/client-portal");
              break;
            default:
              navigate("/");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post(`${API_URL}/auth/logout`);
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during logout");
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`
          }
        }
      );

      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during profile update");
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
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