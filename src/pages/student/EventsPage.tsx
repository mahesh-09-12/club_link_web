import { Calendar } from "lucide-react";

export function StudentEventsPage() {
  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campus Events</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with workshops, hackathons, and gatherings organized by clubs.
        </p>
      </div>

      <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
        <Calendar className="size-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground">No Campus Events Scheduled</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Campus events will appear here once clubs publish their schedules.
        </p>
      </div>
    </div>
  );
}
