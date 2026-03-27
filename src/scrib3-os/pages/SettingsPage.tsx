import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useAuthStore } from '../hooks/useAuth';
import { useThemeStore } from '../hooks/useTheme';

/* ------------------------------------------------------------------ */
/*  Settings Page                                                      */
/*  User preferences + dashboard widget visibility toggles             */
/* ------------------------------------------------------------------ */

const WIDGET_OPTIONS = [
  { id: 'active-projects', label: 'Active Projects', description: 'Your current project assignments and progress' },
  { id: 'task-queue', label: 'Task Queue', description: 'Pending tasks sorted by priority' },
  { id: 'team-activity', label: 'Team Activity', description: 'Recent activity feed from your team' },
  { id: 'comms', label: 'Internal Comms', description: 'Messages and announcements' },
  { id: 'system-overview', label: 'System Overview', description: 'Platform status and configuration' },
  { id: 'portfolio', label: 'Portfolio Overview', description: 'All engagements at a glance' },
  { id: 'revenue', label: 'Revenue', description: 'Financial overview and revenue tracking' },
  { id: 'utilisation', label: 'Team Utilisation', description: 'Capacity and allocation view' },
  { id: 'client-health', label: 'Client Health', description: 'Client satisfaction and engagement health' },
  { id: 'metrics', label: 'Key Metrics', description: 'KPI summary cards' },
  { id: 'bandwidth', label: 'Bandwidth', description: 'Your bandwidth estimate and capacity' },
  { id: 'scope-alerts', label: 'Scope Watch Alerts', description: 'Out-of-scope request notifications' },
  { id: 'calendar', label: 'Calendar', description: 'Upcoming meetings and deadlines' },
  { id: 'announcements', label: 'Announcements', description: 'Company-wide announcements' },
];

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(
    new Set(['active-projects', 'task-queue', 'team-activity', 'comms'])
  );
  const [saved, setSaved] = useState(false);

  const toggleWidget = (id: string) => {
    setEnabledWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    // In production: save to Supabase profiles.dashboard_layout
    console.log('[settings] Widget preferences:', Array.from(enabledWidgets));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Settings</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 32px 0' }}>
          Settings
        </h1>

        {/* Account section */}
        <Section title="Account">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <InfoCard label="Email" value={profile?.email ?? '—'} />
            <InfoCard label="Role" value={profile?.role?.toUpperCase() ?? '—'} />
            <InfoCard label="Display Name" value={profile?.display_name ?? '—'} />
            <InfoCard label="XP" value={`${profile?.xp ?? 0} XP`} />
          </div>
          <button
            onClick={() => signOut()}
            style={{
              fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
              padding: '10px 24px', borderRadius: '75.641px', border: '1px solid #E74C3C',
              background: 'transparent', color: '#E74C3C', cursor: 'pointer', transition: `opacity 200ms ${easing}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Sign Out
          </button>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <DarkModeToggle />
        </Section>

        {/* Dashboard widgets section */}
        <Section title="Dashboard Widgets">
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
            Choose which widgets appear on your dashboard. Enabled widgets can be dragged, resized, and rearranged.
          </p>
          <div className="flex flex-col gap-3">
            {WIDGET_OPTIONS.map((w) => (
              <label key={w.id} className="flex items-center gap-3" style={{ cursor: 'pointer', padding: '12px 16px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', transition: `background 150ms ${easing}` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                {/* Checkbox */}
                <div
                  style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    border: '1.5px solid var(--border-default)',
                    background: enabledWidgets.has(w.id) ? '#D7ABC5' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: `background 150ms ${easing}`,
                  }}
                  onClick={() => toggleWidget(w.id)}
                >
                  {enabledWidgets.has(w.id) && <span style={{ color: '#000', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                </div>
                <div className="flex flex-col" style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>{w.label}</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{w.description}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3" style={{ marginTop: '20px' }}>
            <button onClick={handleSave} style={{
              fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
              padding: '10px 24px', borderRadius: '75.641px', border: 'none',
              background: '#000', color: '#EAF2D7', cursor: 'pointer', transition: `opacity 200ms ${easing}`,
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
              Save Preferences
            </button>
            {saved && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', color: '#27AE60' }}>✓ Saved</span>}
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>{title}</h2>
    {children}
  </div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '16px 20px' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '6px' }}>{label}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px' }}>{value}</span>
  </div>
);

const DarkModeToggle: React.FC = () => {
  const { theme, toggle } = useThemeStore();
  return (
    <div className="flex items-center justify-between" style={{ padding: '16px 20px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px' }}>
      <div>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block' }}>Dark Mode</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>
          Switch between light and dark themes
        </span>
      </div>
      <button onClick={toggle} style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: theme === 'dark' ? '#D7ABC5' : 'rgba(0,0,0,0.15)',
        position: 'relative', transition: 'background 200ms',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: theme === 'dark' ? 25 : 3,
          transition: 'left 200ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
};

export default SettingsPage;
