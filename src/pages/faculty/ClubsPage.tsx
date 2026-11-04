"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, Plus, Trash, Edit, X } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { clubService } from "@/services/clubService";
import { Club } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function FacultyClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await clubService.getMyClubs();
      setClubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setName("");
    setDescription("");
    setTagline("");
    setCategory("");
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (club: Club) => {
    setEditingClub(club);
    setName(club.name);
    setDescription(club.description);
    setTagline(club.tagline || "");
    setCategory(club.category);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category) return;
    setIsSubmitting(true);
    try {
      await clubService.createClub({ name, description, tagline, category, faculty_coordinator_id: user!.id });
      setIsCreateModalOpen(false);
      setName("");
      setDescription("");
      setTagline("");
      setCategory("");
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create club");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub || !name || !description || !category) return;
    setIsSubmitting(true);
    try {
      await clubService.updateClub(editingClub.id, { name, description, tagline, category });
      setEditingClub(null);
      setName("");
      setDescription("");
      setTagline("");
      setCategory("");
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update club profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this club?")) {
      try {
        await clubService.deleteClub(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete club.");
      }
    }
  };

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.category.toLowerCase().includes(search.toLowerCase())
  );

  const isFaculty = user?.role === "faculty_coordinator";

  return (
    <div className="space-y-8 font-sans">
      {/* Create Club Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card p-6 rounded-lg w-full max-w-md shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Club</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Club Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  required
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                  placeholder="e.g. Building the future of robotics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Club"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card p-6 rounded-lg w-full max-w-md shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Club Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingClub(null)}>
                <X className="size-5" />
              </Button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Club Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  required
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-primary"
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Profile Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Clubs Directory</h1>
          <p className="text-muted-foreground mt-1">
            Directory of active and registered campus clubs under your supervision.
          </p>
        </div>
        {isFaculty && (
          <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
            <Plus className="size-4" /> Create New Club
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clubs by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border bg-card rounded-md text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Loading campus clubs...
        </div>
      )}

      {!loading && (
        <div className="border border-border bg-card rounded-lg shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Club ID</th>
                <th className="p-4">Club Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Faculty Advisor ID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClubs.map((club) => (
                <tr key={club.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-mono text-xs text-muted-foreground">#{club.id}</td>
                  <td className="p-4 font-semibold text-foreground">{club.name}</td>
                  <td className="p-4 text-muted-foreground">{club.category}</td>
                  <td className="p-4 text-muted-foreground">#{club.faculty_coordinator_id}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
                        club.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {club.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link to={`/clubs/${club.id}`} className={buttonVariants({ variant: "outline", size: "xs" })}>
                      View
                    </Link>
                    {isFaculty && club.faculty_coordinator_id === user.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleOpenEdit(club)}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => handleDelete(club.id)}
                        >
                          <Trash className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClubs.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No clubs found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
