import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { getLevel, getLevelProgress, QUICK_LINKS } from '../lib/xp';
import { getCapacityColor } from '../lib/bandwidth';

/* ------------------------------------------------------------------ */
/*  Plan v4 — Floating User Widget                                     */
/*  Confirmed from Figma node 2019:10529                               */
/* ------------------------------------------------------------------ */

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

type StatusOption = 'active' | 'away' | 'busy';
const STATUS_OPTIONS: { key: StatusOption; label: string; color: string }[] = [
  { key: 'active', label: 'Active', color: '#27AE60' },
  { key: 'away', label: 'Away', color: '#F1C40F' },
  { key: 'busy', label: 'Busy', color: '#E67E22' },
];

const FloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<StatusOption>('active');
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const xp = profile?.xp ?? 0;
  const bandwidthPct = 75;
  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const displayName = profile?.display_name ?? 'OPERATOR';
  const title = role === 'admin' ? 'VP of Creative' : role === 'csuite' ? 'Executive' : 'Team Member';
  const statusColor = STATUS_OPTIONS.find((s) => s.key === status)?.color ?? '#27AE60';

  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  if (!expanded) {
    return (
      <div
        className="fixed bottom-6 left-1/2"
        style={{
          transform: 'translateX(-50%)', zIndex: 35, background: '#000',
          borderRadius: '75.641px', padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          cursor: 'pointer', transition: `all 300ms ${easing}`,
        }}
        onClick={() => setExpanded(true)}
      >
        <ProfileAvatar name={displayName} size={32} />
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '13px', color: '#EAF2D7', textTransform: 'uppercase' }}>
          {displayName}
        </span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
        <span style={{ color: '#EAF2D7', fontSize: '16px', opacity: 0.5 }}>›</span>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6"
      style={{
        left: '50%', transform: 'translateX(-50%)', zIndex: 35,
        background: '#000', borderRadius: '75.641px', padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: '20px',
        maxWidth: '960px', width: 'calc(100% - 80px)', transition: `all 300ms ${easing}`,
      }}
    >
      {/* Profile picture */}
      <ProfileAvatar name={displayName} size={48} />

      {/* User info */}
      <div className="flex flex-col gap-0" style={{ minWidth: 0 }}>
        {/* Name + status */}
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '14px', color: '#EAF2D7', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </span>
          {/* Status indicator — clickable */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
              aria-label="Change status"
            />
            {statusDropdown && (
              <div style={{ position: 'absolute', bottom: 16, left: -20, background: '#1A1A1A', borderRadius: '10.258px', padding: '6px', zIndex: 50, minWidth: '100px' }}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setStatus(opt.key); setStatusDropdown(false); }}
                    className="flex items-center gap-2"
                    style={{ background: status === opt.key ? 'rgba(234,242,215,0.08)' : 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', width: '100%' }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color }} />
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#EAF2D7', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Title + level */}
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.5)', letterSpacing: '0.5px' }}>
            {title}
          </span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#D7ABC5', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Lvl {level.level}
          </span>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#EAF2D7', fontWeight: 600, letterSpacing: '0.5px' }}>XP</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>
            {xp} / {level.maxXp === Infinity ? '∞' : level.maxXp + 1}
          </span>
          <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${levelProgress}%`, height: '100%', background: '#EAF2D7', borderRadius: 2 }} />
          </div>
        </div>

        {/* Bandwidth bar with flag */}
        <div className="flex items-center gap-2" style={{ marginTop: '1px' }}>
          {/* Flag icon */}
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M2 1V13M2 1H10L8 4.5L10 8H2" stroke="#EAF2D7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${bandwidthPct}%`, height: '100%', background: getCapacityColor(bandwidthPct), borderRadius: 2 }} />
          </div>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>
            {bandwidthPct}%
          </span>
        </div>
      </div>

      {/* Time + Date */}
      <div className="flex flex-col items-end" style={{ minWidth: '60px', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', color: '#EAF2D7', fontWeight: 600 }}>
          {timeStr}
        </span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.4)' }}>
          {dateStr}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '36px', background: 'rgba(234,242,215,0.15)', flexShrink: 0 }} />

      {/* Quick links */}
      <div className="flex items-center gap-1" style={{ flex: 1, justifyContent: 'space-around' }}>
        {QUICK_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex flex-col items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: `background 150ms ${easing}` }}
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

      {/* Collapse */}
      <button
        onClick={() => setExpanded(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(234,242,215,0.4)', fontSize: '16px', padding: '4px', flexShrink: 0, transition: `color 150ms ${easing}` }}
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
/*  Profile Avatar — hexagonal/rounded shape with 2px offwhite stroke  */
/* ------------------------------------------------------------------ */

const ProfileAvatar: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      background: '#333',
      border: '2px solid #EAF2D7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    }}
  >
    <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: size * 0.38 }}>
      {name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
    </span>
  </div>
);

export default FloatingWidget;
