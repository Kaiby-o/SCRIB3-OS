import React, { useState, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, type LayoutItem, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import PillNav from './PillNav';
import ModulePanel from './ModulePanel';
import LogoScrib3 from './LogoScrib3';
import { NavOverlayProvider, useNavOverlay } from './NavOverlay';
import { dashboardConfigs, type UserRole, type ModuleConfig } from '../config/dashboardConfig';
import { useAuthStore } from '../hooks/useAuth';
import { moduleContentMap } from './modules/ModuleContent';


/* ------------------------------------------------------------------ */
/*  Default layouts per role                                           */
/*  Grid: 6 columns, row height 200px                                 */
/*  Sizes: 1x1 (1col), 2x1 (2col), 3x1 (3col), full (6col)          */
/* ------------------------------------------------------------------ */

function buildDefaultLayout(modules: ModuleConfig[]): LayoutItem[] {
  // Simple auto-layout: stack modules in rows of 2
  return modules.map((mod, i) => {
    const col = (i % 2) * 3;
    const row = Math.floor(i / 2);
    const isWide = i === 0; // first module gets full width
    return {
      i: mod.id,
      x: isWide ? 0 : col,
      y: row,
      w: isWide ? 6 : 3,
      h: 1,
      minW: 2,
      maxW: 6,
      minH: 1,
      maxH: 2,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Inner layout                                                       */
/* ------------------------------------------------------------------ */

const DashboardInner: React.FC<{ role: UserRole }> = ({ role }) => {
  const navOverlay = useNavOverlay();
  const config = dashboardConfigs[role];
  const [activeNav, setActiveNav] = useState(config.pillNavItems[0]);

  // Get saved layout from localStorage or build default
  const storageKey = `scrib3-dash-layout-${role}`;
  const [layouts, setLayouts] = useState<Record<string, LayoutItem[]>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return { lg: buildDefaultLayout(config.modules) };
  });

  // Track which modules are visible (can be removed)
  const [hiddenModules, setHiddenModules] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-hidden`);
      if (saved) return new Set(JSON.parse(saved));
    } catch { /* ignore */ }
    return new Set();
  });

  // Visible modules filtered by pill nav + hidden state
  const visibleModules = useMemo(() =>
    config.modules.filter((mod) =>
      (!mod.pillFilter || mod.pillFilter.includes(activeNav)) &&
      !hiddenModules.has(mod.id)
    ),
    [config.modules, activeNav, hiddenModules]
  );

  // Current layout items (only for visible modules)
  const currentLayout = useMemo(() => {
    const lgLayout = layouts.lg ?? buildDefaultLayout(config.modules);
    const visibleIds = new Set(visibleModules.map((m) => m.id));
    const existing = lgLayout.filter((l: LayoutItem) => visibleIds.has(l.i));

    // Add any new modules that don't have a layout entry
    for (const mod of visibleModules) {
      if (!existing.find((l: LayoutItem) => l.i === mod.id)) {
        existing.push({
          i: mod.id,
          x: 0,
          y: Infinity, // bottom
          w: 3,
          h: 1,
          minW: 2,
          maxW: 6,
          minH: 1,
          maxH: 2,
        });
      }
    }
    return existing;
  }, [layouts, visibleModules, config.modules]);

  const handleLayoutChange = useCallback((_layout: LayoutItem[], allLayouts: Record<string, LayoutItem[]>) => {
    setLayouts(allLayouts);
    try { localStorage.setItem(storageKey, JSON.stringify(allLayouts)); } catch { /* ignore */ }
  }, [storageKey]);

  const handleRemoveModule = useCallback((id: string) => {
    setHiddenModules((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(`${storageKey}-hidden`, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  const handleResetLayout = useCallback(() => {
    const defaultLayout = { lg: buildDefaultLayout(config.modules) };
    setLayouts(defaultLayout);
    setHiddenModules(new Set());
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaultLayout));
      localStorage.removeItem(`${storageKey}-hidden`);
    } catch { /* ignore */ }
  }, [config.modules, storageKey]);

  return (
    <div className="os-root">
      {/* ---- Fixed Header ---- */}
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between z-40"
        style={{ height: '85px', padding: '0 40px', background: 'var(--bg-primary)' }}
      >
        <LogoScrib3 height={18} color="var(--text-primary)" />
        <PillNav items={config.pillNavItems} activeItem={activeNav} onItemClick={setActiveNav} />
        <div className="flex items-center gap-3">
          {/* Reset layout button */}
          <button
            onClick={handleResetLayout}
            style={{
              fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px',
              textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.3,
              background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
          >
            Reset
          </button>
          {/* Hamburger */}
          <button onClick={navOverlay.open} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} aria-label="Open navigation menu">
            <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
              <path d="M42.5 33.7998H13.5V31.8662H42.5V33.7998ZM42.5 24.1338H13.5V22.2002H42.5V24.1338Z" fill="var(--text-primary)" />
            </svg>
          </button>
        </div>
      </header>

      {/* ---- Draggable Module Grid ---- */}
      <main style={{ paddingTop: 'calc(85px + 24px)', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '140px' }}>
        <ResponsiveGridLayout
          className="layout"
          width={1200}
          layouts={{ lg: currentLayout as Layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 6, md: 4, sm: 2 }}
          rowHeight={220}
          margin={[16, 16] as const}
          containerPadding={[0, 0] as const}
          onLayoutChange={(_layout, layouts) => handleLayoutChange((_layout ?? []) as unknown as LayoutItem[], (layouts ?? {}) as unknown as Record<string, LayoutItem[]>)}
          dragConfig={{ handle: '.module-drag-handle' }}
          resizeConfig={{ handles: ['se'] }}
        >
          {visibleModules.map((mod) => {
            const Content = moduleContentMap[mod.id];
            return (
              <div key={mod.id}>
                <ModulePanel
                  label={mod.label}
                  onRemove={() => handleRemoveModule(mod.id)}
                  style={{ height: '100%' }}
                >
                  {Content ? <Content /> : undefined}
                </ModulePanel>
              </div>
            );
          })}
        </ResponsiveGridLayout>

        {/* Hidden modules indicator */}
        {hiddenModules.size > 0 && (
          <div className="flex items-center justify-center" style={{ marginTop: '16px', gap: '8px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.3 }}>
              {hiddenModules.size} widget{hiddenModules.size > 1 ? 's' : ''} hidden
            </span>
            <button onClick={handleResetLayout} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Restore
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Exported Layout                                                    */
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
