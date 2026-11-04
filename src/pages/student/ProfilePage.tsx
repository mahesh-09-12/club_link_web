"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function StudentProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setName(user.full_name);
    }
  }, [user?.full_name]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Details</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your account information.
        </p>
      </div>

      <div className="border border-border bg-card p-6 rounded-lg shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-md text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-9 pr-4 py-2 border border-border bg-muted/40 rounded-md text-sm text-muted-foreground outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Account Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={user?.role || "Student"}
                  disabled
                  className="w-full pl-9 pr-4 py-2 border border-border bg-muted/40 rounded-md text-sm text-muted-foreground outline-none cursor-not-allowed capitalize"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            {saved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="size-4" /> Profile updated!
              </span>
            ) : (
              <span />
            )}
            <Button type="submit" className="gap-1.5 font-medium">
              <Save className="size-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
