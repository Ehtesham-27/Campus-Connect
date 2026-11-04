import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { StudentLayout } from '../components/layout/StudentLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminGuard } from '../features/admin/AdminGuard';
import { StudentDashboardPage } from '../features/dashboard/StudentDashboardPage';
import { DiscoverPage } from '../features/discover/DiscoverPage';
import { CommunitiesPage } from '../features/communities/CommunitiesPage';
import { FeedPage } from '../features/feed/FeedPage';
import { OpportunitiesPage } from '../features/opportunities/OpportunitiesPage';
import { TeamFinderPage } from '../features/team-finder/TeamFinderPage';
import { StudyCirclesPage } from '../features/study-circles/StudyCirclesPage';
import { ConnectionsPage } from '../features/connections/ConnectionsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { SettingsPage } from '../features/profile/SettingsPage';
import { AdminOverviewPage } from '../features/admin/AdminOverviewPage';
import { AdminStudentsPage } from '../features/admin/AdminStudentsPage';
import { AdminCommunitiesPage } from '../features/admin/AdminCommunitiesPage';
import { AdminFeedPage } from '../features/admin/AdminFeedPage';
import { AdminOpportunitiesPage } from '../features/admin/AdminOpportunitiesPage';
import { AdminReportsPage } from '../features/admin/AdminReportsPage';
import { NotFoundPage } from '../features/NotFoundPage';

export const router = createBrowserRouter([
  // Root Redirect
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },

  // Public Auth Routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Student Application Routes
  {
    path: '/app',
    element: <StudentLayout />,
    children: [
      {
        index: true,
        element: <StudentDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <StudentDashboardPage />,
      },
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'communities',
        element: <CommunitiesPage />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'opportunities',
        element: <OpportunitiesPage />,
      },
      {
        path: 'team-finder',
        element: <TeamFinderPage />,
      },
      {
        path: 'study-circles',
        element: <StudyCirclesPage />,
      },
      {
        path: 'connections',
        element: <ConnectionsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Admin Application Routes (Protected by AdminGuard)
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <AdminOverviewPage />,
      },
      {
        path: 'students',
        element: <AdminStudentsPage />,
      },
      {
        path: 'communities',
        element: <AdminCommunitiesPage />,
      },
      {
        path: 'feed',
        element: <AdminFeedPage />,
      },
      {
        path: 'opportunities',
        element: <AdminOpportunitiesPage />,
      },
      {
        path: 'reports',
        element: <AdminReportsPage />,
      },
    ],
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
