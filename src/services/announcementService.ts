import { AnnouncementItem } from "@/types";
import { getAuthToken } from "@/lib/api";

export const announcementService = {
  getAnnouncements: async (): Promise<AnnouncementItem[]> => {
    const res = await fetch("/api/announcements");
    if (!res.ok) throw new Error("Failed to fetch announcements");
    return res.json();
  },

  postAnnouncement: async (data: Omit<AnnouncementItem, "id" | "date">): Promise<AnnouncementItem> => {
    const token = getAuthToken();
    const res = await fetch("/api/announcements", {
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

  deleteAnnouncement: async (id: number): Promise<void> => {
    const token = getAuthToken();
    const res = await fetch(`/api/announcements/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw { response: { status: res.status } };
  },
};
