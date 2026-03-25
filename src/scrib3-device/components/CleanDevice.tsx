/**
 * CleanDevice — Neumorphic replacement for the TAB + cartridge PNGs on the dashboard.
 *
 * Matches the 780×780px footprint of the TAB image so all absolute-positioned
 * child components (ClockDisplay, ProfileCard, nav strip) keep their coordinates.
 *
 * Structure:
 * - Main body: large rounded rectangle (the "tablet")
 * - Screen inset: recessed dark area for content modules
 * - Cartridge slot: small inset strip at bottom (decorative)
 * - Children are rendered inside via props.children
 */
import { type ReactNode } from 'react';
import OrgBrand from './OrgBrand';

interface CleanDeviceProps {
  bgMode: 'dark' | 'light';
  hwMode: 'dark' | 'light';
  children?: ReactNode;
}

export default function CleanDevice({ hwMode, children }: CleanDeviceProps) {
  const isDark = hwMode === 'dark';

  const surface = isDark ? '#333' : '#E3DCDC';
  const screenBg = isDark ? '#1a1a1a' : '#D5CECE';
  const raised = isDark
    ? '4px 4px 10px rgba(0,0,0,0.35), -4px -4px 10px rgba(255,255,255,0.02)'
    : '4px 4px 10px rgba(0,0,0,0.06), -4px -4px 10px rgba(255,255,255,0.5)';
  const inset = isDark
    ? 'inset 3px 3px 8px rgba(0,0,0,0.4), inset -3px -3px 8px rgba(255,255,255,0.02)'
    : 'inset 3px 3px 8px rgba(0,0,0,0.06), inset -3px -3px 8px rgba(255,255,255,0.5)';
  const accent = '#D7ABC5';
  const accentDim = isDark ? 'rgba(215,171,197,0.15)' : 'rgba(215,171,197,0.2)';

  return (
    <div style={{
      width:        '780px',
      height:       '780px',
      position:     'relative',
      background:   surface,
      borderRadius: '32px',
      boxShadow:    raised,
      overflow:     'visible',
      transition:   'background 300ms, box-shadow 300ms',
    }}>
      {/* Screen bezel — recessed area */}
      <div style={{
        position:     'absolute',
        top:          '60px',
        left:         '60px',
        right:        '60px',
        bottom:       '180px',
        borderRadius: '20px',
        background:   screenBg,
        boxShadow:    inset,
        transition:   'background 300ms, box-shadow 300ms',
      }} />

      {/* Accent bar — top edge detail */}
      <div style={{
        position:     'absolute',
        top:          '28px',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        '120px',
        height:       '4px',
        borderRadius: '2px',
        background:   accent,
        opacity:      0.4,
      }} />

      {/* Corner dots — neumorphic screw equivalents */}
      {[
        { top: '20px', left: '20px' },
        { top: '20px', right: '20px' },
        { bottom: '20px', left: '20px' },
        { bottom: '20px', right: '20px' },
      ].map((pos, i) => (
        <div key={i} style={{
          position:     'absolute',
          ...pos,
          width:        '8px',
          height:       '8px',
          borderRadius: '50%',
          boxShadow:    inset,
        } as React.CSSProperties} />
      ))}

      {/* Cartridge slot — bottom decorative strip */}
      <div style={{
        position:     'absolute',
        bottom:       '70px',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        '300px',
        height:       '50px',
        borderRadius: '12px',
        boxShadow:    inset,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        transition:   'box-shadow 300ms',
      }}>
        <OrgBrand hwMode={hwMode} layout="horizontal" scale={0.7} />
      </div>

      {/* Status bar — bottom accent line */}
      <div style={{
        position:     'absolute',
        bottom:       '40px',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        '200px',
        height:       '3px',
        borderRadius: '1.5px',
        background:   `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity:      0.25,
      }} />

      {/* Children (ClockDisplay, ProfileCard, nav, etc.) */}
      {children}
    </div>
  );
}
