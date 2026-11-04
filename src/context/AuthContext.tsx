"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { authService } from "@/services/authService";
import { getAuthToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password?: string }) => Promise<User>;
  register: (data: { email: string; password?: string; full_name: string; role: UserRole }) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authService
        .getCurrentUser(token)
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("clublink_auth_token");
          setUser(null);
        });
    }
  }, []);

  const login = async (credentials: { email: string; password?: string }): Promise<User> => {
    const res = await authService.login(credentials);
    localStorage.setItem("clublink_auth_token", res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { email: string; password?: string; full_name: string; role: UserRole }): Promise<User> => {
    const res = await authService.register(data);
    localStorage.setItem("clublink_auth_token", res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    const token = getAuthToken();
    if (token) {
      authService.logout(token);
    }
    setUser(null);
    localStorage.removeItem("clublink_auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
