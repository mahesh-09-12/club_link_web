import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

// Public Pages
import { PublicLayout } from "@/pages/public/PublicLayout";
import { LandingPage } from "@/pages/public/LandingPage";
import { ClubsPage as PublicClubsPage } from "@/pages/public/ClubsPage";
import { ClubDetailPage } from "@/pages/public/ClubDetailPage";
import { EventsPage as PublicEventsPage } from "@/pages/public/EventsPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";

// Student Portal
import { StudentLayout } from "@/pages/student/StudentLayout";
import { StudentDashboardPage } from "@/pages/student/DashboardPage";
import { StudentClubsPage } from "@/pages/student/ClubsPage";
import { StudentEventsPage } from "@/pages/student/EventsPage";
import { StudentMyClubsPage } from "@/pages/student/MyClubsPage";
import { RecommendationsPage } from "@/pages/student/RecommendationsPage";
import { StudentProfilePage } from "@/pages/student/ProfilePage";

// Coordinator Portal
import { CoordinatorLayout } from "@/pages/coordinator/CoordinatorLayout";
import { CoordinatorDashboardPage } from "@/pages/coordinator/DashboardPage";
import { CoordinatorManageClubPage } from "@/pages/coordinator/ManageClubPage";
import { CoordinatorJoinRequestsPage } from "@/pages/coordinator/JoinRequestsPage";
import { CoordinatorMembersPage } from "@/pages/coordinator/MembersPage";
import { CoordinatorEventsPage } from "@/pages/coordinator/EventsPage";
import { CoordinatorAnnouncementsPage } from "@/pages/coordinator/AnnouncementsPage";

// Faculty Portal
import { FacultyLayout } from "@/pages/faculty/FacultyLayout";
import { FacultyDashboardPage } from "@/pages/faculty/DashboardPage";
import { FacultyJoinRequestsPage } from "@/pages/faculty/JoinRequestsPage";
import { FacultyClubsPage } from "@/pages/faculty/ClubsPage";
import { FacultyCoordinatorsPage } from "@/pages/faculty/CoordinatorsPage";
import { FacultyReportsPage } from "@/pages/faculty/ReportsPage";

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="clublink-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/clubs" element={<PublicClubsPage />} />
              <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
              <Route path="/events" element={<PublicEventsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Student Portal Routes */}
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/student/clubs" element={<StudentClubsPage />} />
              <Route path="/student/events" element={<StudentEventsPage />} />
              <Route path="/student/my-clubs" element={<StudentMyClubsPage />} />
              <Route path="/student/recommendations" element={<RecommendationsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
            </Route>

            {/* Coordinator Portal Routes */}
            <Route element={<CoordinatorLayout />}>
              <Route path="/coordinator/dashboard" element={<CoordinatorDashboardPage />} />
              <Route path="/coordinator/manage-club" element={<CoordinatorManageClubPage />} />
              <Route path="/coordinator/join-requests" element={<CoordinatorJoinRequestsPage />} />
              <Route path="/coordinator/members" element={<CoordinatorMembersPage />} />
              <Route path="/coordinator/events" element={<CoordinatorEventsPage />} />
              <Route path="/coordinator/announcements" element={<CoordinatorAnnouncementsPage />} />
            </Route>

            {/* Faculty Portal Routes */}
            <Route element={<FacultyLayout />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
              <Route path="/faculty/join-requests" element={<FacultyJoinRequestsPage />} />
              <Route path="/faculty/clubs" element={<FacultyClubsPage />} />
              <Route path="/faculty/coordinators" element={<FacultyCoordinatorsPage />} />
              <Route path="/faculty/reports" element={<FacultyReportsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
