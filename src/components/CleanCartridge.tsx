/**
 * CleanCartridge — Compact neumorphic login card.
 * Vertical layout inspired by modern login forms,
 * using the established neumorphic aesthetic.
 */
import { forwardRef } from 'react';
import OrgBrand from './OrgBrand';

interface CleanCartridgeProps {
  bgMode: 'dark' | 'light';
  hwMode: 'dark' | 'light';
  usernameRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  error: string;
  overlayOpacity: number;
}

const CleanCartridge = forwardRef<HTMLDivElement, CleanCartridgeProps>(
  ({ hwMode, usernameRef, passwordRef, onSubmit, error, overlayOpacity }, ref) => {
    const isDark = hwMode === 'dark';

    const surface = isDark ? '#333' : '#E3DCDC';
    const raised = isDark
      ? '3px 3px 8px rgba(0,0,0,0.3), -3px -3px 8px rgba(255,255,255,0.02)'
      : '3px 3px 8px rgba(0,0,0,0.06), -3px -3px 8px rgba(255,255,255,0.5)';
    const inset = isDark
      ? 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.02)'
      : 'inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.5)';
    const textColor = isDark ? '#E8E0E0' : '#3A3035';
    const textDim = isDark ? 'rgba(232,224,224,0.4)' : 'rgba(58,48,53,0.4)';
    const accent = '#D7ABC5';

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onSubmit();
    };

    return (
      <div
        ref={ref}
        style={{
          width:        '380px',
          background:   surface,
          borderRadius: '24px',
          boxShadow:    raised,
          padding:      '48px 40px 40px',
          display:      'flex',
          flexDirection: 'column',
          gap:          '24px',
          opacity:      overlayOpacity,
          transition:   'background 300ms, box-shadow 300ms, opacity 600ms ease',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header — org brand + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <OrgBrand hwMode={hwMode} layout="stacked" scale={1.2} />
          <div style={{
            fontFamily:    "'OwnersWide', sans-serif",
            fontSize:      '10px',
            color:         textDim,
            letterSpacing: '0.15em',
          }}>
            SIGN IN TO YOUR ACCOUNT
          </div>
        </div>

        {/* Username field */}
        <div style={{
          borderRadius: '14px',
          boxShadow:    inset,
          padding:      '2px',
          transition:   'box-shadow 300ms',
        }}>
          <input
            ref={usernameRef}
            type="text"
            placeholder="username"
            autoComplete="off"
            spellCheck={false}
            style={{
              width:        '100%',
              height:       '44px',
              padding:      '0 18px',
              background:   'transparent',
              border:       'none',
              outline:      'none',
              fontFamily:   "'OwnersWide', sans-serif",
              fontSize:     '13px',
              color:        textColor,
              caretColor:   accent,
              boxSizing:    'border-box',
              letterSpacing:'0.05em',
            }}
          />
        </div>

        {/* Password field */}
        <div style={{
          borderRadius: '14px',
          boxShadow:    inset,
          padding:      '2px',
          transition:   'box-shadow 300ms',
        }}>
          <input
            ref={passwordRef}
            type="password"
            placeholder="password"
            autoComplete="current-password"
            style={{
              width:        '100%',
              height:       '44px',
              padding:      '0 18px',
              background:   'transparent',
              border:       'none',
              outline:      'none',
              fontFamily:   "'OwnersWide', sans-serif",
              fontSize:     '13px',
              color:        textColor,
              caretColor:   accent,
              boxSizing:    'border-box',
              letterSpacing:'0.05em',
            }}
          />
        </div>

        {/* Sign in button */}
        <button
          type="button"
          onClick={onSubmit}
          style={{
            width:         '100%',
            height:        '46px',
            borderRadius:  '14px',
            border:        'none',
            background:    accent,
            color:         isDark ? '#1a1a1a' : '#fff',
            fontFamily:    "'OwnersWide', sans-serif",
            fontSize:      '12px',
            letterSpacing: '0.15em',
            cursor:        'pointer',
            boxShadow:     isDark
              ? '2px 2px 6px rgba(0,0,0,0.25), -2px -2px 6px rgba(255,255,255,0.02)'
              : '2px 2px 6px rgba(0,0,0,0.05), -2px -2px 6px rgba(255,255,255,0.4)',
            transition:    'box-shadow 200ms, transform 100ms',
          }}
          onMouseDown={e => {
            e.currentTarget.style.boxShadow = inset;
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = '';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = '';
          }}
        >
          SIGN IN
        </button>

        {/* Error message */}
        {error && (
          <div style={{
            fontFamily:    "'OwnersWide', sans-serif",
            fontSize:      '11px',
            color:         'rgba(255,80,80,0.9)',
            letterSpacing: '0.05em',
            textAlign:     'center',
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

CleanCartridge.displayName = 'CleanCartridge';
export default CleanCartridge;
