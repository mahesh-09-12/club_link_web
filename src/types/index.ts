export type UserRole = "student" | "club_coordinator" | "faculty_coordinator";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  token?: string;
}

export interface Club {
  id: number;
  name: string;
  category: string;
  description: string;
  faculty_coordinator_id: number;
  status: "active" | "pending" | "inactive";
  created_at: string;
  tagline?: string;
  membersCount?: number;
}

export interface JoinRequest {
  id: number;
  student_id: number;
  club_id: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface EventItem {
  id: string;
  club_id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  RSVPCount: number;
  description?: string;
}

export interface AnnouncementItem {
  id: number;
  club_id: number;
  title: string;
  content: string;
  created_at: string;
}
