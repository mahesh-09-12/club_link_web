"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Building, Calendar, Info, ShieldCheck } from "lucide-react";
import { clubService } from "@/services/clubService";
import { Club } from "@/types";

export function CoordinatorManageClubPage() {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    clubService
      .getMyClubs()
      .then((data) => {
        if (data && data.length > 0) {
          setClub(data[0]);
        } else {
          setClub(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load assigned club details:", err);
        setError("Failed to load assigned club profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground font-sans">
        <Loader2 className="size-8 animate-spin mb-3 text-primary" />
        <p className="text-sm">Loading club profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl font-sans">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-sm">
          <ShieldAlert className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="space-y-8 max-w-2xl font-sans">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Club Profile</h1>
          <p className="text-muted-foreground mt-1">
            Official details for your assigned campus club.
          </p>
        </div>

        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card p-8">
          <Building className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">No club assigned yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
            You are not currently assigned as a coordinator for any campus club. Please contact a Faculty Coordinator to assign your account to a club.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Club Profile</h1>
          <p className="text-muted-foreground mt-1">
            Official details for your assigned campus club (Read-Only).
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border shrink-0 self-start sm:self-center">
          <ShieldCheck className="size-3.5 text-primary" />
          Read-Only View
        </span>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/15 rounded-lg text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground block mb-0.5">Profile Management Notice</span>
          Club creation, profile updates, and coordinator assignments are managed by Faculty Coordinators.
        </div>
      </div>

      <div className="border border-border bg-card p-6 md:p-8 rounded-xl shadow-xs space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Club Name
            </label>
            <input
              type="text"
              value={club.name}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-border bg-muted/30 rounded-md text-sm font-semibold text-foreground outline-none cursor-not-allowed"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={club.category}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-border bg-muted/30 rounded-md text-sm font-medium text-foreground outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Status
              </label>
              <div className="px-3 py-2 border border-border bg-muted/30 rounded-md text-sm flex items-center gap-2 cursor-not-allowed">
                <span className={`size-2 rounded-full ${club.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="font-semibold capitalize text-foreground">{club.status}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Short Tagline
            </label>
            <input
              type="text"
              value={club.tagline || "No tagline set."}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-border bg-muted/30 rounded-md text-sm text-foreground outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Detailed Description
            </label>
            <textarea
              value={club.description}
              readOnly
              disabled
              rows={5}
              className="w-full px-3 py-2 border border-border bg-muted/30 rounded-md text-sm text-foreground leading-relaxed outline-none cursor-not-allowed resize-none"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-muted/20">
            <Building className="size-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Club ID</span>
              <span className="text-xs font-mono font-bold text-foreground">#{club.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-muted/20">
            <Calendar className="size-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Created On</span>
              <span className="text-xs font-bold text-foreground">
                {new Date(club.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
