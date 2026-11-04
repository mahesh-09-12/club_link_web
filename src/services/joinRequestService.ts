import { JoinRequest } from "@/types";
import { getAuthToken } from "@/lib/api";

export const joinRequestService = {
  getMyJoinRequests: async (): Promise<JoinRequest[]> => {
    const token = getAuthToken();
    const res = await fetch("/api/join-requests", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to fetch join requests");
    return res.json();
  },

  getClubJoinRequests: async (clubId: number): Promise<JoinRequest[]> => {
    const token = getAuthToken();
    const res = await fetch(`/api/clubs/${clubId}/join-requests`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to fetch club join requests. Status: ${res.status}. Body: ${errorText}`);
        throw new Error("Failed to fetch club join requests");
    }
    return res.json();
  },

  createJoinRequest: async (clubId: number): Promise<JoinRequest> => {
    const token = getAuthToken();
    const res = await fetch("/api/join-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ club_id: clubId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw { response: { status: res.status, data } };
    }
    return data;
  },

  updateJoinRequestStatus: async (requestId: number, status: "approved" | "rejected"): Promise<JoinRequest> => {
    const token = getAuthToken();
    const res = await fetch(`/api/join-requests/${requestId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw { response: { status: res.status, data } };
    }
    return data;
  },
};
