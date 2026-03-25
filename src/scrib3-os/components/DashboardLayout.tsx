import React from 'react';
import PillNav from './PillNav';
import UserProfileCard from './UserProfileCard';
import ClockDisplay from './ClockDisplay';
import ModulePanel from './ModulePanel';
import { NavOverlayProvider, useNavOverlay } from './NavOverlay';
import { dashboardConfigs, type UserRole } from '../config/dashboardConfig';
import { useAuthStore } from '../hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  Inner layout (needs NavOverlay context)                            */
/* ------------------------------------------------------------------ */

const DashboardInner: React.FC<{ role: UserRole }> = ({ role }) => {
  const navOverlay = useNavOverlay();
  const { profile } = useAuthStore();
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
        <span
          style={{
            fontFamily: "'Kaio', sans-serif",
            fontWeight: 900,
            fontSize: '20px',
            textTransform: 'uppercase',
          }}
        >
          SCRIB3
        </span>

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
            fontFamily: "'Kaio', sans-serif",
            fontSize: '24px',
            color: 'var(--text-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Open navigation menu"
        >
          &#9776;
        </button>
      </header>

      {/* ---- Module Grid ---- */}
      <main
        style={{
          paddingTop: 'calc(85px + 40px)',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingBottom: '120px',
          display: 'grid',
          gridTemplateAreas: config.gridTemplate,
          gridTemplateColumns: config.gridColumns,
          gridAutoRows: 'minmax(200px, auto)',
          gap: '16px',
        }}
      >
        {config.modules.map((mod) => (
          <ModulePanel
            key={mod.id}
            label={mod.label}
            style={{ gridArea: mod.gridArea }}
          />
        ))}
      </main>

      {/* ---- Fixed Bottom-Left ---- */}
      <div
        className="fixed bottom-0 left-0 flex flex-col z-30"
        style={{ padding: '40px', gap: '12px' }}
      >
        <UserProfileCard
          name={profile?.display_name ?? 'OPERATOR'}
          role={role.toUpperCase()}
          avatarUrl={profile?.avatar_url ?? undefined}
          xp={profile?.xp ?? 0}
          maxXp={100}
        />
        <div style={{ paddingLeft: '20px' }}>
          <ClockDisplay />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Exported Layout (wraps with NavOverlayProvider)                     */
/* ------------------------------------------------------------------ */

const DashboardLayout: React.FC = () => {
  const { role: authRole, profile } = useAuthStore();
  const role: UserRole = authRole ?? 'team';
  const config = dashboardConfigs[role];

  return (
    <NavOverlayProvider categories={config.categories}>
      <DashboardInner role={role} />
    </NavOverlayProvider>
  );
};

export default DashboardLayout;
