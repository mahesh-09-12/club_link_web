"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, UserPlus, Loader2, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { clubService } from "@/services/clubService";
import { joinRequestService } from "@/services/joinRequestService";
import { Club, JoinRequest } from "@/types";

export function CoordinatorDashboardPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    clubService
      .getClubs()
      .then(async (clubsData) => {
        setClubs(clubsData);
        if (clubsData.length > 0) {
          try {
            const reqs = await joinRequestService.getClubJoinRequests(clubsData[0].id);
            setRequests(reqs);
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coordinator Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user?.full_name ? `, ${user.full_name}` : ""}! Overview of your club management panel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="border border-border bg-card p-6 rounded-lg shadow-xs flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Users className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campus Clubs</span>
            <div className="text-2xl font-bold mt-0.5">{loading ? "..." : clubs.length}</div>
            <span className="text-xs text-muted-foreground">Active in system</span>
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-lg shadow-xs flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <UserPlus className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Join Requests</span>
            <div className="text-2xl font-bold mt-0.5">{loading ? "..." : pendingRequests.length}</div>
            <span className="text-xs text-muted-foreground">Requires coordinator review</span>
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-lg shadow-xs flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <FileText className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Club Requests</span>
            <div className="text-2xl font-bold mt-0.5">{loading ? "..." : requests.length}</div>
            <span className="text-xs text-muted-foreground">Processed & pending</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card rounded-lg p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold tracking-tight">Pending Join Requests</h2>
            <Link to="/coordinator/join-requests" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs text-primary font-medium")}>
              Manage all
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <Loader2 className="size-5 animate-spin mr-2" /> Loading requests...
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 border border-border rounded-md bg-muted/10">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Join Request #{req.id}</h4>
                    <p className="text-xs text-muted-foreground">Student ID #{req.student_id} • Club ID #{req.club_id}</p>
                  </div>
                  <Link to="/coordinator/join-requests" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1")}>
                    Review <ArrowRight className="size-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-md">
              No pending join requests requiring attention.
            </p>
          )}
        </div>

        <div className="border border-border bg-card rounded-lg p-6 shadow-xs">
          <h2 className="text-lg font-bold tracking-tight mb-2">Club Events & Activities</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your club workshops and community gatherings.
          </p>
          <Link to="/coordinator/events" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-semibold")}>
            Manage Events
          </Link>
        </div>
      </div>
    </div>
  );
}
