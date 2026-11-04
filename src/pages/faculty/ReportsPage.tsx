"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  Building,
  Calendar,
  UserPlus,
  Loader2,
  TrendingUp,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { clubService } from "@/services/clubService";
import { getAuthToken } from "@/lib/api";
import { Club, Event } from "@/types";
import { Button } from "@/components/ui/button";

interface JoinReqItem {
  id: number;
  club_id: number;
  student_id: number;
  status: "pending" | "approved" | "rejected";
}

interface ClubStats {
  club: Club;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  eventsCount: number;
}

export function FacultyReportsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState<ClubStats[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch clubs managed by this faculty
        const [myClubs, allEvents] = await Promise.all([
          clubService.getMyClubs(),
          fetch("/api/events", { headers }).then((res) => (res.ok ? res.json() : [])),
        ]);

        setClubs(myClubs);
        setEvents(allEvents);

        // Fetch join requests per club
        const clubStatsList: ClubStats[] = await Promise.all(
          myClubs.map(async (club) => {
            try {
              const reqs: JoinReqItem[] = await fetch(`/api/clubs/${club.id}/join-requests`, { headers }).then(
                (res) => (res.ok ? res.json() : [])
              );

              const approved = reqs.filter((r) => r.status === "approved").length;
              const pending = reqs.filter((r) => r.status === "pending").length;
              const rejected = reqs.filter((r) => r.status === "rejected").length;
              const clubEvents = allEvents.filter((e: Event) => e.club_id === club.id).length;

              return {
                club,
                approvedCount: approved,
                pendingCount: pending,
                rejectedCount: rejected,
                eventsCount: clubEvents,
              };
            } catch {
              return {
                club,
                approvedCount: 0,
                pendingCount: 0,
                rejectedCount: 0,
                eventsCount: 0,
              };
            }
          })
        );

        setStats(clubStatsList);
      } catch (err) {
        console.error("Failed to load faculty reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // Summary Metrics
  const totalClubs = clubs.length;
  const totalMembers = useMemo(() => stats.reduce((acc, s) => acc + s.approvedCount, 0), [stats]);
  const totalPending = useMemo(() => stats.reduce((acc, s) => acc + s.pendingCount, 0), [stats]);
  const totalEvents = useMemo(() => events.filter((e) => clubs.some((c) => c.id === e.club_id)).length, [events, clubs]);

  const approvalRate = useMemo(() => {
    const totalReqs = stats.reduce((acc, s) => acc + s.approvedCount + s.rejectedCount, 0);
    if (totalReqs === 0) return 100;
    return Math.round((totalMembers / totalReqs) * 100);
  }, [stats, totalMembers]);

  // CSV Export Function
  const handleExportCSV = () => {
    setExporting(true);
    try {
      const headers = ["Club ID", "Club Name", "Category", "Status", "Active Members", "Pending Requests", "Rejected Requests", "Events Hosted"];
      const rows = stats.map((s) => [
        s.club.id,
        `"${s.club.name.replace(/"/g, '""')}"`,
        `"${s.club.category}"`,
        s.club.status,
        s.approvedCount,
        s.pendingCount,
        s.rejectedCount,
        s.eventsCount,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `campus_club_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export CSV:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground font-sans">
        <Loader2 className="size-8 animate-spin mb-3 text-primary" />
        <p className="text-sm font-medium">Generating campus analytics report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Campus-wide engagement metrics, membership analytics, and club performance audits.
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={exporting || stats.length === 0} className="gap-2 shrink-0">
          <Download className="size-4" />
          {exporting ? "Exporting..." : "Export CSV Audit Log"}
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border bg-card p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Supervised Clubs</span>
            <Building className="size-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{totalClubs}</div>
          <p className="text-xs text-muted-foreground">Active & registered campus organizations</p>
        </div>

        <div className="border border-border bg-card p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Members</span>
            <Users className="size-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">Verified student memberships across clubs</p>
        </div>

        <div className="border border-border bg-card p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
            <UserPlus className="size-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{totalPending}</div>
          <p className="text-xs text-muted-foreground">Awaiting coordinator review</p>
        </div>

        <div className="border border-border bg-card p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <Calendar className="size-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{totalEvents}</div>
          <p className="text-xs text-muted-foreground">Scheduled & published campus activities</p>
        </div>
      </div>

      {/* Analytics Summary & Progress */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="border border-border bg-card p-6 rounded-xl shadow-xs md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Club Membership Distribution
            </h3>
            <span className="text-xs text-muted-foreground">Real-time DB Counts</span>
          </div>

          <div className="space-y-4 pt-2">
            {stats.map((s) => {
              const maxVal = Math.max(...stats.map((item) => item.approvedCount), 1);
              const percentage = Math.round((s.approvedCount / maxVal) * 100);

              return (
                <div key={s.club.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground font-semibold">{s.club.name}</span>
                    <span className="text-muted-foreground">
                      {s.approvedCount} members ({s.eventsCount} events)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {stats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No clubs found under your faculty supervision.
              </p>
            )}
          </div>
        </div>

        {/* Membership Approval Health */}
        <div className="border border-border bg-card p-6 rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="size-4 text-emerald-500" /> Approval Rate Metrics
            </h3>
            <p className="text-xs text-muted-foreground">
              Ratio of approved membership requests versus processed applications.
            </p>

            <div className="py-4 text-center">
              <div className="text-4xl font-extrabold text-foreground">{approvalRate}%</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
                Approval Rate
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-500" /> Active Members
                </span>
                <span className="font-bold text-foreground">{totalMembers}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-amber-500" /> Pending Requests
                </span>
                <span className="font-bold text-foreground">{totalPending}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <XCircle className="size-3.5 text-destructive" /> Rejected Requests
                </span>
                <span className="font-bold text-foreground">
                  {stats.reduce((acc, s) => acc + s.rejectedCount, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Club Performance Table */}
      <div className="border border-border bg-card rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-primary" /> Managed Club Performance Audit
          </h3>
          <span className="text-xs text-muted-foreground">{stats.length} Supervised Clubs</span>
        </div>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Club Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Active Members</th>
              <th className="p-4">Pending Requests</th>
              <th className="p-4">Events Hosted</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.map(({ club, approvedCount, pendingCount, eventsCount }) => (
              <tr key={club.id} className="hover:bg-muted/10 transition-colors">
                <td className="p-4 font-semibold text-foreground">{club.name}</td>
                <td className="p-4 text-muted-foreground">{club.category}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 font-bold text-foreground">
                    <Users className="size-3.5 text-emerald-500" /> {approvedCount}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="size-3.5 text-amber-500" /> {pendingCount}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                    <Calendar className="size-3.5 text-indigo-500" /> {eventsCount}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
                      club.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {club.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stats.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No club performance records available.
          </div>
        )}
      </div>
    </div>
  );
}
