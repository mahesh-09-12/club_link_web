import { useEffect, useState, useMemo, useCallback } from "react";
import { Compass, Search, Loader2, AlertCircle, RefreshCw, Plus, X } from "lucide-react";
import { ClubCard } from "@/components/common/ClubCard";
import { clubService } from "@/services/clubService";
import { Club } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category) return;
    setIsSubmitting(true);
    try {
      await clubService.createClub({ name, description, category, faculty_coordinator_id: user!.id });
      setIsModalOpen(false);
      setName("");
      setDescription("");
      setCategory("");
      fetchClubs();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create club");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clubService.getClubs();
      setClubs(data);
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
      setError("Unable to load clubs right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    clubs.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set)];
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(search.toLowerCase()) ||
        club.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        club.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [clubs, search, selectedCategory]);

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Campus Clubs</h1>
          <p className="mt-2 text-muted-foreground">
            Discover student organizations, technical groups, and creative communities on campus.
          </p>
        </div>
        {user?.role === 'faculty_coordinator' && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Create New Club
          </Button>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card p-6 rounded-lg w-full max-w-md shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Club</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X className="size-5" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Club Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={4} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Club"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clubs by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border bg-card rounded-md text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border bg-card rounded-md text-sm outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-8 animate-spin mb-3 text-primary" />
          <p className="text-sm">Loading clubs...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-destructive/20 bg-destructive/5 rounded-lg text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
          <Button onClick={fetchClubs} variant="outline" className="mt-4 gap-2">
            <RefreshCw className="size-4" /> Try Again
          </Button>
        </div>
      )}

      {!loading && !error && filteredClubs.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}

      {!loading && !error && filteredClubs.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
          <Compass className="size-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No clubs found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No clubs match your current search and category filters.
          </p>
        </div>
      )}
    </section>
  );
}
