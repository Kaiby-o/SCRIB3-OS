import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// OS layer imports
import OSLanding from './scrib3-os/pages/LandingPage';
import OSDashboard from './scrib3-os/pages/DashboardPage';
import OSProfile from './scrib3-os/pages/ProfilePage';
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
