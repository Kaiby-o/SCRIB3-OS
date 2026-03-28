import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthGuard, RoleGuard } from './scrib3-os/components/AuthGuard';
import FloatingWidget from './scrib3-os/components/FloatingWidget';
import { NavOverlayProvider } from './scrib3-os/components/NavOverlay';
import { dashboardConfigs, type UserRole } from './scrib3-os/config/dashboardConfig';
import { useAuthStore } from './scrib3-os/hooks/useAuth';

// Eagerly loaded — critical path
import OSLanding from './scrib3-os/pages/LandingPage';
import OSDashboard from './scrib3-os/pages/DashboardPage';

// Lazy loaded — split into separate chunks
const OSProfile = lazy(() => import('./scrib3-os/pages/ProfilePage'));
const OSClientOnboard = lazy(() => import('./scrib3-os/pages/ClientOnboardPage'));
const OSFinanceOverview = lazy(() => import('./scrib3-os/pages/FinanceOverviewPage'));
const OSFinanceDetail = lazy(() => import('./scrib3-os/pages/FinanceDetailPage'));
const OSVendorManagement = lazy(() => import('./scrib3-os/pages/VendorManagementPage'));
const OSVendorOnboard = lazy(() => import('./scrib3-os/pages/VendorOnboardPage'));
const OSPreAlignment = lazy(() => import('./scrib3-os/pages/PreAlignmentPage'));
const OSBandwidth = lazy(() => import('./scrib3-os/pages/BandwidthPage'));
const OSScopeWatch = lazy(() => import('./scrib3-os/pages/ScopeWatchPage'));
const OSTeamDirectory = lazy(() => import('./scrib3-os/pages/TeamDirectoryPage'));
const OSTeamProfile = lazy(() => import('./scrib3-os/pages/TeamProfilePage'));
const OSProfDev = lazy(() => import('./scrib3-os/pages/ProfDevPage'));
const OSClientHub = lazy(() => import('./scrib3-os/pages/ClientHubPage'));
const OSClientPortal = lazy(() => import('./scrib3-os/pages/ClientPortalPage'));
const OSWhatGoodLooksLike = lazy(() => import('./scrib3-os/pages/WhatGoodLooksLikePage'));
const OSProjectRegistry = lazy(() => import('./scrib3-os/pages/ProjectRegistryPage'));
const OSUnitDashboards = lazy(() => import('./scrib3-os/pages/UnitDashboardsPage'));
const OSCultureHub = lazy(() => import('./scrib3-os/pages/CultureHubPage'));
const OSToolsDirectory = lazy(() => import('./scrib3-os/pages/ToolsDirectoryPage'));
const OSSettings = lazy(() => import('./scrib3-os/pages/SettingsPage'));
const OSTasks = lazy(() => import('./scrib3-os/pages/TasksPage'));
const OSApprovals = lazy(() => import('./scrib3-os/pages/ApprovalsPage'));
const OSProjectDetail = lazy(() => import('./scrib3-os/pages/ProjectDetailPage'));
const OSShoutouts = lazy(() => import('./scrib3-os/pages/ShoutoutsPage'));
const OSFeedback = lazy(() => import('./scrib3-os/pages/FeedbackPage'));
const OSSystemsMap = lazy(() => import('./scrib3-os/pages/SystemsMapPage'));
const OSChat = lazy(() => import('./scrib3-os/pages/ChatPage'));
const OSClientDirectory = lazy(() => import('./scrib3-os/pages/ClientDirectoryPage'));
const OSProfDevHub = lazy(() => import('./scrib3-os/pages/ProfDevHubPage'));
const BattleModule = lazy(() => import('./modules/battle/index'));

// DEVICE layer — heaviest chunk (Phaser 3, D3.js)
const DeviceDashboard = lazy(() => import('./scrib3-device/pages/DashboardPage'));
const AvatarCreatorPage = lazy(() => import('./scrib3-device/pages/AvatarCreatorPage'));

// Loading fallback
const PageLoader = () => (
  <div className="os-root flex items-center justify-center" style={{ minHeight: '100vh' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>Loading...</span>
  </div>
);

function GlobalWidget() {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user || location.pathname === '/' || location.pathname === '/login') return null;
  return <FloatingWidget />;
}

function GlobalNavOverlay({ children }: { children: React.ReactNode }) {
  const { role } = useAuthStore();
  const location = useLocation();
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
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ===== SCRIB3-OS routes ===== */}
        <Route path="/" element={<OSLanding />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<AuthGuard><OSDashboard /></AuthGuard>} />
        <Route path="/profile/:id" element={<AuthGuard><OSProfile /></AuthGuard>} />
        <Route path="/team" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSTeamDirectory /></RoleGuard></AuthGuard>} />
        <Route path="/team/:id" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSTeamProfile /></RoleGuard></AuthGuard>} />
        <Route path="/pd/:id" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSProfDev /></RoleGuard></AuthGuard>} />
        <Route path="/clients" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSClientDirectory /></RoleGuard></AuthGuard>} />
        <Route path="/clients/onboard" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSClientOnboard /></RoleGuard></AuthGuard>} />
        <Route path="/clients/:slug/hub" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSClientHub /></RoleGuard></AuthGuard>} />
        <Route path="/portal/:slug" element={<AuthGuard><OSClientPortal /></AuthGuard>} />
        <Route path="/projects" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSProjectRegistry /></RoleGuard></AuthGuard>} />
        <Route path="/projects/:code" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSProjectDetail /></RoleGuard></AuthGuard>} />
        <Route path="/units" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSUnitDashboards /></RoleGuard></AuthGuard>} />
        <Route path="/finance" element={<AuthGuard><RoleGuard allowed={['admin', 'csuite']}><OSFinanceOverview /></RoleGuard></AuthGuard>} />
        <Route path="/finance/:slug" element={<AuthGuard><RoleGuard allowed={['admin', 'csuite']}><OSFinanceDetail /></RoleGuard></AuthGuard>} />
        <Route path="/vendors" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSVendorManagement /></RoleGuard></AuthGuard>} />
        <Route path="/vendors/onboard" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSVendorOnboard /></RoleGuard></AuthGuard>} />
        <Route path="/pre-alignment" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSPreAlignment /></RoleGuard></AuthGuard>} />
        <Route path="/bandwidth" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSBandwidth /></RoleGuard></AuthGuard>} />
        <Route path="/scope-watch" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSScopeWatch /></RoleGuard></AuthGuard>} />
        <Route path="/resources/what-good-looks-like" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSWhatGoodLooksLike /></RoleGuard></AuthGuard>} />
        <Route path="/culture" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSCultureHub /></RoleGuard></AuthGuard>} />
        <Route path="/tools" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSToolsDirectory /></RoleGuard></AuthGuard>} />
        <Route path="/profdev" element={<AuthGuard><OSProfDevHub /></AuthGuard>} />
        <Route path="/chat" element={<AuthGuard><OSChat /></AuthGuard>} />
        <Route path="/systems-map" element={<AuthGuard><OSSystemsMap /></AuthGuard>} />
        <Route path="/feedback" element={<AuthGuard><OSFeedback /></AuthGuard>} />
        <Route path="/dapps" element={<AuthGuard><OSShoutouts /></AuthGuard>} />
        <Route path="/approvals" element={<AuthGuard><RoleGuard allowed={['admin', 'team', 'csuite']}><OSApprovals /></RoleGuard></AuthGuard>} />
        <Route path="/tasks" element={<AuthGuard><OSTasks /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><OSSettings /></AuthGuard>} />
        <Route path="/battle/*" element={<AuthGuard><BattleModule /></AuthGuard>} />

        {/* ===== SCRIB3-DEVICE routes (admin only) ===== */}
        <Route path="/device" element={<AuthGuard><RoleGuard allowed={['admin']}><DeviceDashboard /></RoleGuard></AuthGuard>} />
        <Route path="/device/avatar-creator" element={<AuthGuard><RoleGuard allowed={['admin']}><AvatarCreatorPage /></RoleGuard></AuthGuard>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </GlobalNavOverlay>
    </BrowserRouter>
  );
}
