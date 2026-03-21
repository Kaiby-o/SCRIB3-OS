import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../store/settings.store';
import avatarSrc from '../assets/avatars/bencrt 1.svg';

export default function ProfileCard({
  bgMode,
  hwMode,
  visible,
  onClick,
}: {
  bgMode:   'dark' | 'light';
  hwMode:   'dark' | 'light';
  visible:  boolean;
  onClick?: () => void;
}) {
  const { aesthetic } = useSettingsStore();
  const isClean = aesthetic === 'clean';
  const isDark = hwMode === 'dark';
  const containerRef  = useRef<HTMLDivElement>(null);
  const [avatarHover, setAvatarHover] = useState(false);

  // Text colors adapt to bg mode in clean mode, stay white in cyberpunk
  const textPrimary = isClean
    ? (isDark ? '#E8E0E0' : '#3A3035')
    : '#FFFFFF';
  const textDim = isClean
    ? (isDark ? 'rgba(232,224,224,0.6)' : 'rgba(58,48,53,0.6)')
    : 'rgba(255,255,255,0.75)';
  const textMuted = isClean
    ? (isDark ? 'rgba(232,224,224,0.4)' : 'rgba(58,48,53,0.4)')
    : 'rgba(255,255,255,0.6)';
  const barBg = isClean
    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
    : 'rgba(255,255,255,0.15)';
  const barGlow = isClean ? 'none' : '0 0 6px #D7ABC5';

  const OW = (size: number, color: string, opacity = 1): React.CSSProperties => ({
    fontFamily:  "'OwnersWide', sans-serif",
    fontSize:    `${size}px`,
    color,
    opacity,
    lineHeight:  1.2,
    textShadow:  isClean ? 'none' : undefined,
  });

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;

    if (isClean) {
      // Simple fade-in for clean mode
      el.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 300, easing: 'ease', fill: 'forwards' }
      );
    } else {
      // Glitch animation for cyberpunk
      el.animate(
        [
          { opacity: 0,   filter: 'blur(4px) brightness(2)' },
          { opacity: 0.7, filter: 'blur(2px) brightness(1.8)', offset: 0.08 },
          { opacity: 0,   filter: 'blur(4px) brightness(2)',   offset: 0.10 },
          { opacity: 0.7, filter: 'blur(1px) brightness(1.5)', offset: 0.22 },
          { opacity: 0,   filter: 'blur(3px) brightness(2)',   offset: 0.25 },
          { opacity: 0.8, filter: 'blur(1px) brightness(1.3)', offset: 0.60 },
          { opacity: 0,   filter: 'blur(2px) brightness(1.5)', offset: 0.65 },
          { opacity: 1,   filter: 'blur(0px) brightness(1)'               },
        ],
        { duration: 400, easing: 'linear', fill: 'forwards' }
      );
    }
  }, [visible, isClean]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{
        position:      'absolute',
        left:          '230px',
        top:           '140px',
        display:       'flex',
        flexDirection: 'row',
        alignItems:    'flex-start',
        gap:           '14px',
        width:         '325px',
        opacity:       0,
        pointerEvents: 'auto',
        cursor:        'pointer',
        zIndex:        3,
      }}
    >
      {/* Avatar with dark frame */}
      <div
        onMouseEnter={() => setAvatarHover(true)}
        onMouseLeave={() => setAvatarHover(false)}
        style={{
          width:        '92px',
          height:       '92px',
          borderRadius: '8px',
          background:   '#222',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          flexShrink:   0,
          transition:   'box-shadow 200ms',
          boxShadow:    avatarHover ? '0 0 10px #D7ABC588' : 'none',
        }}
      >
        <img
          src={avatarSrc}
          alt="avatar"
          draggable={false}
          style={{ width: '72px', height: '72px', borderRadius: '4px', display: 'block' }}
        />
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={OW(18, textPrimary)}>Ben Lydiat</div>
        <div style={OW(12, textDim)}>VP of Creative</div>

        {/* Bandwidth */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={OW(9, textMuted)}>BANDWIDTH</div>
          <div style={{
            width:        '230px',
            height:       '6px',
            background:   barBg,
            borderRadius: '3px',
          }}>
            <div style={{
              width:        '80%',
              height:       '100%',
              background:   '#D7ABC5',
              borderRadius: '3px',
              boxShadow:    barGlow,
            }} />
          </div>
        </div>
      </div>

      {/* XP */}
      <div style={{ position: 'absolute', top: 0, right: '10px', textAlign: 'right' }}>
        <div style={OW(9, textMuted)}>XP</div>
        <div style={OW(11, isClean ? textPrimary : '#D7ABC5')}>050 / 999</div>
      </div>
    </div>
  );
}
