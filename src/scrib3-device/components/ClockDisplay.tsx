import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settings.store';

import calendarIcon from '../assets/images/Icon_Calendar.svg';
import speechIcon   from '../assets/images/Icon_speech.svg';

const DAYS  = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function pad(n: number) { return n.toString().padStart(2, '0'); }

export default function ClockDisplay({ hwMode = 'dark' }: { hwMode?: 'dark' | 'light' }) {
  const { aesthetic } = useSettingsStore();
  const isClean = aesthetic === 'clean';
  const isDark = hwMode === 'dark';
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const textColor = isClean
    ? (isDark ? '#E8E0E0' : '#3A3035')
    : '#E3DCDC';
  const glow: React.CSSProperties = isClean
    ? { color: textColor, textShadow: 'none', lineHeight: 1 }
    : { color: '#E3DCDC', textShadow: '0 0 8px rgba(227,220,220,0.9), 0 0 16px rgba(227,220,220,0.4)', lineHeight: 1 };
  const iconFilter = isClean
    ? (isDark ? 'brightness(0) invert(1) opacity(0.7)' : 'brightness(0) opacity(0.5)')
    : 'drop-shadow(0 0 4px rgba(215,171,197,0.8))';
  const dividerColor = isClean
    ? (isDark ? 'rgba(232,224,224,0.15)' : 'rgba(58,48,53,0.15)')
    : 'rgba(215,171,197,0.2)';

  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const day  = DAYS[now.getDay()];
  const date = `${pad(now.getDate())} ${MONTHS[now.getMonth()]}`;

  return (
    <div style={{
      display:         'flex',
      flexDirection:   'column',
      justifyContent:  'flex-start',
      gap:             '1px',
      alignItems:      'flex-start',
      width:           '60px',
      height:          '165px',
      padding:         '6px 4px 6px',
      boxSizing:       'border-box',
    }}>

      <div style={{
        ...glow,
        fontFamily:   "'Jersey 15', monospace",
        fontSize:     '22px',
        letterSpacing:'0.02em',
        width:        '100%',
        textAlign:    'center',
        whiteSpace:   'nowrap',
      }}>
        {time}
      </div>

      <div style={{
        ...glow,
        fontFamily:   "'Jersey 10', monospace",
        fontSize:     '32px',
        letterSpacing:'0.06em',
        width:        '100%',
        textAlign:    'center',
        whiteSpace:   'nowrap',
      }}>
        {day}
      </div>

      <div style={{
        ...glow,
        fontFamily:   "'Jersey 10', monospace",
        fontSize:     '18px',
        letterSpacing:'0.06em',
        width:        '100%',
        textAlign:    'center',
        whiteSpace:   'nowrap',
      }}>
        {date}
      </div>

      <div style={{ width: '100%', height: '1px', background: dividerColor }} />

      <div style={{ display: 'flex', gap: '4px', width: '100%', justifyContent: 'center' }}>
        <img
          src={calendarIcon}
          alt="Calendar"
          style={{
            width: '24px', height: '24px', filter: iconFilter,
            cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          onClick={() => console.log('calendar')}
        />
        <img
          src={speechIcon}
          alt="Comms"
          style={{
            width: '24px', height: '24px', filter: iconFilter,
            cursor: 'pointer', opacity: 0.7, transition: 'opacity 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          onClick={() => console.log('comms')}
        />
      </div>

    </div>
  );
}
