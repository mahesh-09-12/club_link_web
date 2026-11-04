import { EventItem } from "@/types";
import { getAuthToken } from "@/lib/api";

export const eventService = {
  getEvents: async (): Promise<EventItem[]> => {
    const res = await fetch("/api/events");
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  },

  createEvent: async (data: Omit<EventItem, "id" | "RSVPCount" | "created_at">): Promise<EventItem> => {
    const token = getAuthToken();
    const res = await fetch("/api/events", {
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

  deleteEvent: async (id: number): Promise<void> => {
    const token = getAuthToken();
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw { response: { status: res.status } };
  },
};
