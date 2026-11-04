"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  UserPlus,
  XCircle,
  LogIn,
} from "lucide-react";
import { clubService } from "@/services/clubService";
import { joinRequestService } from "@/services/joinRequestService";
import { getAuthToken } from "@/lib/api";
import { Club, JoinRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClubDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const clubIdParam = params?.clubId as string;

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  const [userRequest, setUserRequest] = useState<JoinRequest | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchClubDetails = useCallback(async () => {
    if (!clubIdParam) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await clubService.getClubById(clubIdParam);
      setClub(data);

      const token = getAuthToken();
      if (token) {
        setIsAuthenticated(true);
        try {
          const myRequests = await joinRequestService.getMyJoinRequests();
          const match = myRequests.find((req) => req.club_id === data.id);
          if (match) {
            setUserRequest(match);
          }
        } catch {
          // ignore
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch club details:", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        setNotFound(true);
      } else {
        setError("Failed to load club details.");
      }
    } finally {
      setLoading(false);
    }
  }, [clubIdParam]);

  useEffect(() => {
    fetchClubDetails();
  }, []);

  const handleJoinRequest = async () => {
    if (!club) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const newReq = await joinRequestService.createJoinRequest(club.id);
      setUserRequest(newReq);
      setActionSuccess("Join request submitted successfully!");
    } catch (err: unknown) {
      console.error("Error submitting join request:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
        setActionError(res?.data?.detail || "Failed to submit request.");
      } else {
        setActionError("Unable to connect to the server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-3 text-primary" />
        <p className="text-sm">Loading club details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 text-center max-w-lg">
        <div className="border border-dashed border-border p-8 rounded-lg bg-card">
          <AlertCircle className="size-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold tracking-tight">Club Not Found</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            We couldn&apos;t find any club matching ID &quot;{clubIdParam}&quot;.
          </p>
          <Button onClick={() => navigate("/clubs")} className="mt-6 gap-2">
            <ArrowLeft className="size-4" /> Back to Clubs
          </Button>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 text-center max-w-lg">
        <div className="border border-destructive/20 bg-destructive/5 p-8 rounded-lg">
          <AlertCircle className="size-10 text-destructive mx-auto mb-3" />
          <h2 className="text-xl font-bold tracking-tight">Unable to Load Details</h2>
          <p className="text-muted-foreground mt-2 text-sm">{error || "An unexpected error occurred."}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/clubs")}>
              Back to Clubs
            </Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(club.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 max-w-4xl font-sans">
      <Link
        to="/clubs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> Back to All Clubs
      </Link>

      <div className="border border-border bg-card p-6 md:p-8 rounded-xl shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {club.category}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize",
                  club.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}
              >
                <span className={`size-1.5 rounded-full ${club.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {club.status}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-foreground">{club.name}</h1>
            {club.tagline && <p className="text-sm font-medium text-muted-foreground mt-1">{club.tagline}</p>}
          </div>

          <div className="shrink-0">
            {userRequest ? (
              <div className="flex flex-col items-start md:items-end gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Application</span>
                {userRequest.status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Clock className="size-4" /> Request Pending Approval
                  </span>
                )}
                {userRequest.status === "approved" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle className="size-4" /> Membership Approved
                  </span>
                )}
                {userRequest.status === "rejected" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                    <XCircle className="size-4" /> Request Rejected
                  </span>
                )}
              </div>
            ) : (
              <Button
                onClick={handleJoinRequest}
                disabled={submitting}
                className="gap-2 font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Submitting...
                  </>
                ) : isAuthenticated ? (
                  <>
                    <UserPlus className="size-4" /> Request to Join Club
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" /> Sign In to Join
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {actionError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight">About the Club</h3>
          <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{club.description}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20">
            <Shield className="size-5 text-primary shrink-0" />
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Faculty Advisor</span>
              <span className="text-sm font-semibold text-foreground">Faculty ID #{club.faculty_coordinator_id}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20">
            <Calendar className="size-5 text-primary shrink-0" />
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Established On</span>
              <span className="text-sm font-semibold text-foreground">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
