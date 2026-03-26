import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// OS layer imports
import OSLanding from './scrib3-os/pages/LandingPage';
import OSDashboard from './scrib3-os/pages/DashboardPage';
import OSProfile from './scrib3-os/pages/ProfilePage';
import OSClientList from './scrib3-os/pages/ClientListPage';
import OSClientOnboard from './scrib3-os/pages/ClientOnboardPage';
import OSFinanceOverview from './scrib3-os/pages/FinanceOverviewPage';
import OSFinanceDetail from './scrib3-os/pages/FinanceDetailPage';
import { AuthGuard, RoleGuard } from './scrib3-os/components/AuthGuard';
// DEVICE layer imports
import DeviceDashboard from './scrib3-device/pages/DashboardPage';
import AvatarCreatorPage from './scrib3-device/pages/AvatarCreatorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== SCRIB3-OS routes ===== */}
        <Route path="/" element={<OSLanding />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <OSDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <AuthGuard>
              <OSProfile />
            </AuthGuard>
          }
        />
        <Route
          path="/clients"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSClientList />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/clients/onboard"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSClientOnboard />
              </RoleGuard>
            </AuthGuard>
          }
        />

        <Route
          path="/finance"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'csuite']}>
                <OSFinanceOverview />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/finance/:slug"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'csuite']}>
                <OSFinanceDetail />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* ===== SCRIB3-DEVICE routes (admin only) ===== */}
        <Route
          path="/device"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin']}>
                <DeviceDashboard />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/device/avatar-creator"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin']}>
                <AvatarCreatorPage />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
