import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { getLevel, getLevelProgress } from '../lib/xp';
import { getCapacityColor } from '../lib/bandwidth';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const ICON_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Icons/';

type StatusOption = 'active' | 'away' | 'busy';
const STATUS_OPTIONS: { key: StatusOption; label: string; color: string }[] = [
  { key: 'active', label: 'Active', color: '#27AE60' },
  { key: 'away', label: 'Away', color: '#F1C40F' },
  { key: 'busy', label: 'Busy', color: '#E67E22' },
];

const QUICK_LINKS: { label: string; icon: string; route: string; comingSoon?: boolean }[] = [
  { label: 'Chat', icon: 'chat.svg', route: '/dashboard', comingSoon: true },
  { label: 'Calendar', icon: 'calendar.svg', route: '/dashboard', comingSoon: true },
  { label: 'Office', icon: 'office.svg', route: '/device', comingSoon: true },
  { label: 'Dapps', icon: 'dapps.svg', route: '/tools', comingSoon: true },
  { label: 'Bandwidth', icon: 'bandwidth.svg', route: '/bandwidth' },
  { label: 'Tasks', icon: 'tasks.svg', route: '/projects' },
  { label: 'Feedback', icon: 'feedback.svg', route: '/dashboard', comingSoon: true },
  { label: 'Prof Dev', icon: 'profdev.svg', route: '/culture', comingSoon: true },
  { label: 'Settings', icon: 'settings.svg', route: '/settings' },
];

const FloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [docked, setDocked] = useState(false);
  const [dockSide, setDockSide] = useState<'left' | 'right'>('right');
  const [status, setStatus] = useState<StatusOption>('active');
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [now, setNow] = useState(new Date());
  const [comingSoonToast, setComingSoonToast] = useState(false);
  const showComingSoon = () => { setComingSoonToast(true); setTimeout(() => setComingSoonToast(false), 1500); };

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
    e.stopPropagation();
    const el = widgetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const el = widgetRef.current;
      const w = el?.offsetWidth ?? 300;
      const h = el?.offsetHeight ?? 60;
      const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - w));
      const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - h));
      setPosition({ x, y });
    };
    const handleUp = (e: MouseEvent) => {
      setIsDragging(false);
      if (e.clientY < 80) {
        setDocked(true);
        setDockSide(e.clientX < window.innerWidth / 2 ? 'left' : 'right');
        setExpanded(false);
        setPosition(null);
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isDragging]);

  const handleUndock = () => {
    setDocked(false);
    setExpanded(true);
    setPosition(null);
  };

  const BurgerHandle = ({ size = 16, color = 'rgba(234,242,215,0.4)' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <line x1="3" y1="6" x2="13" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );

  /* ---- DOCKED: small pill that sits TO THE RIGHT of nav pills ---- */
  if (docked) {
    return (
      <button
        onClick={handleUndock}
        style={{
          position: 'fixed', top: 22,
          ...(dockSide === 'left' ? { left: 180 } : { right: 120 }),
          zIndex: 45, background: '#000', borderRadius: '75.641px',
          padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          border: 'none', cursor: 'pointer', transition: `all 300ms ${easing}`,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <CircleAvatar name={displayName} size={22} avatarUrl={profile?.avatar_url} />
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '11px', color: '#EAF2D7', textTransform: 'uppercase' }}>
          {displayName}
        </span>
      </button>
    );
  }

  /* ---- COLLAPSED ---- */
  if (!expanded) {
    return (
      <div
        ref={widgetRef}
        onMouseDown={handleDragStart}
        style={{
          position: 'fixed',
          ...(position ? { left: position.x, top: position.y } : { bottom: 24, left: '50%', transform: 'translateX(-50%)' }),
          zIndex: 45, background: '#000', borderRadius: '75.641px',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : `all 300ms ${easing}`,
          userSelect: 'none',
        }}
        onClick={() => { if (!isDragging) setExpanded(true); }}
      >
        <CircleAvatar name={displayName} size={32} avatarUrl={profile?.avatar_url} />
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '13px', color: '#EAF2D7', textTransform: 'uppercase' }}>{displayName}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BurgerHandle />
          <svg width="8" height="10" viewBox="0 0 8 10" fill="rgba(234,242,215,0.5)"><polygon points="0,0 8,5 0,10" /></svg>
        </div>
      </div>
    );
  }

  /* ---- EXPANDED ---- */
  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        ...(position ? { left: position.x, top: position.y } : { bottom: 24, left: '50%', transform: 'translateX(-50%)' }),
        zIndex: 45, background: '#000', borderRadius: '75.641px',
        padding: '6px 16px 6px 6px',
        display: 'flex', alignItems: 'center', gap: '12px',
        maxWidth: '960px', width: 'calc(100% - 80px)',
        transition: isDragging ? 'none' : `all 300ms ${easing}`,
        userSelect: 'none',
      }}
    >
      {/* Large circle avatar — fills capsule height */}
      <div onClick={() => navigate('/profile/' + (profile?.id ?? ''))} style={{ cursor: 'pointer', flexShrink: 0 }}>
        <CircleAvatar name={displayName} size={64} avatarUrl={profile?.avatar_url} />
      </div>

      {/* User info + time/date in one row */}
      <div className="flex items-start gap-4" style={{ minWidth: 0, flex: '0 0 auto' }}>
        {/* Left column: name, title, bars */}
        <div className="flex flex-col" style={{ minWidth: 0, gap: '2px' }}>
          {/* Name + status */}
          <div className="flex items-center gap-2">
            <span onClick={() => navigate('/profile/' + (profile?.id ?? ''))} style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '14px', color: '#EAF2D7', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1, cursor: 'pointer' }}>
              {displayName}
            </span>
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
          {/* XP + Bandwidth side by side */}
          <div className="flex items-center gap-4" style={{ marginTop: '2px' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#EAF2D7', fontWeight: 600, letterSpacing: '0.5px' }}>XP</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>{xp}/{level.maxXp === Infinity ? '∞' : level.maxXp + 1}</span>
              <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${levelProgress}%`, height: '100%', background: '#EAF2D7', borderRadius: 2 }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src={ICON_BASE + 'bandwidth.svg'} alt="" style={{ width: 10, height: 10, opacity: 0.6 }} />
              <div style={{ width: 40, height: 3, background: 'rgba(234,242,215,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${bandwidthPct}%`, height: '100%', background: getCapacityColor(bandwidthPct), borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234,242,215,0.5)' }}>{bandwidthPct}%</span>
            </div>
          </div>
        </div>

        {/* Right column: time + date — top-aligned with name */}
        <div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', color: '#EAF2D7', fontWeight: 600, lineHeight: 1.1 }}>{timeStr}</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234,242,215,0.4)', marginTop: '2px' }}>{dateStr}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '40px', background: 'rgba(234,242,215,0.12)', flexShrink: 0 }} />

      {/* Coming soon toast */}
      {comingSoonToast && (
        <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: '#EAF2D7', color: '#000', fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '75.641px', whiteSpace: 'nowrap', zIndex: 50 }}>
          Coming Soon
        </div>
      )}

      {/* Quick links — SVG icons */}
      <div className="flex items-center gap-1" style={{ flex: 1, justifyContent: 'space-around' }}>
        {QUICK_LINKS.map((link) => (
          <button key={link.label} onClick={() => { if (link.comingSoon) showComingSoon(); else navigate(link.route); }} className="flex flex-col items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px', transition: `background 150ms ${easing}`, opacity: link.comingSoon ? 0.4 : 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(234,242,215,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <img src={ICON_BASE + link.icon} alt={link.label} style={{ width: 26, height: 26 }} />
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '7px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(234,242,215,0.5)' }}>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Drag handle + collapse arrow (‹ = left arrow when open) */}
      <div onMouseDown={handleDragStart} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', cursor: 'grab', flexShrink: 0 }}>
        <BurgerHandle size={18} />
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(false); setPosition(null); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(234,242,215,0.4)', fontSize: '12px', padding: '2px', transition: `color 150ms ${easing}` }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#EAF2D7')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(234,242,215,0.4)')}
        >
          <svg width="8" height="10" viewBox="0 0 8 10" fill="rgba(234,242,215,0.5)"><polygon points="8,0 0,5 8,10" /></svg>
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Circle Avatar                                                      */
/* ------------------------------------------------------------------ */

const CircleAvatar: React.FC<{ name: string; size: number; avatarUrl?: string | null }> = ({ name, size, avatarUrl }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: '#333',
    border: '2px solid #EAF2D7', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden',
  }}>
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: size * 0.35 }}>
        {name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
      </span>
    )}
  </div>
);

export default FloatingWidget;
