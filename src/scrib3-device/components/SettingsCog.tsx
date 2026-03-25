import { useState, useRef, useEffect } from 'react';
import { useAudioStore, type MuteMode } from '../store/audio.store';
import { useSettingsStore, type Aesthetic } from '../store/settings.store';
import iconSettingsDark  from '../assets/images/settings.svg';
import iconSettingsLight from '../assets/images/settingslight.svg';

const MUTE_OPTIONS: { value: MuteMode; label: string }[] = [
  { value: 'none',  label: 'ALL ON' },
  { value: 'sfx',   label: 'MUTE SFX' },
  { value: 'music', label: 'MUTE MUSIC' },
  { value: 'all',   label: 'MUTE ALL' },
];

const AESTHETIC_OPTIONS: { value: Aesthetic; label: string }[] = [
  { value: 'cyberpunk', label: 'CYBERPUNK' },
  { value: 'clean',     label: 'CLEAN' },
];

interface SettingsCogProps {
  bgMode: 'dark' | 'light';
  disabled?: boolean;
}

function getTheme(aesthetic: Aesthetic, isDark: boolean) {
  if (aesthetic === 'clean') {
    return isDark ? {
      textColor: '#E8E0E0',
      dimColor:  'rgba(232,224,224,0.4)',
      panelBg:   '#333333',
      borderCol: 'none',
      hoverBg:   'rgba(232,224,224,0.08)',
      shadow:    '3px 3px 8px rgba(0,0,0,0.3), -3px -3px 8px rgba(255,255,255,0.02)',
      radius:    '16px',
      dotActive: '#D7ABC5',
    } : {
      textColor: '#3A3035',
      dimColor:  'rgba(58,48,53,0.4)',
      panelBg:   '#E3DCDC',
      borderCol: 'none',
      hoverBg:   'rgba(58,48,53,0.06)',
      shadow:    '3px 3px 8px rgba(0,0,0,0.06), -3px -3px 8px rgba(255,255,255,0.5)',
      radius:    '16px',
      dotActive: '#D7ABC5',
    };
  }
  // cyberpunk
  return isDark ? {
    textColor: '#D7ABC5',
    dimColor:  'rgba(215,171,197,0.4)',
    panelBg:   'rgba(20,20,20,0.95)',
    borderCol: 'rgba(215,171,197,0.2)',
    hoverBg:   'rgba(215,171,197,0.1)',
    shadow:    '0 8px 32px rgba(0,0,0,0.6)',
    radius:    '4px',
    dotActive: '#D7ABC5',
  } : {
    textColor: '#6B4F5F',
    dimColor:  'rgba(107,79,95,0.4)',
    panelBg:   'rgba(240,237,232,0.95)',
    borderCol: 'rgba(107,79,95,0.2)',
    hoverBg:   'rgba(107,79,95,0.1)',
    shadow:    '0 8px 32px rgba(0,0,0,0.15)',
    radius:    '4px',
    dotActive: '#6B4F5F',
  };
}

export default function SettingsCog({ bgMode, disabled }: SettingsCogProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { muteMode, setMuteMode } = useAudioStore();
  const { aesthetic, setAesthetic } = useSettingsStore();

  const isDark = bgMode === 'dark';
  const t = getTheme(aesthetic, isDark);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Cog icon */}
      <img
        src={isDark ? iconSettingsDark : iconSettingsLight}
        alt="Settings"
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width:      '32px',
          height:     'auto',
          cursor:     disabled ? 'default' : 'pointer',
          opacity:    open ? 1 : 0.7,
          transition: 'opacity 200ms',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = open ? '1' : '0.7'; }}
      />

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position:       'absolute',
          top:            '40px',
          right:          0,
          width:          '200px',
          background:     t.panelBg,
          border:         t.borderCol === 'none' ? 'none' : `1px solid ${t.borderCol}`,
          borderRadius:   t.radius,
          padding:        '12px 0',
          zIndex:         2000,
          backdropFilter: aesthetic === 'cyberpunk' ? 'blur(8px)' : 'none',
          boxShadow:      t.shadow,
          transition:     'background 300ms, box-shadow 300ms, border-radius 300ms',
        }}>
          {/* Section: Audio */}
          <SectionLabel color={t.dimColor}>AUDIO</SectionLabel>
          {MUTE_OPTIONS.map(opt => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              active={muteMode === opt.value}
              textColor={t.textColor}
              dimColor={t.dimColor}
              hoverBg={t.hoverBg}
              dotActive={t.dotActive}
              onClick={() => setMuteMode(opt.value)}
            />
          ))}

          {/* Divider */}
          <div style={{
            height:     aesthetic === 'clean' ? '2px' : '1px',
            background: aesthetic === 'clean' ? 'transparent' : t.borderCol,
            boxShadow:  aesthetic === 'clean'
              ? (isDark
                ? 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.03)'
                : 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.7)')
              : 'none',
            margin:     '8px 16px',
            borderRadius: '1px',
          }} />

          {/* Section: Aesthetic */}
          <SectionLabel color={t.dimColor}>AESTHETIC</SectionLabel>
          {AESTHETIC_OPTIONS.map(opt => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              active={aesthetic === opt.value}
              textColor={t.textColor}
              dimColor={t.dimColor}
              hoverBg={t.hoverBg}
              dotActive={t.dotActive}
              onClick={() => setAesthetic(opt.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ color, children }: { color: string; children: string }) {
  return (
    <div style={{
      fontFamily:    "'OwnersWide', sans-serif",
      fontSize:      '8px',
      letterSpacing: '0.2em',
      color,
      padding:       '0 16px 6px',
    }}>
      {children}
    </div>
  );
}

function OptionRow({ label, active, textColor, dimColor, hoverBg, dotActive, onClick }: {
  label: string;
  active: boolean;
  textColor: string;
  dimColor: string;
  hoverBg: string;
  dotActive: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        fontFamily:    "'OwnersWide', sans-serif",
        fontSize:      '10px',
        letterSpacing: '0.1em',
        color:         active ? textColor : dimColor,
        padding:       '6px 16px',
        cursor:        'pointer',
        display:       'flex',
        alignItems:    'center',
        gap:           '8px',
        transition:    'background 150ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{
        width:        '6px',
        height:       '6px',
        borderRadius: '50%',
        background:   active ? dotActive : 'transparent',
        border:       `1px solid ${active ? dotActive : dimColor}`,
        flexShrink:   0,
      }} />
      {label}
    </div>
  );
}
