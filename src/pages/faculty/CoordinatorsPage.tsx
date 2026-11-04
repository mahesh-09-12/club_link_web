"use client";

import { useEffect, useState, useCallback } from "react";
import { UserCheck, Loader2, AlertCircle, Building, CheckCircle, Save } from "lucide-react";
import { clubService } from "@/services/clubService";
import { getAuthToken } from "@/lib/api";
import { Club } from "@/types";
import { Button } from "@/components/ui/button";

interface CoordinatorUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export function FacultyCoordinatorsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [coordinators, setCoordinators] = useState<CoordinatorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoordinators, setSelectedCoordinators] = useState<Record<number, number | "">>({});
  const [savingClubId, setSavingClubId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const [myClubs, coordRes] = await Promise.all([
        clubService.getMyClubs(),
        fetch("/api/coordinators", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to fetch coordinators");
          return res.json();
        }),
      ]);

      setClubs(myClubs);
      setCoordinators(coordRes);

      const initialMap: Record<number, number | ""> = {};
      myClubs.forEach((c) => {
        initialMap[c.id] = c.club_coordinator_id ?? "";
      });
      setSelectedCoordinators(initialMap);
    } catch (err: any) {
      console.error("Failed to load coordinators data:", err);
      setError("Failed to load clubs or coordinators list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async (clubId: number) => {
    const coordId = selectedCoordinators[clubId];
    setSavingClubId(clubId);
    setSuccessMsg(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/clubs/${clubId}/coordinator`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ coordinator_id: coordId === "" ? null : Number(coordId) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to update coordinator assignment.");
      }

      setSuccessMsg(`Coordinator assignment updated for Club #${clubId}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to assign coordinator.");
    } finally {
      setSavingClubId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground font-sans">
        <Loader2 className="size-8 animate-spin mb-3 text-primary" />
        <p className="text-sm">Loading coordinator assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Club Coordinators Assignment</h1>
        <p className="text-muted-foreground mt-1">
          Assign student club coordinators to manage daily club operations, join requests, and events.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" /> {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="size-5 shrink-0" /> {successMsg}
        </div>
      )}

      <div className="border border-border bg-card rounded-lg shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Club ID</th>
              <th className="p-4">Club Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Assigned Student Coordinator</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clubs.map((c) => (
              <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                <td className="p-4 font-mono text-xs text-muted-foreground">#{c.id}</td>
                <td className="p-4 font-semibold text-foreground">{c.name}</td>
                <td className="p-4 text-muted-foreground">{c.category}</td>
                <td className="p-4">
                  <select
                    value={selectedCoordinators[c.id] ?? ""}
                    onChange={(e) =>
                      setSelectedCoordinators((prev) => ({
                        ...prev,
                        [c.id]: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="px-3 py-1.5 border border-border bg-background rounded-md text-sm outline-none focus:border-primary font-medium w-full max-w-xs"
                  >
                    <option value="">-- No Coordinator Assigned --</option>
                    {coordinators.map((coord) => (
                      <option key={coord.id} value={coord.id}>
                        {coord.full_name} ({coord.email})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <Button
                    size="xs"
                    disabled={savingClubId === c.id}
                    onClick={() => handleAssign(c.id)}
                    className="gap-1.5"
                  >
                    {savingClubId === c.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    Save Assignment
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clubs.length === 0 && (
          <div className="text-center py-16">
            <Building className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No clubs registered under your faculty supervision.</p>
          </div>
        )}
      </div>
    </div>
  );
}
