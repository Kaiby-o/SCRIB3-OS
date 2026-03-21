import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useSettingsStore } from '../store/settings.store';
import SettingsCog from '../components/SettingsCog';
import CleanDevice           from '../components/CleanDevice';
import ClockDisplay          from '../components/ClockDisplay';
import PlasmaTube            from '../components/PlasmaTube';
import ProfileCard           from '../components/ProfileCard';
import AuxScreen             from '../components/AuxScreen';
import SystemMap             from '../components/systems-map';
import { useCanvasNavigation } from '../hooks/useCanvasNavigation';

import cartridgeDark  from '../assets/images/CRT-DARK-ALIGN.png';
import cartridgeLight from '../assets/images/CRT-LIGHT-ALIGN.png';
import tabDark        from '../assets/images/TAB-DARK__1_.png';
import tabLight       from '../assets/images/TAB-LIGHT.png';
import iconDarkBg     from '../assets/images/DARKBG.svg';
import iconLightBg    from '../assets/images/LIGHTBG.svg';
import iconDarkHw     from '../assets/images/DARKHW.svg';
import iconLightHw    from '../assets/images/LIGHTHW.svg';

type Mode = 'dark' | 'light';

const NAV_ITEM: React.CSSProperties = {
  fontFamily:      "'OwnersWide', sans-serif",
  fontSize:        '9px',
  color:           '#D7ABC5',
  textShadow:      '0 0 6px rgba(215,171,197,0.7)',
  letterSpacing:   '0.2em',
  opacity:         0.4,
  cursor:          'pointer',
};

function navItemClean(hwMode: 'dark' | 'light'): React.CSSProperties {
  return {
    fontFamily:      "'OwnersWide', sans-serif",
    fontSize:        '9px',
    color:           hwMode === 'dark' ? '#E8E0E0' : '#3A3035',
    textShadow:      'none',
    letterSpacing:   '0.2em',
    opacity:         0.4,
    cursor:          'pointer',
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { aesthetic } = useSettingsStore();
  const isClean = aesthetic === 'clean';

  const locState = (location.state ?? {}) as { bgMode?: Mode; hwMode?: Mode };
  const [bgMode, setBgMode] = useState<Mode>(locState.bgMode ?? 'dark');
  const [hwMode, setHwMode] = useState<Mode>(locState.hwMode ?? 'dark');
  const [profileVisible, setProfileVisible] = useState(false);
  const [auxVisible,     setAuxVisible]     = useState(false);
  const [showMap,        setShowMap]        = useState(false);
  const [mapTransition,  setMapTransition]  = useState(false);
  const { containerStyle }                  = useCanvasNavigation();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => {
    document.body.style.background = bgMode === 'dark' ? '#282828' : '#E3DCDC';
  }, [bgMode]);

  useEffect(() => {
    const id = setTimeout(() => setProfileVisible(true), 500);
    return () => clearTimeout(id);
  }, []);

  const navStyle = isClean ? navItemClean(hwMode) : NAV_ITEM;

  const handleMapOpen = () => {
    setMapTransition(true);
    setTimeout(() => setShowMap(true), 500);
  };

  const handleMapClose = () => {
    setShowMap(false);
    setTimeout(() => setMapTransition(false), 50);
  };

  return (
    <div style={{
      width:      '100vw',
      minHeight:  '100vh',
      background: bgMode === 'dark' ? '#282828' : '#E3DCDC',
      position:   'relative',
      overflow:   'hidden',
      transition: 'background 300ms',
    }}>

      {/* ── Toggle icons — fixed, outside zoom container ── */}
      <div style={{
        position: 'fixed',
        top:      '24px',
        right:    '24px',
        display:  'flex',
        gap:      '16px',
        zIndex:   1000,
      }}>
        <img
          src={bgMode === 'dark' ? iconDarkBg : iconLightBg}
          alt="Toggle background"
          onClick={() => setBgMode(m => m === 'dark' ? 'light' : 'dark')}
          style={{ width: '32px', height: 'auto', cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        />
        <img
          src={hwMode === 'dark' ? iconDarkHw : iconLightHw}
          alt="Toggle hardware"
          onClick={() => setHwMode(m => m === 'dark' ? 'light' : 'dark')}
          style={{ width: '32px', height: 'auto', cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        />
        <SettingsCog bgMode={bgMode} />
      </div>

      {/* ── Systems Map (full-screen overlay) ── */}
      {showMap && (
        <div style={{
          position:   'fixed',
          inset:      0,
          zIndex:     900,
          background: bgMode === 'dark' ? '#1A1A1A' : '#F0EDED',
          animation:  'mapFadeIn 400ms ease-out forwards',
        }}>
          <button
            onClick={handleMapClose}
            style={{
              position:     'fixed',
              top:          '24px',
              left:         '24px',
              zIndex:       1000,
              background:   'none',
              border:       `1px solid ${bgMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '4px',
              color:        bgMode === 'dark' ? '#E8E0E0' : '#3A3035',
              fontFamily:   "'OwnersWide', 'JetBrains Mono', monospace",
              fontSize:     '10px',
              letterSpacing:'0.15em',
              padding:      '8px 16px',
              cursor:       'pointer',
              opacity:      0.7,
              transition:   'opacity 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            ← DEVICE
          </button>
          <SystemMap />
        </div>
      )}

      {/* ── Zoom / pan inner wrapper ── */}
      <div style={{
        position:   'absolute',
        inset:      0,
        ...containerStyle,
        transition: 'transform 500ms cubic-bezier(0.25, 0.0, 0.1, 1.0), opacity 400ms ease-out',
        transform:  mapTransition
          ? `${containerStyle.transform || ''} translateY(120vh)`
          : containerStyle.transform || '',
        opacity:    mapTransition ? 0 : 1,
      }}>

      {/* ── Device container ── */}
      <div style={{
        position:      'absolute',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -50%)',
        width:         '780px',
        zIndex:        0,
        pointerEvents: 'none',
      }}>
        {isClean ? (
          /* ── Clean mode: neumorphic device ── */
          <CleanDevice bgMode={bgMode} hwMode={hwMode}>
            {/* Profile card */}
            <ProfileCard bgMode={bgMode} hwMode={hwMode} visible={profileVisible} onClick={() => setAuxVisible(v => !v)} />

            {/* Aux screen */}
            <AuxScreen bgMode={bgMode} hwMode={hwMode} visible={auxVisible} onClose={() => setAuxVisible(false)} />

            {/* Clock display */}
            <div style={{
              position:      'absolute',
              left:          '109px',
              top:           '218px',
              width:         '60px',
              height:        '165px',
              zIndex:        2,
              pointerEvents: 'auto',
            }}>
              <ClockDisplay hwMode={hwMode} />
            </div>

            {/* Nav strip */}
            <div ref={navRef} style={{
              position:      'absolute',
              bottom:        '200px',
              left:          '50%',
              transform:     'translateX(-50%)',
              display:       'flex',
              flexDirection: 'row',
              gap:           '32px',
              zIndex:        10,
              pointerEvents: 'auto',
            }}>
              {['TASKS', 'FILES', 'TIMELINE', 'COMMS', 'MAP'].map(label => (
                <span
                  key={label}
                  style={{ ...navStyle, transition: 'opacity 200ms' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                  onClick={label === 'MAP' ? handleMapOpen : undefined}
                >{label}</span>
              ))}
            </div>
          </CleanDevice>
        ) : (
          /* ── Cyberpunk mode: PNG-based device ── */
          <>
            {/* TAB image */}
            <img
              src={hwMode === 'dark' ? tabDark : tabLight}
              alt=""
              draggable={false}
              style={{
                position:    'relative',
                width:       '780px',
                height:      'auto',
                display:     'block',
                userSelect:  'none',
                zIndex:      1,
                opacity:     1,
                visibility:  'visible',
              }}
            />

            {/* Cartridge image */}
            <img
              src={hwMode === 'dark' ? cartridgeDark : cartridgeLight}
              alt=""
              draggable={false}
              style={{
                position:        'absolute',
                left:            'calc(50% + 15px)',
                marginLeft:      '-390px',
                bottom:          '-30px',
                width:           '780px',
                height:          'auto',
                transform:       'rotate(90deg) scale(0.577)',
                transformOrigin: 'center center',
                zIndex:          0,
                pointerEvents:   'none',
                userSelect:      'none',
              }}
            />

            {/* Plasma tube — right side of TAB */}
            <PlasmaTube bgMode={bgMode} />

            {/* Profile card */}
            <ProfileCard bgMode={bgMode} hwMode={hwMode} visible={profileVisible} onClick={() => setAuxVisible(v => !v)} />

            {/* Aux screen */}
            <AuxScreen bgMode={bgMode} hwMode={hwMode} visible={auxVisible} onClose={() => setAuxVisible(false)} />

            {/* Clock display */}
            <div style={{
              position:      'absolute',
              left:          '109px',
              top:           '218px',
              width:         '60px',
              height:        '165px',
              zIndex:        2,
              pointerEvents: 'auto',
            }}>
              <ClockDisplay hwMode={hwMode} />
            </div>

            {/* Nav strip */}
            <div ref={navRef} style={{
              position:      'absolute',
              bottom:        '355px',
              left:          '50%',
              transform:     'translateX(-50%)',
              display:       'flex',
              flexDirection: 'row',
              gap:           '32px',
              zIndex:        10,
              pointerEvents: 'auto',
            }}>
              {['TASKS', 'FILES', 'TIMELINE', 'COMMS', 'MAP'].map(label => (
                <span
                  key={label}
                  style={{ ...navStyle, transition: 'opacity 200ms' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                  onClick={label === 'MAP' ? handleMapOpen : undefined}
                >{label}</span>
              ))}
            </div>
          </>
        )}
      </div>

      </div>{/* end zoom wrapper */}
    </div>
  );
}
