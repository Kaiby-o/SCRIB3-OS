import React, { useState, useEffect, useCallback } from 'react';
import RGL from 'react-grid-layout';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GridLayout = RGL as any;
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import PillNav from './PillNav';
import ModulePanel from './ModulePanel';
import LogoScrib3 from './LogoScrib3';
import BurgerButton from './BurgerButton';
import { dashboardConfigs, type UserRole } from '../config/dashboardConfig';
import { useAuthStore } from '../hooks/useAuth';
import { moduleContentMap } from './modules/ModuleContent';

/* ------------------------------------------------------------------ */
/*  Layout helpers                                                     */
/* ------------------------------------------------------------------ */

type LayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number; maxW?: number; minH?: number; maxH?: number };

const STORAGE_KEY_PREFIX = 'scrib3-dash-';

function getEnabledWidgets(role: string): Set<string> {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}widgets-${role}`);
    if (saved) return new Set(JSON.parse(saved));
  } catch { /* ignore */ }
  // Default: all modules enabled
  const config = dashboardConfigs[role as UserRole];
  return new Set(config?.modules.map((m) => m.id) ?? []);
}

function saveEnabledWidgets(role: string, widgets: Set<string>) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}widgets-${role}`, JSON.stringify(Array.from(widgets)));
}

function buildDefaultLayout(moduleIds: string[]): LayoutItem[] {
  return moduleIds.map((id, i) => ({
    i: id,
    x: (i % 2) * 3,
    y: Math.floor(i / 2),
    w: i === 0 ? 6 : 3,
    h: 1,
    minW: 2, maxW: 6, minH: 1, maxH: 2,
  }));
}

function getLayout(role: string, moduleIds: string[]): LayoutItem[] {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}layout-${role}`);
    if (saved) {
      const parsed = JSON.parse(saved) as LayoutItem[];
      // Filter to only include current module IDs
      const validIds = new Set(moduleIds);
      const valid = parsed.filter((l) => validIds.has(l.i));
      // Add any missing modules
      for (const id of moduleIds) {
        if (!valid.find((l) => l.i === id)) {
          valid.push({ i: id, x: 0, y: Infinity, w: 3, h: 1, minW: 2, maxW: 6, minH: 1, maxH: 2 });
        }
      }
      return valid;
    }
  } catch { /* ignore */ }
  return buildDefaultLayout(moduleIds);
}

/* ------------------------------------------------------------------ */
/*  Dashboard Layout                                                   */
/* ------------------------------------------------------------------ */

const DashboardLayout: React.FC = () => {
  const { role: authRole } = useAuthStore();
  const role: UserRole = authRole ?? 'team';
  const config = dashboardConfigs[role];
  const [activeNav, setActiveNav] = useState(config.pillNavItems[0]);
  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(() => getEnabledWidgets(role));
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth - 48 : 1200);

  // Listen for widget toggle changes from Settings page
  useEffect(() => {
    const handler = () => setEnabledWidgets(getEnabledWidgets(role));
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('focus', handler); };
  }, [role]);

  // Track window width
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth - 48);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Visible modules: filtered by pill nav + enabled widgets
  const visibleModules = config.modules.filter((mod) =>
    enabledWidgets.has(mod.id) &&
    (!mod.pillFilter || mod.pillFilter.includes(activeNav))
  );

  const visibleIds = visibleModules.map((m) => m.id);
  const visibleKey = visibleIds.join(',');
  const [layout, setLayout] = useState<LayoutItem[]>(() => getLayout(role, visibleIds));

  // Update layout when visible modules change
  useEffect(() => {
    setLayout(getLayout(role, visibleIds));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, visibleKey]);

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}layout-${role}`, JSON.stringify(newLayout));
  }, [role]);

  const handleRemoveWidget = useCallback((id: string) => {
    setEnabledWidgets((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveEnabledWidgets(role, next);
      return next;
    });
  }, [role]);

  const handleResetLayout = useCallback(() => {
    const allIds = config.modules.map((m) => m.id);
    setEnabledWidgets(new Set(allIds));
    saveEnabledWidgets(role, new Set(allIds));
    setLayout(buildDefaultLayout(allIds));
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}layout-${role}`);
  }, [role, config.modules]);

  const hasWidgets = visibleModules.length > 0;

  return (
    <div className="os-root">
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between z-40"
        style={{ height: '85px', padding: '0 40px', background: 'var(--bg-primary)' }}
      >
        <LogoScrib3 height={18} color="var(--text-primary)" />
        <PillNav items={config.pillNavItems} activeItem={activeNav} onItemClick={setActiveNav} />
        <div className="flex items-center gap-2">
          {hasWidgets && (
            <button onClick={handleResetLayout}
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.25, background: 'none', border: 'none', cursor: 'pointer' }}>
              Reset
            </button>
          )}
          <BurgerButton />
        </div>
      </header>

      <main style={{ paddingTop: 'calc(85px + 24px)', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '140px' }}>
        {hasWidgets ? (
          <>
            <GridLayout
              className="layout"
              layout={layout}
              cols={6}
              rowHeight={220}
              width={width}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onLayoutChange={(l: any) => handleLayoutChange(l as LayoutItem[])}
              draggableHandle=".module-drag-handle"
              resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
              compactType="vertical"
              useCSSTransforms
            >
              {visibleModules.map((mod) => {
                const Content = moduleContentMap[mod.id];
                return (
                  <div key={mod.id}>
                    <ModulePanel label={mod.label} onRemove={() => handleRemoveWidget(mod.id)} style={{ height: '100%' }}>
                      {Content ? <Content /> : undefined}
                    </ModulePanel>
                  </div>
                );
              })}
            </GridLayout>

            {enabledWidgets.size < config.modules.length && (
              <div className="flex items-center justify-center" style={{ marginTop: '16px', gap: '8px' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.3 }}>
                  {config.modules.length - enabledWidgets.size} widget{config.modules.length - enabledWidgets.size > 1 ? 's' : ''} hidden
                </span>
                <button onClick={handleResetLayout} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Restore
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
            <div className="flex flex-col items-center gap-4">
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--border-default)', opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.25 }}>
                Add Widgets
              </span>
              <button onClick={handleResetLayout} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', opacity: 0.4 }}>
                Show Default Widgets
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;
