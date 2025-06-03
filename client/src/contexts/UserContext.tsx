import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  // if(!isOnRegisterWithTokenPage) console.log("lol error");

  // Helper function to get current session
  const getCurrentSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }, []);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(
    async (accessToken: string): Promise<User | null> => {
      try {
        console.log(
          "Fetching user profile with token:",
          accessToken.substring(0, 10) + "..."
        );
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000, // 10 second timeout
        });

        if (!response.data) {
          console.error("No data received from profile endpoint");
          return null;
        }

        console.log("User profile fetched successfully:", {
          id: response.data.id,
          role: response.data.role,
          email: response.data.email,
        });

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching user profile:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
          });
        } else {
          console.error("Error fetching user profile:", error);
        }
        return null;
      }
    },
    []
  );

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      console.log("Logout already in progress");
      return Promise.reject(new Error("Logout already in progress"));
    }

    console.log("Starting logout process...");
    try {
      isLoggingOutRef.current = true;

      // Clear user state immediately for better UX
      console.log("Clearing user state...");
      dispatch({ type: "RESET_AUTH" });

      const session = await getCurrentSession();

      // Call backend logout endpoint
      if (session?.access_token) {
        console.log("Attempting to logout from backend...");
        try {
          await axios.post(`${API_URL}/auth/logout`, null, {
            headers: { Authorization: `Bearer ${session.access_token}` },
            timeout: 5000,
          });
          console.log("Backend logout successful");
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Backend logout error:", {
              status: error.response?.status,
              data: error.response?.data,
            });
          } else {
            console.error("Backend logout error:", error);
          }
          // Continue with Supabase logout even if backend fails
        }
      }

      // Sign out from Supabase
      console.log("Signing out from Supabase...");
      await supabase.auth.signOut();
      console.log("Supabase signout successful");

      // Navigate to login page
      if (!isOnLoginPage()) {
        console.log("Navigating to login page...");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, make sure we reset the state
      dispatch({ type: "RESET_AUTH" });
      if (!isOnLoginPage()) {
        navigate("/login", { replace: true });
      }
      return Promise.reject(error);
    } finally {
      console.log("Logout process completed");
      isLoggingOutRef.current = false;
    }
  }, [navigate, getCurrentSession, isOnLoginPage]);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      console.log("Starting login process...");
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // Backend login
        const { data } = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        // Supabase auth
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (authError) throw authError;

        console.log("Authentication successful, fetching user profile...");
        const userProfile = await fetchUserProfile(
          authData.session.access_token
        );

        console.log("Login successful, updating state...");
        dispatch({
          type: "SET_USER",
          payload: userProfile,
        });

        navigateByRole(userProfile?.role || "client");
      } catch (error) {
        console.error("Login error:", error);
        dispatch({ type: "SET_ERROR", payload: "Login failed" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [navigateByRole, fetchUserProfile]
  );

  // Update profile function
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        const session = await getCurrentSession();
        if (!session?.access_token) {
          throw new Error("Not authenticated");
        }

        const response = await axios.patch(`${API_URL}/auth/profile`, updates, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          timeout: 10000,
        });

        if (response.data && mountedRef.current) {
          dispatch({ type: "SET_USER", payload: response.data });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during profile update";
        if (mountedRef.current) {
          dispatch({ type: "SET_ERROR", payload: errorMessage });
        }
        throw error;
      }
    },
    [getCurrentSession]
  );

  // Initialize auth state and set up listener
  useEffect(() => {
    console.log("Initializing auth state...");
    mountedRef.current = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      if (!mountedRef.current) return;

      try {
        console.log("Checking current session...");
        const session = await getCurrentSession();

        if (session?.access_token && mountedRef.current) {
          console.log("Valid session found, fetching user profile...");
          const userProfile = await fetchUserProfile(session.access_token);

          if (userProfile && mountedRef.current) {
            console.log("User profile found, updating state...");
            dispatch({ type: "SET_USER", payload: userProfile });

            // If we're on login page and have a valid user, redirect to appropriate page
            if (isOnLoginPage()) {
              console.log(
                "Valid user found on login page, navigating to dashboard..."
              );
              navigateByRole(userProfile.role);
            }
          } else if (
            mountedRef.current &&
            !isOnLoginPage() &&
            !isOnRegisterWithTokenPage()
          ) {
            console.log(
              "No user profile found or component unmounted, redirecting to login..."
            );
            dispatch({ type: "RESET_AUTH" });
            navigate("/login", { replace: true });
          }
        } else if (
          mountedRef.current &&
          !isOnLoginPage() &&
          !isOnRegisterWithTokenPage()
        ) {
          console.log("No valid session, redirecting to login...");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mountedRef.current && !isOnLoginPage()) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mountedRef.current) {
          console.log("Auth initialization completed");
          dispatch({ type: "SET_INITIALIZED", payload: true });
        }
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", {
        event,
        hasSession: !!session,
        isLoginPage: isOnLoginPage(),
        isLoggedIn: !!state.user,
      });

      if (!mountedRef.current) {
        console.log("Auth state change ignored: component unmounted");
        return;
      }

      if (isLoggingOutRef.current) {
        console.log("Auth state change ignored: logout in progress");
        return;
      }

      try {
        if (event === "SIGNED_IN" && session?.access_token) {
          console.log("Processing SIGNED_IN event...");
          const userProfile = await fetchUserProfile(session.access_token);

          if (userProfile && mountedRef.current) {
            console.log("Updating user profile after sign in");
            dispatch({ type: "SET_USER", payload: userProfile });

            if (isOnLoginPage()) {
              navigateByRole(userProfile.role);
            }
          }
        } else if (event === "SIGNED_OUT") {
          console.log("Processing SIGNED_OUT event");
          if (mountedRef.current) {
            dispatch({ type: "RESET_AUTH" });
            if (!isOnLoginPage()) {
              navigate("/login", { replace: true });
            }
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        if (mountedRef.current) {
          dispatch({
            type: "SET_ERROR",
            payload: "Authentication error occurred",
          });
        }
      }
    });

    initializeAuth();
    authSubscription = subscription;

    return () => {
      console.log("Cleanup triggered from location:", window.location.pathname);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      mountedRef.current = false;
    };
  }, []); // Empty dependency array - this effect should only run once

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
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
