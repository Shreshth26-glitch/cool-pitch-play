import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, logInUser, signUpUser, type User } from "../lib/api-client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      getMe(savedToken)
        .then((userData) => {
          setUser(userData);
        })
        .catch((err) => {
          console.error("Session restoration failed:", err);
          // Token is invalid/expired, clear it
          localStorage.removeItem("auth_token");
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await logInUser({ email, password });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("auth_token", res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await signUpUser(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("auth_token", res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
