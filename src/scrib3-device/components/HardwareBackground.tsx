import iconDarkBg  from '../assets/images/DARKBG.svg';
import iconLightBg from '../assets/images/LIGHTBG.svg';
import iconDarkHw  from '../assets/images/DARKHW.svg';
import iconLightHw from '../assets/images/LIGHTHW.svg';

type Mode = 'dark' | 'light';

interface HardwareBackgroundProps {
  bgMode:       Mode;
  hwMode:       Mode;
  cartridgeStyle?: React.CSSProperties;  // reserved for caller use
  tabStyle?:       React.CSSProperties;  // reserved for caller use
  showToggles?:    boolean;
  onBgToggle?:  () => void;
  onHwToggle?:  () => void;
}

export default function HardwareBackground({
  bgMode,
  hwMode,
  cartridgeStyle: _cartridgeStyle,
  tabStyle: _tabStyle,
  showToggles = false,
  onBgToggle,
  onHwToggle,
}: HardwareBackgroundProps) {
  return (
    <>
      {/* Background colour fill */}
      <div style={{
        position:   'fixed',
        inset:      0,
        background: bgMode === 'dark' ? '#282828' : '#E3DCDC',
        zIndex:     -1,
        transition: 'background 300ms',
      }} />

      {/* Toggle icons */}
      {showToggles && (
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
            onClick={onBgToggle}
            style={{ width: '32px', height: 'auto', cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          />
          <img
            src={hwMode === 'dark' ? iconDarkHw : iconLightHw}
            alt="Toggle hardware"
            onClick={onHwToggle}
            style={{ width: '32px', height: 'auto', cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          />
        </div>
      )}
    </>
  );
}
