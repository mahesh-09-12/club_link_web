"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { joinRequestService } from "@/services/joinRequestService";
import { clubService } from "@/services/clubService";
import { JoinRequest, Club } from "@/types";
import { Button } from "@/components/ui/button";

export function CoordinatorJoinRequestsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const fetchJoinRequests = useCallback(async () => {
    if (selectedClubId === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await joinRequestService.getClubJoinRequests(selectedClubId);
      setRequests(data);
    } catch (err: any) {
      console.error("Failed to fetch join requests:", err);
      setError("Failed to load join requests for this club.");
    } finally {
      setLoading(false);
    }
  }, [selectedClubId]);

  useEffect(() => {
    if (selectedClubId !== null) {
      fetchJoinRequests();
    }
  }, [selectedClubId, fetchJoinRequests]);

  const handleUpdateStatus = async (
    requestId: number,
    newStatus: "approved" | "rejected"
  ) => {
    setProcessingId(requestId);
    try {
      const updatedReq = await joinRequestService.updateJoinRequestStatus(
        requestId,
        newStatus
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? updatedReq : r))
      );
    } catch (err: any) {
      console.error("Failed to update join request status:", err);
      alert(err.response?.data?.detail || "Failed to update request status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === "all") return true;
    return req.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const selectedClub = clubs.find((c) => c.id === selectedClubId);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Club Join Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and process membership applications for your assigned campus clubs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
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
                  {c.name} (ID: {c.id})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              placeholder="Enter Club ID"
              value={selectedClubId ?? ""}
              onChange={(e) => setSelectedClubId(Number(e.target.value))}
              className="px-3 py-2 border border-border bg-card rounded-md text-sm outline-none focus:border-primary w-36"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border bg-card rounded-md text-sm outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {selectedClub && (
        <div className="p-4 border border-border bg-card rounded-lg flex justify-between items-center text-sm">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Managing Requests For
            </span>
            <span className="font-bold text-base text-foreground">{selectedClub.name}</span>
          </div>
          <Button onClick={fetchJoinRequests} variant="ghost" size="sm" className="gap-1 text-xs">
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Fetching join requests...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/25 text-destructive rounded-lg text-sm">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="border border-border bg-card rounded-lg shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Request ID</th>
                <th className="p-4">Student ID</th>
                <th className="p-4">Date Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-mono text-xs text-muted-foreground">#{req.id}</td>
                  <td className="p-4 font-semibold text-foreground">Student #{req.student_id}</td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        req.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : req.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      {req.status === "pending" && <Clock className="size-3" />}
                      {req.status === "approved" && <CheckCircle className="size-3" />}
                      {req.status === "rejected" && <XCircle className="size-3" />}
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {req.status !== "approved" && (
                      <Button
                        size="xs"
                        variant="default"
                        disabled={processingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Approve
                      </Button>
                    )}
                    {req.status !== "rejected" && (
                      <Button
                        size="xs"
                        variant="destructive"
                        disabled={processingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, "rejected")}
                      >
                        Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-16">
              <Users className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No join requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
