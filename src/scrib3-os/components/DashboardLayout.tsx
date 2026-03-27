import React, { useState } from 'react';
import PillNav from './PillNav';
import LogoScrib3 from './LogoScrib3';
import BurgerButton from './BurgerButton';
import { dashboardConfigs, type UserRole } from '../config/dashboardConfig';
import { useAuthStore } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { role: authRole } = useAuthStore();
  const role: UserRole = authRole ?? 'team';
  const config = dashboardConfigs[role];
  const [activeNav, setActiveNav] = useState(config.pillNavItems[0]);

  return (
    <div className="os-root">
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between z-40"
        style={{ height: '85px', padding: '0 40px', background: 'var(--bg-primary)' }}
      >
        <LogoScrib3 height={18} color="var(--text-primary)" />
        <PillNav items={config.pillNavItems} activeItem={activeNav} onItemClick={setActiveNav} />
        <BurgerButton />
      </header>

      <main style={{ paddingTop: 'calc(85px + 24px)', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 85px)' }}>
        <div className="flex flex-col items-center gap-4">
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--border-default)', opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.25, color: 'var(--text-primary)' }}>
            Add Widgets
          </span>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
