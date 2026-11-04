"use client";

import { useState, useEffect, useCallback } from "react";
import { Megaphone, Plus, Clock, Trash, Loader2, AlertCircle, CheckCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { announcementService } from "@/services/announcementService";
import { clubService } from "@/services/clubService";
import { AnnouncementItem, Club } from "@/types";

export function CoordinatorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [assignedClub, setAssignedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [myClubs, allAnnouncements] = await Promise.all([
        clubService.getMyClubs().catch(() => []),
        announcementService.getAnnouncements().catch(() => []),
      ]);

      const currentClub = myClubs.length > 0 ? myClubs[0] : null;
      setAssignedClub(currentClub);

      if (currentClub) {
        setAnnouncements(allAnnouncements.filter((a) => a.club_id === currentClub.id));
      } else {
        setAnnouncements(allAnnouncements);
      }
    } catch (err: any) {
      console.error("Failed to load announcements data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (!assignedClub) {
      setErrorMsg("No club assigned to your account yet. Contact a Faculty Advisor to assign a club first.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await announcementService.postAnnouncement({
        club_id: assignedClub.id,
        title: title.trim(),
        content: content.trim(),
      });

      setSuccessMsg("Announcement published successfully!");
      setTitle("");
      setContent("");
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Post announcement error:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to publish announcement";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this announcement?")) {
      try {
        await announcementService.deleteAnnouncement(id);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to delete announcement");
      }
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Broadcast news, alerts, or meetings directly to all club members.
          </p>
        </div>
        {assignedClub && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Building className="size-3.5" />
            Managing: {assignedClub.name}
          </span>
        )}
      </div>

      {!loading && !assignedClub && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>You are not currently assigned as a coordinator for any club. Contact a Faculty Advisor to assign your account before publishing broadcasts.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle className="size-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Container */}
        <div className="border border-border bg-card p-6 rounded-xl shadow-xs h-fit">
          <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-1.5">
            <Plus className="size-4.5 text-primary" /> Post Announcement
          </h3>
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Lab Sync Postponed"
                disabled={submitting || !assignedClub}
                className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                placeholder="Write announcement details..."
                disabled={submitting || !assignedClub}
                className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs outline-none focus:border-primary transition-colors resize-none disabled:opacity-50"
              />
            </div>
            <Button type="submit" size="sm" disabled={submitting || !assignedClub} className="w-full mt-2 font-medium">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Publishing...
                </>
              ) : (
                "Publish Broadcast"
              )}
            </Button>
          </form>
        </div>

        {/* Active Broadcasts Container */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Active Broadcasts</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="border border-border bg-card p-6 rounded-xl shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-base font-bold text-foreground">{ann.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ann.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8 shrink-0"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">{ann.content}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> Published {new Date(ann.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card p-6">
                  <Megaphone className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No announcements broadcasted yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the form to post updates for your club members.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
