import { Calendar } from "lucide-react";

export function EventsPage() {
  return (
    <section className="container mx-auto px-4 md:px-6 py-20 font-sans">
      <h1 className="text-3xl font-bold tracking-tight">Campus Events</h1>
      <p className="mt-4 text-muted-foreground">Browse upcoming events and register to participate.</p>

      <div className="mt-8 text-center py-16 border border-dashed border-border rounded-lg bg-card">
        <Calendar className="size-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground">Upcoming Workshops & Activities</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Explore exciting campus hackathons, technical tutorials, and club meetings.
        </p>
      </div>
    </section>
  );
}
