"use client";

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Calendar, 
  Megaphone,
  UserPlus,
  LogOut, 
  Menu, 
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function CoordinatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/coordinator/dashboard", icon: LayoutDashboard },
    { name: "Club Profile", href: "/coordinator/manage-club", icon: Settings },
    { name: "Join Requests", href: "/coordinator/join-requests", icon: UserPlus },
    { name: "Club Members", href: "/coordinator/members", icon: Users },
    { name: "Club Events", href: "/coordinator/events", icon: Calendar },
    { name: "Announcements", href: "/coordinator/announcements", icon: Megaphone },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-6 border-b border-border justify-between">
            <Link to="/" className="flex items-center space-x-2 font-bold text-lg text-primary tracking-tight cursor-pointer">
              <span>ClubLink</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">Coord</span>
            </Link>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4 px-4 justify-between">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`mr-3 size-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border">
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              >
                <LogOut className="mr-3 size-4 shrink-0 text-muted-foreground group-hover:text-destructive" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col md:pl-64 flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b border-border bg-card md:hidden">
          <Link to="/" className="flex items-center space-x-2 font-bold text-lg text-primary tracking-tight">
            <span>ClubLink</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">Coord</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-full max-w-xs bg-card border-r border-border p-4 h-full">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <Link to="/" className="flex items-center space-x-2 font-bold text-lg text-primary tracking-tight">
                  <span>ClubLink</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="mr-3 size-4 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-border mt-auto">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                >
                  <LogOut className="mr-3 size-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
