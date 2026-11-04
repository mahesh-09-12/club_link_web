"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Clock, MapPin, Trash, Loader2, AlertCircle, CheckCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventItem, Club } from "@/types";
import { eventService } from "@/services/eventService";
import { clubService } from "@/services/clubService";

export function CoordinatorEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [assignedClub, setAssignedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [myClubs, allEvents] = await Promise.all([
        clubService.getMyClubs().catch(() => []),
        eventService.getEvents().catch(() => []),
      ]);

      const currentClub = myClubs.length > 0 ? myClubs[0] : null;
      setAssignedClub(currentClub);

      if (currentClub) {
        setEvents(allEvents.filter((e) => e.club_id === currentClub.id));
      } else {
        setEvents(allEvents);
      }
    } catch (err: any) {
      console.error("Failed to load events data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (!assignedClub) {
      setErrorMsg("No club assigned to your account yet. Contact a Faculty Advisor to assign a club first.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await eventService.createEvent({
        club_id: assignedClub.id,
        title: title.trim(),
        date,
        time: time.trim() || "12:00 PM",
        location: location.trim() || "TBD",
        description: "",
      });

      setSuccessMsg("Event scheduled successfully!");
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Create event error:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to create event";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm("Delete this event?")) {
      try {
        await eventService.deleteEvent(id);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to delete event");
      }
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
          <p className="text-muted-foreground mt-1">
            Create workshops, schedule activities, and view attendee registrations.
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
          <span>You are not currently assigned as a coordinator for any club. Contact a Faculty Advisor to assign your account before scheduling events.</span>
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
        {/* Schedule Form Container */}
        <div className="border border-border bg-card p-6 rounded-xl shadow-xs h-fit">
          <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-1.5">
            <Plus className="size-4.5 text-primary" /> Schedule Event
          </h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Robotics Design Sprint"
                disabled={submitting || !assignedClub}
                className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={submitting || !assignedClub}
                className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 2:00 PM"
                disabled={submitting || !assignedClub}
                className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lab 4"
                disabled={submitting || !assignedClub}
                className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <Button type="submit" size="sm" disabled={submitting || !assignedClub} className="w-full mt-2 font-medium">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Scheduling...
                </>
              ) : (
                "Schedule Event"
              )}
            </Button>
          </form>
        </div>

        {/* Scheduled Events Container */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Scheduled Events</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-border bg-card p-6 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-foreground">{event.title}</h4>
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {event.date}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3.5" /> {event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase">RSVPs</span>
                      <span className="text-sm font-semibold text-foreground">{event.RSVPCount ?? 0} Registered</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 size-8 shrink-0"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card p-6">
                  <Calendar className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No events scheduled yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Create an event using the form on the left.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
