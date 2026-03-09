import React, { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin } from "@/services/apiService";

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login: loginFn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
