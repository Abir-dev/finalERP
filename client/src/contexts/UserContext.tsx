
import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "md"  | "client-manager" | "store" | "accounts" | "site" | "client";

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
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would connect to your authentication service
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulated authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === "admin@constructflow.com" && password === "password") {
        setUser({
          id: "1",
          name: "Admin User",
          email: "admin@constructflow.com",
          role: "admin",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
        });
      } else if (email === "md@constructflow.com" && password === "password") {
        setUser({
          id: "2",
          name: "Managing Director",
          email: "md@constructflow.com",
          role: "md",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=md"
        });
      } else if (email === "client-manager@constructflow.com" && password === "password") {
        setUser({
          id: "5",
          name: "Client Manager",
          email: "client-manager@constructflow.com",
          role: "client-manager",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=client"
        });
      } else if (email === "store@constructflow.com" && password === "password") {
        setUser({
          id: "6",
          name: "Store Manager",
          email: "store@constructflow.com",
          role: "store",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=store"
        });
      } else if (email === "accounts@constructflow.com" && password === "password") {
        setUser({
          id: "7",
          name: "Accounts Manager",
          email: "accounts@constructflow.com",
          role: "accounts",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=accounts"
        });
      } else if (email === "site@constructflow.com" && password === "password") {
        setUser({
          id: "8",
          name: "Site Manager",
          email: "site@constructflow.com",
          role: "site",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=site"
        });
      } else if (email === "client@constructflow.com" && password === "password") {
        setUser({
          id: "9",
          name: "Client User",
          email: "client@constructflow.com",
          role: "client",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=client_user"
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      logout,
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
