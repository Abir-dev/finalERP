import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

export type UserRole =
  | "admin"
  | "md"
  | "client-manager"
  | "store"
  | "accounts"
  | "site"
  | "client";

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
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "RESET_AUTH" };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload, isLoading: false };
    case "RESET_AUTH":
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
  const navigateByRole = useCallback(
    (role: UserRole) => {
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
    },
    [navigate]
  );

  // Helper function to check if we're on login page
  const isOnLoginPage = useCallback(() => {
    return window.location.pathname === "/login";
  }, []);

  // Helper function to check if we're on register page with token
  const isOnRegisterWithTokenPage = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return window.location.pathname === "/register" && params.has("token");
  }, []);

  // Helper to get JWT from sessionStorage
  const getToken = () => sessionStorage.getItem("jwt_token");

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(
    async (token: string): Promise<User | null> => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });
        if (!response.data) return null;
        return response.data;
      } catch (error) {
        return null;
      }
    },
    []
  );

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token } = response.data;
        if (!token) throw new Error("No token received from server");
        sessionStorage.setItem("jwt_token", token);
        const user = await fetchUserProfile(token);
        if (!user) throw new Error("Failed to fetch user profile");
        dispatch({ type: "SET_USER", payload: user });
        dispatch({ type: "SET_ERROR", payload: null });
        navigateByRole(user.role);
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || error.message || "Login failed" });
        dispatch({ type: "SET_USER", payload: null });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [fetchUserProfile, navigateByRole]
  );

  // Logout function
  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return Promise.reject(new Error("Logout already in progress"));
    isLoggingOutRef.current = true;
    try {
      dispatch({ type: "RESET_AUTH" });
      const token = getToken();
      if (token) {
        try {
          await axios.post(`${API_URL}/auth/logout`, null, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
        } catch (error) {
          // Ignore backend logout errors
        }
      }
      sessionStorage.removeItem("jwt_token");
      if (!isOnLoginPage()) navigate("/login", { replace: true });
    } catch (error) {
      dispatch({ type: "RESET_AUTH" });
      if (!isOnLoginPage()) navigate("/login", { replace: true });
      return Promise.reject(error);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [navigate, isOnLoginPage]);

  // Update profile function
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");
        const response = await axios.put(`${API_URL}/auth/profile`, updates, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: "SET_USER", payload: response.data });
        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || error.message || "Update failed" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  // Initialize auth on mount
  useEffect(() => {
    mountedRef.current = true;
    const initializeAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const token = getToken();
      if (token) {
        const user = await fetchUserProfile(token);
        if (user) {
          dispatch({ type: "SET_USER", payload: user });
        } else {
          sessionStorage.removeItem("jwt_token");
          dispatch({ type: "SET_USER", payload: null });
        }
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
      dispatch({ type: "SET_INITIALIZED", payload: true });
      dispatch({ type: "SET_LOADING", payload: false });
    };
    initializeAuth();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchUserProfile]);

  const value: UserContextType = {
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

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
