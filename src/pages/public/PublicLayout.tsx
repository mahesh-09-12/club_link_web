import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function PublicLayout() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "student") return "/student/dashboard";
    if (user.role === "club_coordinator") return "/coordinator/dashboard";
    if (user.role === "faculty_coordinator") return "/faculty/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2 font-bold text-lg text-primary tracking-tight cursor-pointer hover:text-primary/80 transition-colors duration-200">
              <span>ClubLink</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
              <Link to="/" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Home</Link>
              <Link to="/clubs" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Clubs</Link>
              <Link to="/events" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Events</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-md cursor-pointer")}>
                Dashboard ({user?.role?.replace("_", " ")})
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground cursor-pointer transition-colors duration-200 hover:text-foreground">
                  Login
                </Link>
                <Link to="/register" className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-md cursor-pointer transition duration-200")}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/40 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link to="/" className="font-bold text-primary tracking-tight cursor-pointer hover:text-primary/80 transition-colors duration-200">ClubLink</Link>
            <p className="text-xs text-muted-foreground">
              Connecting Students with Campus Clubs. Discover, join, and build connections.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link to="/" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Home</Link>
            <Link to="/clubs" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Clubs</Link>
            <Link to="/events" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Events</Link>
            <Link to="/login" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Login</Link>
            <Link to="/register" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Get Started</Link>
            <Link to="/about" className="cursor-pointer transition-colors duration-200 hover:text-foreground">About</Link>
            <Link to="/contact" className="cursor-pointer transition-colors duration-200 hover:text-foreground">Contact</Link>
          </div>
          <p className="text-xs text-muted-foreground md:order-last">
            &copy; {new Date().getFullYear()} ClubLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
