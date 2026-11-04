import { Link } from "react-router-dom";
import { Club } from "@/types";
import { Users, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClubCardProps {
  club: Club;
  detailsHref?: string;
  showJoinButton?: boolean;
}

export function ClubCard({ club, detailsHref = `/clubs/${club.id}`, showJoinButton = false }: ClubCardProps) {
  return (
    <div className="border border-border bg-card rounded-lg shadow-xs flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {club.category}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
              club.status === "active"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            )}
          >
            {club.status}
          </span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{club.name}</h3>
        {club.tagline && <p className="text-xs font-medium text-muted-foreground mb-2">{club.tagline}</p>}
        <p className="text-sm text-muted-foreground line-clamp-3">{club.description}</p>
      </div>

      <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          <span>{club.membersCount ?? 0} Members</span>
        </div>
        <Link
          to={detailsHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 text-xs")}
        >
          View Details <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
