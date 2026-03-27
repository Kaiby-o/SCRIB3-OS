import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { getLevel, getLevelProgress } from '../lib/xp';
import { getCapacityColor } from '../lib/bandwidth';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const ICON_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Icons/';
const PFP_SHAPE_URL = ICON_BASE + 'PFP-SHAPE.svg';

type StatusOption = 'active' | 'away' | 'busy';
const STATUS_OPTIONS: { key: StatusOption; label: string; color: string }[] = [
  { key: 'active', label: 'Active', color: '#27AE60' },
  { key: 'away', label: 'Away', color: '#F1C40F' },
  { key: 'busy', label: 'Busy', color: '#E67E22' },
];

const QUICK_LINKS: { label: string; icon: string; route: string }[] = [
  { label: 'Chat', icon: 'chat.svg', route: '/dashboard' },
  { label: 'Calendar', icon: 'calendar.svg', route: '/dashboard' },
  { label: 'Office', icon: 'office.svg', route: '/device' },
  { label: 'Dapps', icon: 'dapps.svg', route: '/tools' },
  { label: 'Bandwidth', icon: 'bandwidth.svg', route: '/bandwidth' },
  { label: 'Tasks', icon: 'tasks.svg', route: '/projects' },
  { label: 'Feedback', icon: 'feedback.svg', route: '/dashboard' },
  { label: 'Prof Dev', icon: 'prof-dev.svg', route: '/dashboard' },
];

/* ------------------------------------------------------------------ */
/*  Floating Widget                                                    */
/* ------------------------------------------------------------------ */

const FloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [docked, setDocked] = useState(false);
  const [status, setStatus] = useState<StatusOption>('active');
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [now, setNow] = useState(new Date());

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

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
  const day = now.getDate();
  const monthShort = now.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
  const dateStr = `${String(day).padStart(2, '0')} ${monthShort}`;

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = widgetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      setPosition({ x, y });
    };

    const handleUp = (e: MouseEvent) => {
      setIsDragging(false);
      // Check if dropped near top navbar (y < 80px)
      if (e.clientY < 80) {
        setDocked(true);
        setExpanded(false);
        setPosition(null);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  // Undock: click the docked pill → slide back down
  const handleUndock = () => {
    setDocked(false);
    setExpanded(true);
    setPosition(null);
  };

  // Burger handle icon (horizontal lines)
  const BurgerHandle = ({ size = 16, color = 'rgba(234,242,215,0.4)' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ cursor: 'grab', flexShrink: 0 }}>
      <line x1="3" y1="6" x2="13" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );

  /* ---- DOCKED STATE: small pill in top navbar ---- */
  if (docked) {
    return (
      <button
        onClick={handleUndock}
        style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(50%)',
          zIndex: 45, background: '#000', borderRadius: '75.641px',
          padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          border: 'none', cursor: 'pointer', transition: `all 300ms ${easing}`,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <div style={{ width: 22, height: 22, position: 'relative', flexShrink: 0 }}>
          <img src={PFP_SHAPE_URL} alt="" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
          {profile?.avatar_url && (
            <img src={profile.avatar_url} alt="" style={{ width: '80%', height: '80%', objectFit: 'cover', position: 'absolute', top: '10%', left: '10%', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }} />
          )}
        </div>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '11px', color: '#EAF2D7', textTransform: 'uppercase' }}>
          {displayName}
        </span>
      </button>
    );
  }

  /* ---- COLLAPSED STATE ---- */
  if (!expanded) {
    return (
      <div
        ref={widgetRef}
        className="fixed"
        style={{
          ...(position ? { left: position.x, top: position.y } : { bottom: 24, left: '50%', transform: 'translateX(-50%)' }),
          zIndex: 35, background: '#000', borderRadius: '75.641px',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          cursor: isDragging ? 'grabbing' : 'pointer', transition: isDragging ? 'none' : `all 300ms ${easing}`,
          userSelect: 'none',
        }}
        onClick={() => { if (!isDragging) setExpanded(true); }}
      >
        <ProfileAvatar name={displayName} size={32} avatarUrl={profile?.avatar_url} />
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '13px', color: '#EAF2D7', textTransform: 'uppercase' }}>
          {displayName}
        </span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
        {/* Burger drag handle */}
        <div onMouseDown={handleDragStart} onClick={(e) => e.stopPropagation()} style={{ padding: '4px' }}>
          <BurgerHandle />
        </div>
      </div>
    );
  }

  /* ---- EXPANDED STATE ---- */
  return (
    <div
      ref={widgetRef}
      className="fixed"
      style={{
        ...(position ? { left: position.x, top: position.y } : { bottom: 24, left: '50%', transform: 'translateX(-50%)' }),
        zIndex: 35, background: '#000', borderRadius: '75.641px',
        padding: '10px 16px 10px 10px',
        display: 'flex', alignItems: 'center', gap: '16px',
        maxWidth: '960px', width: 'calc(100% - 80px)',
        transition: isDragging ? 'none' : `all 300ms ${easing}`,
        userSelect: 'none',
      }}
    >
      {/* Profile picture with PFP shape mask */}
      <div style={{ width: 56, height: 56, position: 'relative', flexShrink: 0 }}>
        {/* Shape outline */}
        <img src={PFP_SHAPE_URL} alt="" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }} />
        {/* Avatar image clipped to shape */}
        <div style={{
          width: '88%', height: '88%', position: 'absolute', top: '6%', left: '6%',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          overflow: 'hidden', background: '#333', zIndex: 1,
        }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '18px' }}>
                {displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User info block */}
      <div className="flex flex-col" style={{ minWidth: 0, gap: '1px' }}>
        {/* Row 1: Name + status + time/date */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            {/* Name + status dot */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '14px', color: '#EAF2D7', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </span>
              {/* Clickable status */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setStatusDropdown(!statusDropdown)} style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, border: 'none', cursor: 'pointer', padding: 0 }} />
                {statusDropdown && (
                  <div style={{ position: 'absolute', bottom: 16, left: -20, background: '#1A1A1A', borderRadius: '10.258px', padding: '6px', zIndex: 50, minWidth: '100px' }}>
                    {STATUS_OPTIONS.map((opt) => (
                      <button key={opt.key} onClick={() => { setStatus(opt.key); setStatusDropdown(false); }} className="flex items-center gap-2"
                        style={{ background: status === opt.key ? 'rgba(234,242,215,0.08)' : 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', width: '100%' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color }} />
                        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#EAF2D7', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Title + Level */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.5)', letterSpacing: '0.5px' }}>{title}</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#D7ABC5', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Lvl {level.level}</span>
            </div>
          </div>

          {/* Time + Date — top-aligned with name */}
          <div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', color: '#EAF2D7', fontWeight: 600, lineHeight: 1.1 }}>{timeStr}</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.4)', lineHeight: 1.2 }}>{dateStr}</span>
          </div>
        </div>

        {/* Row 2: XP bar (left) + Bandwidth bar (right) side by side */}
        <div className="flex items-center gap-4" style={{ marginTop: '2px' }}>
          {/* XP */}
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#EAF2D7', fontWeight: 600, letterSpacing: '0.5px' }}>XP</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>{xp} / {level.maxXp === Infinity ? '∞' : level.maxXp + 1}</span>
            <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${levelProgress}%`, height: '100%', background: '#EAF2D7', borderRadius: 2 }} />
            </div>
          </div>
          {/* Bandwidth */}
          <div className="flex items-center gap-2">
            <img src={ICON_BASE + 'bandwidth.svg'} alt="" style={{ width: 10, height: 10, opacity: 0.6 }} />
            <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${bandwidthPct}%`, height: '100%', background: getCapacityColor(bandwidthPct), borderRadius: 2 }} />
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>{bandwidthPct}%</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '40px', background: 'rgba(234,242,215,0.12)', flexShrink: 0 }} />

      {/* Quick links — SVG icons from Supabase */}
      <div className="flex items-center gap-1" style={{ flex: 1, justifyContent: 'space-around' }}>
        {QUICK_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex flex-col items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px', transition: `background 150ms ${easing}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(234,242,215,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <img src={ICON_BASE + link.icon} alt={link.label} style={{ width: 22, height: 22 }} />
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '7px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(234,242,215,0.5)' }}>
              {link.label}
            </span>
          </button>
        ))}
      </div>

      {/* Burger drag handle + collapse */}
      <div className="flex flex-col items-center gap-1" style={{ flexShrink: 0 }}>
        <div onMouseDown={handleDragStart} onClick={(e) => e.stopPropagation()} style={{ padding: '4px', cursor: 'grab' }}>
          <BurgerHandle size={18} />
        </div>
        <button
          onClick={() => { setExpanded(false); setPosition(null); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(234,242,215,0.3)', fontSize: '10px', padding: '2px', fontFamily: "'Owners Wide', sans-serif", letterSpacing: '0.5px' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#EAF2D7')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(234,242,215,0.3)')}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Profile Avatar with PFP shape                                      */
/* ------------------------------------------------------------------ */

const ProfileAvatar: React.FC<{ name: string; size: number; avatarUrl?: string | null }> = ({ name, size, avatarUrl }) => (
  <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
    <img src={PFP_SHAPE_URL} alt="" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }} />
    <div style={{
      width: '85%', height: '85%', position: 'absolute', top: '7.5%', left: '7.5%',
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      overflow: 'hidden', background: '#333', zIndex: 1,
    }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: size * 0.35 }}>
            {name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
      )}
    </div>
  </div>
);

export default FloatingWidget;
