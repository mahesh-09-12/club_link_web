"use client";

import { useEffect, useState, useMemo } from "react";
import { Sparkles, Search, Loader2, Compass, Check, Tag } from "lucide-react";
import { clubService } from "@/services/clubService";
import { ClubCard } from "@/components/common/ClubCard";
import { Club } from "@/types";
import { Button } from "@/components/ui/button";

const POPULAR_INTERESTS = [
  { id: "tech", label: "Technical & Coding", keywords: ["technical", "computing", "coding", "software", "hackathon"] },
  { id: "eng", label: "Engineering & Robotics", keywords: ["engineering", "robotics", "drones", "hardware", "microcontroller"] },
  { id: "arts", label: "Arts & Culture", keywords: ["arts", "culture", "design", "creative", "writing", "poetry", "literature"] },
  { id: "business", label: "Business & Leadership", keywords: ["business", "management", "entrepreneurship", "finance", "leadership"] },
  { id: "sports", label: "Sports & Fitness", keywords: ["sports", "fitness", "athletics", "gaming", "esports"] },
  { id: "social", label: "Social Good & Community", keywords: ["social", "community", "volunteering", "outreach", "environment"] },
];

export function RecommendationsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customSearch, setCustomSearch] = useState<string>("");

  useEffect(() => {
    async function loadClubs() {
      setLoading(true);
      try {
        const data = await clubService.getClubs();
        setClubs(data);
      } catch (err) {
        console.error("Failed to load clubs for recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClubs();
  }, []);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId]
    );
  };

  // Filter recommended clubs based on selected interests and custom search
  const recommendedClubs = useMemo(() => {
    if (selectedInterests.length === 0 && !customSearch.trim()) {
      return [];
    }

    const activeKeywords: string[] = [];

    selectedInterests.forEach((interestId) => {
      const match = POPULAR_INTERESTS.find((item) => item.id === interestId);
      if (match) {
        activeKeywords.push(...match.keywords);
      }
    });

    if (customSearch.trim()) {
      activeKeywords.push(...customSearch.toLowerCase().trim().split(/\s+/));
    }

    return clubs.filter((club) => {
      const name = club.name.toLowerCase();
      const cat = club.category.toLowerCase();
      const desc = club.description.toLowerCase();
      const tag = (club.tagline || "").toLowerCase();

      return activeKeywords.some(
        (kw) => name.includes(kw) || cat.includes(kw) || desc.includes(kw) || tag.includes(kw)
      );
    });
  }, [clubs, selectedInterests, customSearch]);

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
          <Sparkles className="size-6 fill-primary/10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interest-Based Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Tell us what topics or activities you are interested in, and we will find the right campus clubs for you.
          </p>
        </div>
      </div>

      {/* Interest Selector Card */}
      <div className="border border-border bg-card p-6 rounded-xl shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Tag className="size-4 text-primary" /> Select Your Interests & Hobbies
          </h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {isSelected && <Check className="size-3.5" />}
                  {interest.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Interest Search */}
        <div className="pt-4 border-t border-border">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Or Type Specific Keywords (e.g. hackathons, microcontrollers, poetry)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by topic, skill, or activity..."
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Recommended Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Recommended Clubs</h2>
          {selectedInterests.length > 0 || customSearch.trim() ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {recommendedClubs.length} Matches Found
            </span>
          ) : null}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Finding matching clubs...
          </div>
        )}

        {!loading && selectedInterests.length === 0 && !customSearch.trim() && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card p-8">
            <Compass className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Select your interests above</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              Click on any interest tags or type custom keywords in the search bar above to generate personalized club recommendations.
            </p>
          </div>
        )}

        {!loading && (selectedInterests.length > 0 || customSearch.trim()) && recommendedClubs.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card p-8">
            <Compass className="size-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">No matching clubs found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              We couldn&apos;t find any clubs matching your exact selections. Try selecting broader interest categories or clear your search keywords.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedInterests([]);
                setCustomSearch("");
              }}
              className="mt-4"
            >
              Clear Selections
            </Button>
          </div>
        )}

        {!loading && recommendedClubs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
