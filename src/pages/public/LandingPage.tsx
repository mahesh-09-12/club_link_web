import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Compass, Users, Calendar, ArrowRight, Shield, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingPage() {
  const featuredClubs = [
    {
      id: 1,
      name: "ACM Student Chapter",
      category: "Technical",
      description: "Advancing computing as a science & profession. Join for hackathons, workshops, and coding sessions.",
      membersCount: 142,
    },
    {
      id: 2,
      name: "Robotics & Automation Club",
      category: "Engineering",
      description: "Build bots, learn microcontrollers, and compete in national robotics competitions.",
      membersCount: 89,
    },
    {
      id: 3,
      name: "Creative Writing Society",
      category: "Arts & Culture",
      description: "A community for poets, novelists, and storytellers to share feedback and express creativity.",
      membersCount: 56,
    },
  ];

  const upcomingEvents = [
    {
      id: "e1",
      title: "Campus Hackathon 2026",
      club: "ACM Student Chapter",
      date: "Aug 15, 2026",
      time: "9:00 AM",
      location: "Main Auditorium",
    },
    {
      id: "e2",
      title: "Introduction to Arduino",
      club: "Robotics & Automation Club",
      date: "Aug 18, 2026",
      time: "2:00 PM",
      location: "Lab 4",
    },
    {
      id: "e3",
      title: "Poetry Slam & Coffee House",
      club: "Creative Writing Society",
      date: "Aug 22, 2026",
      time: "6:00 PM",
      location: "Student Center Lounge",
    },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-linear-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <Users className="size-3.5 text-primary fill-primary/10" />
            <span>Welcome to ClubLink</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-4xl leading-tight">
            Connecting Students with <span className="text-primary">Campus Clubs</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            Discover clubs, participate in events, and build meaningful campus connections.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "px-8 font-medium rounded-md cursor-pointer")}>
              Get Started
            </Link>
            <Link to="/clubs" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8 font-medium rounded-md cursor-pointer")}>
              Explore Clubs
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Clubs</h2>
            <p className="text-muted-foreground mt-2">Explore some of the active communities on campus.</p>
          </div>
          <Link to="/clubs" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-primary inline-flex items-center cursor-pointer")}>
            View all clubs <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredClubs.map((club) => (
            <div
              key={club.id}
              className="border border-border bg-card p-6 rounded-lg shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  {club.category}
                </span>
                <h3 className="text-lg font-semibold mt-4 text-foreground">{club.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {club.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>{club.membersCount} Members</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
            <p className="text-muted-foreground mt-2">Join activities and meet students with shared interests.</p>
          </div>
          <Link to="/events" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-primary inline-flex items-center cursor-pointer")}>
            View all events <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="border border-border bg-card rounded-lg shadow-xs flex flex-col justify-between"
            >
              <div className="p-6 flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{event.club}</span>
                <h3 className="text-lg font-semibold mt-2 text-foreground">{event.title}</h3>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground shrink-0" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="size-4 text-muted-foreground shrink-0" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How ClubLink Works */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">How ClubLink Works</h2>
            <p className="text-muted-foreground mt-2">Your gateway to getting involved on campus in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                <Compass className="size-6" />
              </div>
              <h3 className="text-lg font-semibold">1. Discover Clubs</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Browse a list of clubs, categorised by interests, or get custom recommendations tailored to your profile.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                <Users className="size-6" />
              </div>
              <h3 className="text-lg font-semibold">2. Join Clubs</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Connect with organizers, apply for memberships, and become an official club member seamlessly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                <Calendar className="size-6" />
              </div>
              <h3 className="text-lg font-semibold">3. Participate in Events</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Register for events, workshops, guest lectures, and hackathons hosted by clubs on campus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
