import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { getLevel, getLevelProgress, QUICK_LINKS } from '../lib/xp';
import { getCapacityColor } from '../lib/bandwidth';

/* ------------------------------------------------------------------ */
/*  Plan v4 — Floating User Widget                                     */
/*  Confirmed from Figma node 2019:10529                               */
/*  Persistent across all authenticated pages, pinned to bottom        */
/*  Desktop: full-width horizontal pill                                */
/*  Left: avatar + name + title + online dot + XP + bandwidth          */
/*  Right: 8 icon quick links                                          */
/* ------------------------------------------------------------------ */

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const FloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuthStore();
  const [expanded, setExpanded] = useState(true);

  // Mock values — in production these come from Supabase
  const xp = profile?.xp ?? 0;
  const bandwidthPct = 75;
  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const displayName = profile?.display_name ?? 'OPERATOR';
  const title = role === 'admin' ? 'VP of Creative' : role === 'csuite' ? 'Executive' : 'Team Member';

  if (!expanded) {
    // Collapsed: just avatar + name + expand button
    return (
      <div
        className="fixed bottom-6 left-1/2"
        style={{
          transform: 'translateX(-50%)',
          zIndex: 35,
          background: '#000',
          borderRadius: '75.641px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: `all 300ms ${easing}`,
        }}
        onClick={() => setExpanded(true)}
      >
        <Avatar name={displayName} size={32} />
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '13px', color: '#EAF2D7', textTransform: 'uppercase' }}>
          {displayName}
        </span>
        <OnlineDot />
        <span style={{ color: '#EAF2D7', fontSize: '16px', opacity: 0.5 }}>‹</span>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 35,
        background: '#000',
        borderRadius: '75.641px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        maxWidth: '900px',
        width: 'calc(100% - 80px)',
        transition: `all 300ms ${easing}`,
      }}
    >
      {/* Left section: User info */}
      <div className="flex items-center gap-3" style={{ minWidth: '260px' }}>
        <Avatar name={displayName} size={48} />
        <div className="flex flex-col gap-1" style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '14px', color: '#EAF2D7', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </span>
            <OnlineDot />
          </div>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.5)', letterSpacing: '0.5px' }}>
            {title}
          </span>

          {/* XP + Bandwidth row */}
          <div className="flex items-center gap-4">
            {/* XP */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '12px' }}>{level.badge}</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.6)' }}>
                {xp} / {level.maxXp === Infinity ? '∞' : level.maxXp + 1}
              </span>
              <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${levelProgress}%`, height: '100%', background: '#EAF2D7', borderRadius: 2 }} />
              </div>
            </div>

            {/* Bandwidth */}
            <div className="flex items-center gap-2">
              <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${bandwidthPct}%`, height: '100%', background: getCapacityColor(bandwidthPct), borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: "'NT Stardust', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>
                {bandwidthPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '36px', background: 'rgba(234,242,215,0.15)', flexShrink: 0 }} />

      {/* Right section: Quick links */}
      <div className="flex items-center gap-1" style={{ flex: 1, justifyContent: 'space-around' }}>
        {QUICK_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: `background 150ms ${easing}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(234,242,215,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{link.icon}</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '8px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(234,242,215,0.5)' }}>
              {link.label}
            </span>
          </button>
        ))}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setExpanded(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(234,242,215,0.4)',
          fontSize: '16px',
          padding: '4px',
          flexShrink: 0,
          transition: `color 150ms ${easing}`,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#EAF2D7')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(234,242,215,0.4)')}
        aria-label="Collapse widget"
      >
        ›
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const Avatar: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: size * 0.38 }}>
      {name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
    </span>
  </div>
);

const OnlineDot: React.FC = () => (
  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27AE60', flexShrink: 0 }} />
);

export default FloatingWidget;
