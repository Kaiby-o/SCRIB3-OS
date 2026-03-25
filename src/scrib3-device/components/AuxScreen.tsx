import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../store/settings.store';
import auxDark    from '../assets/images/AUX-SCREEN-DARK.png';
import auxLight   from '../assets/images/AUX-SCREEN-LIGHT (1).png';
import benAvatar   from '../assets/avatars/bencrt 1.svg';
import iconMessage   from '../assets/icons/message.svg';
import iconCalendar  from '../assets/icons/calendar.svg';
import iconMeet      from '../assets/icons/meet.svg';
import iconDapps     from '../assets/icons/dapps.svg';
import iconBandwidth from '../assets/icons/bandwidth.svg';
import iconProjects  from '../assets/icons/projects.svg';
import iconFeedback  from '../assets/icons/feedback.svg';
import iconProfdev   from '../assets/icons/profdev.svg';

function makeOW(defaultColor: string) {
  return (size: number, opacity = 1, color = defaultColor): React.CSSProperties => ({
    fontFamily: "'OwnersWide', sans-serif",
    fontSize:   `${size}px`,
    color,
    opacity,
    lineHeight: 1.2,
  });
}

const INPUT: React.CSSProperties = {
  fontFamily:  "'OwnersWide', sans-serif",
  background:  'rgba(255,255,255,0.08)',
  border:      '1px solid rgba(215,171,197,0.4)',
  borderRadius:'3px',
  color:       '#FFFFFF',
  outline:     'none',
  padding:     '2px 6px',
  width:       '100%',
};

const DIVIDER: React.CSSProperties = {
  width:      '100%',
  height:     '1px',
  background: 'rgba(215,171,197,0.15)',
  margin:     '4px 0',
  flexShrink: 0,
};

const NAV_ICONS = [
  { key: 'message',   src: iconMessage   },
  { key: 'calendar',  src: iconCalendar  },
  { key: 'meet',      src: iconMeet      },
  { key: 'dapps',     src: iconDapps     },
  { key: 'bandwidth', src: iconBandwidth },
  { key: 'projects',  src: iconProjects  },
  { key: 'feedback',  src: iconFeedback  },
  { key: 'profdev',   src: iconProfdev   },
];

// Facebook removed — broken CDN image
const SOCIAL_ICONS = [
  { key: 'instagram', url: 'https://cdn.simpleicons.org/instagram/E3DCDC' },
  { key: 'tiktok',    url: 'https://cdn.simpleicons.org/tiktok/E3DCDC'    },
  { key: 'x',         url: 'https://cdn.simpleicons.org/x/E3DCDC'         },
  { key: 'telegram',  url: 'https://cdn.simpleicons.org/telegram/E3DCDC'  },
  { key: 'whatsapp',  url: 'https://cdn.simpleicons.org/whatsapp/E3DCDC'  },
  { key: 'youtube',   url: 'https://cdn.simpleicons.org/youtube/E3DCDC'   },
  { key: 'linkedin',  url: 'https://cdn.simpleicons.org/linkedin/E3DCDC'  },
];

const CLIENT_CIRCLES = [
  { id: 'CL1', bg: '#2a3a5c' },
  { id: 'CL2', bg: '#3d2a5c' },
  { id: 'CL3', bg: '#5c3d2a' },
  { id: 'CL4', bg: '#2a5c3d' },
  { id: 'CL5', bg: '#5c2a3d' },
];

const PROJECT_CARDS = [
  { label: 'SCR 001', dot: '#2a3a5c' },
  { label: 'CF 001',  dot: '#3d2a5c' },
  { label: 'CF 004',  dot: '#5c3d2a' },
  { label: 'RSK 002', dot: '#2a5c3d' },
];

interface AuxScreenProps {
  bgMode:        'dark' | 'light';
  hwMode:        'dark' | 'light';
  visible:       boolean;
  onClose:       () => void;
  isOwnProfile?: boolean;
}

function useClock() {
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const [time, setTime] = useState(() => fmt(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function AuxScreen({
  hwMode,
  visible,
  onClose,
  isOwnProfile = true,
}: AuxScreenProps) {
  const { aesthetic } = useSettingsStore();
  const isClean = aesthetic === 'clean';
  const isDarkHw = hwMode === 'dark';
  const labelColor = isClean ? (isDarkHw ? '#E8E0E0' : '#3A3035') : '#D7ABC5';
  const textPrimary = isClean ? (isDarkHw ? '#E8E0E0' : '#3A3035') : '#FFFFFF';
  const textDim = isClean ? (isDarkHw ? 'rgba(232,224,224,0.6)' : 'rgba(58,48,53,0.6)') : 'rgba(255,255,255,0.75)';
  const barGlow = isClean ? 'none' : '0 0 6px #D7ABC5';
  const OW = makeOW(textPrimary);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [hoverNav,  setHoverNav]  = useState<string | null>(null);
  const [hoverSoc,  setHoverSoc]  = useState<string | null>(null);
  const [profileName, setProfileName] = useState('Ben Lydiat');
  const [profileRole, setProfileRole] = useState('VP of Creative');
  const [profileBio,  setProfileBio]  = useState('Placeholder bio text. Add a short description of your role, focus areas, and working style.');
  const time = useClock();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (visible) {
      el.style.display = 'block';
      el.animate(
        [
          { transform: 'translateY(-50%) translateX(-100%) scaleX(0.05)', opacity: '0' },
          { transform: 'translateY(-50%) translateX(0%)    scaleX(1)',    opacity: '1' },
        ],
        { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
      );
    } else {
      const anim = el.animate(
        [
          { transform: 'translateY(-50%) translateX(0%)    scaleX(1)',    opacity: '1' },
          { transform: 'translateY(-50%) translateX(-100%) scaleX(0.05)', opacity: '0' },
        ],
        { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
      );
      anim.onfinish = () => { el.style.display = 'none'; };
    }
  }, [visible]);

  return (
    <div
      ref={wrapRef}
      style={{
        position:        'absolute',
        width:           '480px',
        height:          '640px',
        left:            'calc(50% + 390px - 90px)',
        top:             '50%',
        transform:       'translateY(-50%)',
        transformOrigin: 'left center',
        zIndex:          -1,
        display:         'none',
        pointerEvents:   'auto',
      }}
    >
      <style>{`
        .aux-scroll::-webkit-scrollbar { display: none; }
        .aux-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Background — PNG or neumorphic surface */}
      {isClean ? (
        <div style={{
          position:     'absolute',
          top:          0,
          left:         0,
          width:        '100%',
          height:       '100%',
          background:   hwMode === 'dark' ? '#333' : '#E3DCDC',
          borderRadius: '24px',
          boxShadow:    hwMode === 'dark'
            ? '4px 4px 10px rgba(0,0,0,0.35), -4px -4px 10px rgba(255,255,255,0.02)'
            : '4px 4px 10px rgba(0,0,0,0.06), -4px -4px 10px rgba(255,255,255,0.5)',
          transition:   'background 300ms, box-shadow 300ms',
        }} />
      ) : (
        <img
          src={hwMode === 'dark' ? auxDark : auxLight}
          alt=""
          draggable={false}
          style={{
            position:   'absolute',
            top:        0,
            left:       0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            userSelect: 'none',
          }}
        />
      )}

      {/* Scrollable content layer */}
      <div
        className="aux-scroll"
        style={{
          position:      'absolute',
          top:           '65px',
          left:          '98px',
          right:         '64px',
          bottom:        '80px',
          overflowY:     'auto',
          overflowX:     'hidden',
          display:       'flex',
          flexDirection: 'column',
          gap:           0,
          zIndex:        1,
        }}
      >

        {/* ── SECTION 1 — Icon nav bar ── */}
        <div style={{
          display:        'flex',
          flexDirection:  'row',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '8px 12px',
          marginBottom:   '8px',
          borderBottom:   '1px solid rgba(215,171,197,0.2)',
          flexShrink:     0,
        }}>
          {NAV_ICONS.map(({ key, src }) => (
            <img
              key={key}
              src={src}
              alt={key}
              draggable={false}
              onClick={() => {
                setActiveNav(k => k === key ? null : key);
                console.log(`nav: ${key} clicked`);
              }}
              onMouseEnter={() => setHoverNav(key)}
              onMouseLeave={() => setHoverNav(null)}
              style={{
                width:      '22px',
                height:     '22px',
                cursor:     'pointer',
                filter:     activeNav === key || hoverNav === key
                              ? 'brightness(0) invert(1) opacity(1)'
                              : 'brightness(0) invert(1) opacity(0.5)',
                transition: 'filter 150ms',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* ── SECTION 2 — Profile header ── */}
        <div style={{
          display:       'flex',
          flexDirection: 'row',
          gap:           '14px',
          padding:       '12px',
          alignItems:    'flex-start',
          position:      'relative',
          flexShrink:    0,
        }}>

          {/* XP block — absolute top-right */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', textAlign: 'right' }}>
            <div style={OW(9, 0.6, labelColor)}>XP</div>
            <div style={OW(10, 1, labelColor)}>050 / 999</div>
          </div>

          {/* Left — avatar + edit/save button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <img
              src={benAvatar}
              alt="avatar"
              draggable={false}
              style={{ width: '72px', height: '72px', borderRadius: '6px', display: 'block' }}
            />
            {isOwnProfile && (
              <div
                onClick={() => setIsEditing(e => !e)}
                style={{
                  ...OW(9, 1, labelColor),
                  cursor:          'pointer',
                  marginTop:       '4px',
                  textAlign:       'center',
                  background:      isEditing ? 'rgba(215,171,197,0.15)' : 'transparent',
                  border:          isEditing ? '1px solid rgba(215,171,197,0.4)' : '1px solid transparent',
                  borderRadius:    '3px',
                  padding:         '2px 6px',
                  transition:      'background 150ms',
                }}
              >{isEditing ? 'SAVE' : '✎ EDIT'}</div>
            )}
          </div>

          {/* Right — identity block */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '48px' }}>

            {/* Name */}
            {isEditing ? (
              <input
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                style={{ ...INPUT, fontSize: '13px' }}
              />
            ) : (
              <div style={OW(15)}>{profileName}</div>
            )}

            {/* Role */}
            {isEditing ? (
              <input
                value={profileRole}
                onChange={e => setProfileRole(e.target.value)}
                style={{ ...INPUT, fontSize: '10px' }}
              />
            ) : (
              <div style={OW(10, 0.75)}>{profileRole}</div>
            )}

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#44ff88', fontSize: '10px', lineHeight: 1 }}>●</span>
              <span style={OW(10, 0.6)}>online</span>
            </div>

            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={OW(13)}>{time}</span>
              <span style={OW(8, 0.4)}>local time</span>
              <span style={OW(8, 0.4)}>WEST UTC+1</span>
            </div>

            {/* Bandwidth bar */}
            <div style={{ marginTop: '4px' }}>
              <div style={OW(9, 0.6, labelColor)}>BANDWIDTH</div>
              <div style={{
                width:        '100%',
                height:       '5px',
                background:   'rgba(255,255,255,0.12)',
                borderRadius: '3px',
                marginTop:    '4px',
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
        </div>

        <div style={DIVIDER} />

        {/* ── SECTION 3 — Bio ── */}
        <div style={{ padding: '10px 12px', flexShrink: 0 }}>
          <div style={{ ...OW(9, 1, labelColor), fontWeight: 'bold', marginBottom: '6px' }}>BIO</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>

            {/* Bio text */}
            {isEditing ? (
              <textarea
                value={profileBio}
                onChange={e => setProfileBio(e.target.value)}
                rows={4}
                style={{ ...INPUT, fontSize: '8px', lineHeight: 1.6, resize: 'none', flex: 1 }}
              />
            ) : (
              <div style={{ flex: 1, ...OW(8, 0.65), lineHeight: 1.6 }}>{profileBio}</div>
            )}

            {/* Social icons grid */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 17px)',
              gap:                 '6px',
              flexShrink:          0,
            }}>
              {SOCIAL_ICONS.map(({ key, url }) => (
                <img
                  key={key}
                  src={url}
                  alt={key}
                  draggable={false}
                  onMouseEnter={() => setHoverSoc(key)}
                  onMouseLeave={() => setHoverSoc(null)}
                  style={{
                    width:      '17px',
                    height:     '17px',
                    cursor:     'pointer',
                    opacity:    hoverSoc === key ? 1 : 0.5,
                    transition: 'opacity 150ms',
                  }}
                />
              ))}
            </div>

          </div>
        </div>

        <div style={DIVIDER} />

        {/* ── SECTION 4 — Current Clients ── */}
        <div style={{ padding: '10px 12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={OW(9, 1, labelColor)}>CURRENT CLIENTS</span>
            <span style={{ ...OW(9, 1, textDim), cursor: 'pointer' }}>more &gt;</span>
          </div>
          {/* TODO: replace with real client data from Supabase */}
          <div style={{
            display:       'flex',
            flexDirection: 'row',
            gap:           '10px',
            marginTop:     '8px',
            flexWrap:      'wrap',
          }}>
            {CLIENT_CIRCLES.map(({ id, bg }) => (
              <div
                key={id}
                style={{
                  width:          '38px',
                  height:         '38px',
                  borderRadius:   '50%',
                  background:     bg,
                  cursor:         'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}
              >
                <span style={OW(8)}>{id}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={DIVIDER} />

        {/* ── SECTION 5 — Current Projects ── */}
        <div style={{ padding: '10px 12px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={OW(9, 1, labelColor)}>CURRENT PROJECTS</span>
            <span style={{ ...OW(9, 1, textDim), cursor: 'pointer' }}>more &gt;</span>
          </div>
          {/* TODO: replace with real project data from Supabase */}
          <div style={{
            display:       'flex',
            flexDirection: 'row',
            gap:           '10px',
            marginTop:     '8px',
            flexWrap:      'wrap',
          }}>
            {PROJECT_CARDS.map(({ label, dot }) => (
              <div key={label} style={{ width: '60px', cursor: 'pointer' }}>
                <div style={{
                  position:       'relative',
                  width:          '40px',
                  height:         '50px',
                  background:     'rgba(255,255,255,0.08)',
                  borderRadius:   '3px 8px 3px 3px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  padding:        '6px',
                }}>
                  <div style={{
                    position:     'absolute',
                    top:          0,
                    right:        0,
                    width:        '14px',
                    height:       '14px',
                    background:   'rgba(215,171,197,0.3)',
                    borderRadius: '0 8px 0 3px',
                  }} />
                  <div style={{
                    position:     'absolute',
                    bottom:       '5px',
                    right:        '5px',
                    width:        '7px',
                    height:       '7px',
                    borderRadius: '50%',
                    background:   dot,
                  }} />
                  <span style={{ ...OW(9), textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
