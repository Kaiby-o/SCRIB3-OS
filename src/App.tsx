import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// OS layer imports
import OSLanding from './scrib3-os/pages/LandingPage';
import OSDashboard from './scrib3-os/pages/DashboardPage';
import OSProfile from './scrib3-os/pages/ProfilePage';
import OSClientList from './scrib3-os/pages/ClientListPage';
import OSClientOnboard from './scrib3-os/pages/ClientOnboardPage';
import OSFinanceOverview from './scrib3-os/pages/FinanceOverviewPage';
import OSFinanceDetail from './scrib3-os/pages/FinanceDetailPage';
import OSVendorManagement from './scrib3-os/pages/VendorManagementPage';
import OSVendorOnboard from './scrib3-os/pages/VendorOnboardPage';
import OSPreAlignment from './scrib3-os/pages/PreAlignmentPage';
import OSBandwidth from './scrib3-os/pages/BandwidthPage';
import OSScopeWatch from './scrib3-os/pages/ScopeWatchPage';
import OSTeamDirectory from './scrib3-os/pages/TeamDirectoryPage';
import OSTeamProfile from './scrib3-os/pages/TeamProfilePage';
import OSProfDev from './scrib3-os/pages/ProfDevPage';
import OSClientHub from './scrib3-os/pages/ClientHubPage';
import OSClientPortal from './scrib3-os/pages/ClientPortalPage';
import OSWhatGoodLooksLike from './scrib3-os/pages/WhatGoodLooksLikePage';
import OSProjectRegistry from './scrib3-os/pages/ProjectRegistryPage';
import OSUnitDashboards from './scrib3-os/pages/UnitDashboardsPage';
import OSCultureHub from './scrib3-os/pages/CultureHubPage';
import OSToolsDirectory from './scrib3-os/pages/ToolsDirectoryPage';
import OSSettings from './scrib3-os/pages/SettingsPage';
import OSTasks from './scrib3-os/pages/TasksPage';
import OSApprovals from './scrib3-os/pages/ApprovalsPage';
import OSProjectDetail from './scrib3-os/pages/ProjectDetailPage';
import OSShoutouts from './scrib3-os/pages/ShoutoutsPage';
import OSFeedback from './scrib3-os/pages/FeedbackPage';
import OSSystemsMap from './scrib3-os/pages/SystemsMapPage';
import { AuthGuard, RoleGuard } from './scrib3-os/components/AuthGuard';
import FloatingWidget from './scrib3-os/components/FloatingWidget';
import { NavOverlayProvider } from './scrib3-os/components/NavOverlay';
import { dashboardConfigs, type UserRole } from './scrib3-os/config/dashboardConfig';
import { useAuthStore } from './scrib3-os/hooks/useAuth';
import { useLocation } from 'react-router-dom';
// DEVICE layer imports
import DeviceDashboard from './scrib3-device/pages/DashboardPage';
import AvatarCreatorPage from './scrib3-device/pages/AvatarCreatorPage';

function GlobalWidget() {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user || location.pathname === '/' || location.pathname === '/login') return null;
  return <FloatingWidget />;
}

function GlobalNavOverlay({ children }: { children: React.ReactNode }) {
  const { role } = useAuthStore();
  const location = useLocation();
  // Don't wrap landing page or login
  if (location.pathname === '/' || location.pathname === '/login') return <>{children}</>;
  const r: UserRole = (role as UserRole) ?? 'team';
  const config = dashboardConfigs[r];
  return <NavOverlayProvider categories={config.categories}>{children}</NavOverlayProvider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalNavOverlay>
      <GlobalWidget />
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

        <Route
          path="/vendors"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSVendorManagement />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/vendors/onboard"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSVendorOnboard />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/pre-alignment"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSPreAlignment />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/team"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSTeamDirectory />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/team/:id"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSTeamProfile />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/pd/:id"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSProfDev />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/clients/:slug/hub"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSClientHub />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/portal/:slug"
          element={
            <AuthGuard>
              <OSClientPortal />
            </AuthGuard>
          }
        />
        <Route
          path="/resources/what-good-looks-like"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSWhatGoodLooksLike />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/culture"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSCultureHub />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/tools"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSToolsDirectory />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/projects"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSProjectRegistry />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/units"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSUnitDashboards />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/bandwidth"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSBandwidth />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/scope-watch"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSScopeWatch />
              </RoleGuard>
            </AuthGuard>
          }
        />

        <Route
          path="/projects/:code"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSProjectDetail />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/systems-map"
          element={
            <AuthGuard>
              <OSSystemsMap />
            </AuthGuard>
          }
        />
        <Route
          path="/feedback"
          element={
            <AuthGuard>
              <OSFeedback />
            </AuthGuard>
          }
        />
        <Route
          path="/dapps"
          element={
            <AuthGuard>
              <OSShoutouts />
            </AuthGuard>
          }
        />
        <Route
          path="/approvals"
          element={
            <AuthGuard>
              <RoleGuard allowed={['admin', 'team', 'csuite']}>
                <OSApprovals />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/tasks"
          element={
            <AuthGuard>
              <OSTasks />
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <OSSettings />
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
      </GlobalNavOverlay>
    </BrowserRouter>
  );
}
