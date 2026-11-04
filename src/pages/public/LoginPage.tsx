"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, User, Users, Check, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("student@campus.edu");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickDemoLogin = (demoRole: UserRole) => {
    if (demoRole === "student") {
      setEmail("student@campus.edu");
    } else if (demoRole === "club_coordinator") {
      setEmail("coordinator@campus.edu");
    } else {
      setEmail("faculty@campus.edu");
    }
    setRole(demoRole);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const user = await login({ email, password });
      const userRole = user.role.toLowerCase();
      if (userRole === "student") {
        navigate("/student/dashboard");
      } else if (userRole === "club_coordinator" || userRole === "coordinator") {
        navigate("/coordinator/dashboard");
      } else if (userRole === "faculty_coordinator" || userRole === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError("Login failed. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-12rem)] font-sans">
      <div className="w-full max-w-md border border-border bg-card p-8 rounded-lg shadow-xs">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your ClubLink portal
          </p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="mb-6 p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-2">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Quick Demo Login:</span>
          <div className="grid grid-cols-3 gap-1.5">
            <Button type="button" variant="outline" size="xs" onClick={() => handleQuickDemoLogin("student")}>
              Student
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => handleQuickDemoLogin("club_coordinator")}>
              Coordinator
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => handleQuickDemoLogin("faculty_coordinator")}>
              Faculty
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex flex-col items-center justify-center p-3 border rounded-md transition-all text-center relative cursor-pointer ${
              role === "student"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <User className="size-5 mb-1" />
            <span className="text-[10px] font-semibold">Student</span>
            {role === "student" && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="size-2" />
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setRole("club_coordinator")}
            className={`flex flex-col items-center justify-center p-3 border rounded-md transition-all text-center relative cursor-pointer ${
              role === "club_coordinator"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <Users className="size-5 mb-1" />
            <span className="text-[10px] font-semibold">Coordinator</span>
            {role === "club_coordinator" && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="size-2" />
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setRole("faculty_coordinator")}
            className={`flex flex-col items-center justify-center p-3 border rounded-md transition-all text-center relative cursor-pointer ${
              role === "faculty_coordinator"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <Shield className="size-5 mb-1" />
            <span className="text-[10px] font-semibold">Faculty</span>
            {role === "faculty_coordinator" && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="size-2" />
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-border bg-background rounded-md outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-border bg-background rounded-md outline-none focus:border-primary transition-colors"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full mt-2 font-medium">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
