import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { ROUTES } from '../constants/routes';
import { LoginPage } from '../pages/auth/LoginPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { DashboardPage } from '../pages/user/DashboardPage';
import ScanPage from '../pages/user/ScanPage';
import WasteLogsPage from '../pages/user/WasteLogsPage';
import PickupStatusPage from '../pages/user/PickupStatusPage';
import ImpactPage from '../pages/user/ImpactPage';
import WalletPage from '../pages/user/WalletPage';
import ChatPage from '../pages/user/ChatPage';
import SettingsPage from '../pages/user/SettingsPage';
import ProcessPage from '../pages/user/ProcessPage';

// Placeholder Pages - for admin routes (to be built later)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
    <h1 className="text-2xl font-bold text-[var(--brand-primary)] glow-text">{title}</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.USER.DASHBOARD} replace />,
  },
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.AUTH.ONBOARDING,
    element: <OnboardingPage />,
  },
  {
    element: <ProtectedRoute allowedRoles={['user', 'agent', 'admin']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.USER.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.USER.SCAN,
            element: <ScanPage />,
          },
          {
            path: ROUTES.USER.WASTE_LOG,
            element: <WasteLogsPage />,
          },
          {
            path: ROUTES.USER.PICKUP,
            element: <PickupStatusPage />,
          },
          {
            path: ROUTES.USER.WALLET,
            element: <WalletPage />,
          },
          {
            path: ROUTES.USER.IMPACT,
            element: <ImpactPage />,
          },
          {
            path: ROUTES.USER.PROCESS,
            element: <ProcessPage />,
          },
          {
            path: ROUTES.USER.CHAT,
            element: <ChatPage />,
          },
          {
            path: ROUTES.USER.SETTINGS,
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.ADMIN.DASHBOARD,
            element: <PlaceholderPage title="Admin Dashboard" />,
          },
          {
            path: ROUTES.ADMIN.PICKUP_QUEUE,
            element: <PlaceholderPage title="Manage Pickups" />,
          },
          {
            path: ROUTES.ADMIN.USERS,
            element: <PlaceholderPage title="Manage Users" />,
          },
          {
            path: ROUTES.ADMIN.ANALYTICS,
            element: <PlaceholderPage title="Analytics" />,
          },
        ],
      },
    ],
  },
]);
