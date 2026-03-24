import React, { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin } from "@/services/apiService";
import { hasRouteAccess } from "@/config/rbac";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  instansi?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Check if the current user can access a given route */
  hasAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("bpbd_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("bpbd_token"));

  const loginFn = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    // res = { token, user } from backend
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("bpbd_user", JSON.stringify(res.user));
    localStorage.setItem("bpbd_token", res.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bpbd_user");
    localStorage.removeItem("bpbd_token");
  }, []);

  const hasAccess = useCallback(
    (path: string) => hasRouteAccess(user?.role, path),
    [user?.role]
  );

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login: loginFn, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
