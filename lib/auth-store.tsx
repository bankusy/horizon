"use client";

import { useState, useEffect, createContext, useContext } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token in localStorage on mount
    const token = localStorage.getItem("admin_session");
    if (token === "authenticated") {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("admin_session", token);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_session");
    setIsAdmin(false);
    window.location.href = "/admin/login";
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
