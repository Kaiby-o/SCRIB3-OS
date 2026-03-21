import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useSettingsStore } from '../store/settings.store';
import SettingsCog from '../components/SettingsCog';
import HammerLogo from '../components/auth/HammerLogo';
import CleanCartridge from '../components/CleanCartridge';

import { playSound, playBootSequence } from '../lib/sounds';

import cartridgeDark  from '../assets/images/CRT-DARK-ALIGN.png';
import cartridgeLight from '../assets/images/CRT-LIGHT-ALIGN.png';
import tabDark        from '../assets/images/TAB-DARK__1_.png';
import tabLight       from '../assets/images/TAB-LIGHT.png';
import iconDarkBg     from '../assets/images/DARKBG.svg';
import iconLightBg    from '../assets/images/LIGHTBG.svg';
import iconDarkHw     from '../assets/images/DARKHW.svg';
import iconLightHw    from '../assets/images/LIGHTHW.svg';

type Mode = 'dark' | 'light';

const BG_COLORS: Record<Mode, string> = {
  dark:  '#282828',
  light: '#E3DCDC',
};

const FIELD_STYLE: React.CSSProperties = {
  background:  'transparent',
  border:      'none',
  outline:     'none',
  height:      '36px',
  padding:     '0 12px',
  fontFamily:  "'OwnersWide', sans-serif",
  fontSize:    '15px',
  color:       '#D7ABC5',
  textShadow:  '0 0 4px rgba(215,171,197,0.9), 0 0 8px rgba(215,171,197,0.4)',
  caretColor:  '#D7ABC5',
  position:    'absolute',
  boxSizing:   'border-box',
  transition:  'opacity 720ms ease',
};


export default function LoginPage() {
  const navigate   = useNavigate();
  const { signIn } = useAuthStore();
  const { aesthetic } = useSettingsStore();
  const isClean = aesthetic === 'clean';

  const [bgMode,     setBgMode]     = useState<Mode>('dark');
  const [hwMode,     setHwMode]     = useState<Mode>('dark');
  const [error,      setError]      = useState('');
  const [useHeart,   setUseHeart]   = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [tabTop,       setTabTop]       = useState('-100%');
  const [tabTransform, setTabTransform] = useState('translateX(-50%)');
  const [transitioning, setTransitioning] = useState(false);

  const usernameRef       = useRef<HTMLInputElement>(null);
  const passwordRef       = useRef<HTMLInputElement>(null);
  const cartridgeGroupRef = useRef<HTMLDivElement>(null);
  const cartridgeImgRef   = useRef<HTMLImageElement>(null);

  useEffect(() => { usernameRef.current?.focus(); }, []);

  const bumpGroup = () => {
    playSound('error');
    const el = cartridgeGroupRef.current;
    if (!el) return;
    el.animate(
      [
        { translate: '0px 0px' },
        { translate: '-12px 0px' },
        { translate: '12px 0px' },
        { translate: '-12px 0px' },
        { translate: '12px 0px' },
        { translate: '0px 0px' },
      ],
      { duration: 400, easing: 'ease-in-out' }
    );
  };

  const handleSubmit = async () => {
    if (transitioning) return;
    const username = usernameRef.current?.value.trim() ?? '';
    const password = passwordRef.current?.value ?? '';

    if (!username || !password) {
      bumpGroup();
      return;
    }

    const email = `${username}@scrib3.test`;
    setError('');
    try {
      await signIn(email, password);
      if (isClean) {
        runCleanSuccessSequence();
      } else {
        runSuccessSequence();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      bumpGroup();
    }
  };

  /* ── Clean mode: simple fade transition ── */
  const runCleanSuccessSequence = async () => {
    setTransitioning(true);
    setOverlayOpacity(0);
    await delay(600);
    navigate('/', { state: { bgMode, hwMode } });
  };

  /* ── Cyberpunk mode: full cartridge-insert animation ── */
  const runSuccessSequence = async () => {
    setTransitioning(true);

    // Phase 1 — Heart animation (2400ms)
    setUseHeart(true);
    await delay(2400);

    // Phase 2 fade + Step A rotate img only
    setOverlayOpacity(0);
    cartridgeImgRef.current?.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(90deg)' },
      ],
      { duration: 1440, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
    await delay(1440);

    // Step B — Scale img + translate GROUP div simultaneously (1440ms)
    const viewportHeight = window.innerHeight;
    const translateY = viewportHeight / 2 + 249 - viewportHeight / 2 - 20;
    const scaleAnim = cartridgeImgRef.current?.animate(
      [
        { transform: 'rotate(90deg) scale(1)' },
        { transform: 'rotate(90deg) scale(0.577)' },
      ],
      { duration: 1440, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
    const moveAnim = cartridgeGroupRef.current?.animate(
      [
        { transform: 'translate(-50%, -50%)' },
        { transform: `translate(calc(-50% + 15px), calc(-50% + ${translateY}px))` },
      ],
      { duration: 1440, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
    await Promise.all([scaleAnim?.finished, moveAnim?.finished]);

    // Sound — cartridge insert + boot sequence
    setTimeout(() => {
      playSound('cartridge');
      playBootSequence();
    }, 2000);

    // Step C — TAB descends (2880ms)
    setTabTop('50%');
    setTabTransform('translate(-50%, -50%)');
    await delay(2880);

    // Navigate
    navigate('/', { state: { bgMode, hwMode } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      style={{
        width:      '100vw',
        minHeight:  '100vh',
        background: BG_COLORS[bgMode],
        position:   'relative',
        overflow:   'hidden',
        transition: 'background 300ms',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* ── Toggle icons — top right ─────────────────────── */}
      <div style={{
        position:   'fixed',
        top:        '24px',
        right:      '24px',
        display:    'flex',
        gap:        '16px',
        zIndex:     1000,
        opacity:    overlayOpacity,
        transition: 'opacity 720ms ease',
      }}>
        <img
          src={bgMode === 'dark' ? iconDarkBg : iconLightBg}
          alt="Toggle background"
          onClick={() => !transitioning && setBgMode(m => m === 'dark' ? 'light' : 'dark')}
          style={{ width: '32px', height: 'auto', cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        />
        <img
          src={hwMode === 'dark' ? iconDarkHw : iconLightHw}
          alt="Toggle hardware"
          onClick={() => !transitioning && setHwMode(m => m === 'dark' ? 'light' : 'dark')}
          style={{ width: '32px', height: 'auto', cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        />
        <SettingsCog bgMode={bgMode} disabled={transitioning} />
      </div>

      {/* ── Login form — centered ─────── */}
      {isClean ? (
        /* Clean mode: compact card with built-in inputs */
        <div style={{
          position:  'absolute',
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <CleanCartridge
            ref={cartridgeGroupRef}
            bgMode={bgMode}
            hwMode={hwMode}
            usernameRef={usernameRef}
            passwordRef={passwordRef}
            onSubmit={handleSubmit}
            error={error}
            overlayOpacity={overlayOpacity}
          />
        </div>
      ) : (
        /* Cyberpunk mode: PNG cartridge with overlay inputs */
        <div
          ref={cartridgeGroupRef}
          style={{
            position:  'absolute',
            top:       '50%',
            left:      '50%',
            transform: 'translate(-50%, -50%)',
            width:     '780px',
          }}
        >
          <img
            ref={cartridgeImgRef}
            src={hwMode === 'dark' ? cartridgeDark : cartridgeLight}
            alt="SCRIB3-OS Data Module"
            style={{
              width:           '780px',
              height:          'auto',
              display:         'block',
              transformOrigin: 'center center',
              opacity:         1,
            }}
            draggable={false}
          />

          {/* Hammer logo */}
          <div style={{
            position:      'absolute',
            left:          '63.5%',
            top:           '43%',
            width:         '70px',
            height:        '55px',
            transform:     'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex:        10,
            opacity:       overlayOpacity,
            transition:    'opacity 720ms ease',
          }}>
            <HammerLogo useHeart={useHeart} />
          </div>

          {/* Scanlines over lens */}
          <div style={{
            position:      'absolute',
            width:         '138px',
            height:        '140px',
            borderRadius:  '50%',
            top:           '42.5%',
            left:          '62.5%',
            transform:     'translate(-50%, -50%)',
            background:    'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)',
            zIndex:        15,
            pointerEvents: 'none',
            opacity:       overlayOpacity,
            transition:    'opacity 720ms ease',
          }} />

          {/* Vignette over lens */}
          <div style={{
            position:      'absolute',
            width:         '140px',
            height:        '140px',
            borderRadius:  '50%',
            top:           '42.5%',
            left:          '62.5%',
            transform:     'translate(-50%, -50%)',
            background:    'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)',
            zIndex:        16,
            pointerEvents: 'none',
            opacity:       overlayOpacity,
            transition:    'opacity 720ms ease',
          }} />

          {/* USERNAME */}
          <input
            ref={usernameRef}
            type="text"
            placeholder="username"
            autoComplete="off"
            spellCheck={false}
            style={{
              ...FIELD_STYLE,
              top:     '39%',
              left:    '14.5%',
              width:   '33%',
              height:  '19px',
              opacity: overlayOpacity,
            }}
          />

          {/* PASSWORD */}
          <input
            ref={passwordRef}
            type="password"
            placeholder="password"
            autoComplete="current-password"
            style={{
              ...FIELD_STYLE,
              top:     '50%',
              left:    '14.5%',
              width:   '33%',
              height:  '19px',
              opacity: overlayOpacity,
            }}
          />

          {/* Invisible submit button — pink grip tab area */}
          <div
            onClick={handleSubmit}
            style={{
              position:   'absolute',
              right:      '1.2%',
              top:        '28%',
              width:      '11%',
              height:     '50%',
              cursor:     'pointer',
              zIndex:     20,
              background: 'transparent',
            }}
          />

          {/* Error message */}
          {error && (
            <div style={{
              position:      'absolute',
              bottom:        '-32px',
              left:          '14.5%',
              fontFamily:    "'OwnersWide', sans-serif",
              fontSize:      '12px',
              color:         'rgba(255,80,80,0.9)',
              letterSpacing: '0.05em',
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── TAB image — cyberpunk only ── */}
      {!isClean && (
        <img
          src={hwMode === 'dark' ? tabDark : tabLight}
          alt=""
          draggable={false}
          style={{
            position:      'absolute',
            top:           tabTop,
            left:          '50%',
            width:         '780px',
            height:        'auto',
            transform:     tabTransform,
            pointerEvents: 'none',
            userSelect:    'none',
            zIndex:        20,
            transition:    'top 2880ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
