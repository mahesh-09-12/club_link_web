import { Club } from "@/types";
import { getAuthToken } from "@/lib/api";

export const clubService = {
  getClubs: async (): Promise<Club[]> => {
    const res = await fetch("/api/clubs");
    if (!res.ok) throw new Error("Failed to fetch clubs");
    return res.json();
  },

  getMyClubs: async (): Promise<Club[]> => {
    const token = getAuthToken();
    const res = await fetch("/api/clubs/my", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to fetch my clubs");
    return res.json();
  },

  getClubById: async (id: string | number): Promise<Club> => {
    const res = await fetch(`/api/clubs/${id}`);
    if (!res.ok) throw { response: { status: res.status } };
    return res.json();
  },

  createClub: async (data: Omit<Club, "id" | "status" | "created_at">): Promise<Club> => {
    const token = getAuthToken();
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw { response: { status: res.status, data: result } };
    return result;
  },

  updateClub: async (id: number, data: Partial<Club>): Promise<Club> => {
    const token = getAuthToken();
    const res = await fetch(`/api/clubs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw { response: { status: res.status, data: result } };
    return result;
  },

  deleteClub: async (id: number): Promise<void> => {
    const token = getAuthToken();
    const res = await fetch(`/api/clubs/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw { response: { status: res.status } };
  },
};
