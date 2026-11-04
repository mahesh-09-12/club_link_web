"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { clubService } from "@/services/clubService";
import { getAuthToken } from "@/lib/api";
import { Club, JoinRequest } from "@/types";
import { Button } from "@/components/ui/button";

export function CoordinatorMembersPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [members, setMembers] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clubService
      .getMyClubs()
      .then((data) => {
        setClubs(data);
        if (data.length > 0) {
          setSelectedClubId(data[0].id);
        }
        setLoadingClubs(false);
      })
      .catch(() => setLoadingClubs(false));
  }, []);

  const fetchMembers = useCallback(async () => {
    if (selectedClubId === null) return;
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/clubs/${selectedClubId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to fetch members. Status: ${res.status}. Body: ${errorText}`);
          throw new Error("Failed to fetch members");
      }
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError("Failed to load club members.");
    } finally {
      setLoading(false);
    }
  }, [selectedClubId]);

  useEffect(() => {
    if (selectedClubId !== null) {
      fetchMembers();
    }
  }, [selectedClubId, fetchMembers]);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Club Members Roster</h1>
        <p className="text-muted-foreground mt-1">
          View all approved members for your clubs.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Select Club:
        </label>
        {loadingClubs ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading clubs...
          </div>
        ) : clubs.length > 0 ? (
          <select
            value={selectedClubId ?? ""}
            onChange={(e) => setSelectedClubId(Number(e.target.value))}
            className="px-3 py-2 border border-border bg-card rounded-md text-sm outline-none focus:border-primary font-medium transition-colors cursor-pointer"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">No clubs available to manage.</p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="size-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Fetching members...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="size-5" /> {error}
        </div>
      ) : (
        <div className="border border-border bg-card rounded-lg shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Student ID</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-semibold text-foreground">Student #{m.student_id}</td>
                  <td className="p-4 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="text-center py-16">
              <Users className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No approved members found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
