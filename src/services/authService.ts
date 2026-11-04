import { User, UserRole } from "@/types";

export const authService = {
  login: async (credentials: { email: string; password?: string }): Promise<{ access_token: string; user: User }> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw { response: { status: res.status, data } };
    }
    return data;
  },

  register: async (payload: { full_name: string; email: string; password?: string; role: UserRole }): Promise<{ access_token: string; user: User }> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw { response: { status: res.status, data } };
    }
    return data;
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw { response: { status: res.status, data } };
    }
    return data;
  },

  logout: async (token: string) => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  },
};
