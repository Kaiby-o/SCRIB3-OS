import React from 'react';
import PillNav from './PillNav';
import ModulePanel from './ModulePanel';
import LogoScrib3 from './LogoScrib3';
import { NavOverlayProvider, useNavOverlay } from './NavOverlay';
import { dashboardConfigs, type UserRole } from '../config/dashboardConfig';
import { useAuthStore } from '../hooks/useAuth';
import { moduleContentMap } from './modules/ModuleContent';

/* ------------------------------------------------------------------ */
/*  Inner layout (needs NavOverlay context)                            */
/* ------------------------------------------------------------------ */

const DashboardInner: React.FC<{ role: UserRole }> = ({ role }) => {
  const navOverlay = useNavOverlay();
  const config = dashboardConfigs[role];
  const [activeNav, setActiveNav] = React.useState(config.pillNavItems[0]);

  return (
    <div
      className="os-root"
    >
      {/* ---- Fixed Header ---- */}
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between z-40"
        style={{
          height: '85px',
          padding: '0 40px',
          background: 'var(--bg-primary)',
        }}
      >
        {/* Logo */}
        <LogoScrib3 height={18} color="var(--text-primary)" />

        {/* Centre nav */}
        <PillNav
          items={config.pillNavItems}
          activeItem={activeNav}
          onItemClick={setActiveNav}
        />

        {/* Hamburger */}
        <button
          onClick={navOverlay.open}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          aria-label="Open navigation menu"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 56 56"
            fill="none"
          >
            <path
              d="M42.5 33.7998H13.5V31.8662H42.5V33.7998ZM42.5 24.1338H13.5V22.2002H42.5V24.1338Z"
              fill="var(--text-primary)"
            />
          </svg>
        </button>
      </header>

      {/* ---- Module Grid ---- */}
      <main
        style={{
          paddingTop: 'calc(85px + 40px)',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingBottom: '160px', /* space for floating widget (72px) + breathing room */
          display: 'grid',
          gridTemplateAreas: config.gridTemplate,
          gridTemplateColumns: config.gridColumns,
          gridAutoRows: 'minmax(200px, auto)',
          gap: '16px',
        }}
      >
        {config.modules
          .filter((mod) => !mod.pillFilter || mod.pillFilter.includes(activeNav))
          .map((mod) => {
          const Content = moduleContentMap[mod.id];
          return (
            <ModulePanel
              key={mod.id}
              label={mod.label}
              style={{ gridArea: mod.gridArea }}
            >
              {Content ? <Content /> : undefined}
            </ModulePanel>
          );
        })}
      </main>

    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Exported Layout (wraps with NavOverlayProvider)                     */
/* ------------------------------------------------------------------ */

const DashboardLayout: React.FC = () => {
  const { role: authRole } = useAuthStore();
  const role: UserRole = authRole ?? 'team';
  const config = dashboardConfigs[role];

  return (
    <NavOverlayProvider categories={config.categories}>
      <DashboardInner role={role} />
    </NavOverlayProvider>
  );
};

export default DashboardLayout;
