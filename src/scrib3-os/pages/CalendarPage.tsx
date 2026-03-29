import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';

/* ------------------------------------------------------------------ */
/*  Calendar Page — Month view + Calls Today + Upcoming Events         */
/* ------------------------------------------------------------------ */

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  joinUrl?: string;
  isPD?: boolean;
}

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function offsetDate(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const mockEvents: CalendarEvent[] = [
  { date: todayStr, time: '10:00', title: 'PD Call with Elena', joinUrl: '#', isPD: true },
  { date: todayStr, time: '14:00', title: 'Cardano Weekly Sync', joinUrl: '#' },
  { date: todayStr, time: '16:30', title: 'Team Standup', joinUrl: '#' },
  { date: offsetDate(1), time: '09:30', title: 'Franklin Templeton Review' },
  { date: offsetDate(1), time: '15:00', title: 'Content Calendar Planning' },
  { date: offsetDate(2), time: '11:00', title: 'Rootstock Brand Check-in', isPD: true },
  { date: offsetDate(3), time: '10:00', title: 'PD Call with Marcus', isPD: true },
  { date: offsetDate(3), time: '14:00', title: 'Client Onboarding — Lisk' },
  { date: offsetDate(4), time: '13:00', title: 'SCRIB3 All Hands' },
  { date: offsetDate(5), time: '10:00', title: 'Cardano Content Review' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d.getTime() - new Date(todayStr + 'T00:00:00').getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [toast, setToast] = useState('');

  const weeks = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const todayCalls = mockEvents.filter((e) => e.date === todayStr);
  const upcomingDates = [...new Set(mockEvents.filter((e) => e.date > todayStr).map((e) => e.date))].sort().slice(0, 5);
  const eventDatesInMonth = new Set(
    mockEvents
      .filter((e) => {
        const d = new Date(e.date + 'T00:00:00');
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
      })
      .map((e) => new Date(e.date + 'T00:00:00').getDate())
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const isToday = (day: number | null) =>
    day !== null && viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="flex items-center justify-between" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Calendar</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
        <BurgerButton />
      </header>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 28px', borderRadius: '75.641px', background: '#000', color: '#EAF2D7', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {toast}
        </div>
      )}

      {/* Content */}
      <div style={{ paddingTop: '105px', padding: isMobile ? '105px 16px 40px' : '105px 40px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '24px' : '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>Calendar</h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '32px' }}>
          {MONTH_NAMES[viewMonth]} {viewYear} &middot; {todayCalls.length} calls today
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '32px' }}>
          {/* Left — Month Grid */}
          <div>
            {/* Month nav */}
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <button onClick={prevMonth} style={navBtnStyle}>&larr;</button>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={navBtnStyle}>&rarr;</button>
            </div>

            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, padding: '8px 0' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {week.map((day, di) => (
                  <div key={di} style={{
                    textAlign: 'center', padding: '12px 0', fontFamily: "'Owners Wide', sans-serif", fontSize: '14px',
                    borderRadius: '8px', position: 'relative',
                    background: isToday(day) ? '#D7ABC5' : 'transparent',
                    color: isToday(day) ? '#000' : day ? 'var(--text-primary)' : 'transparent',
                    fontWeight: isToday(day) ? 700 : 400,
                    cursor: day ? 'default' : 'default',
                  }}>
                    {day ?? ''}
                    {day !== null && eventDatesInMonth.has(day) && !isToday(day) && (
                      <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#D7ABC5' }} />
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Connect Google Calendar */}
            <button onClick={() => showToast('Google Calendar OAuth required')} style={{
              marginTop: '28px', width: '100%', padding: '14px', borderRadius: '75.641px',
              border: '0.733px solid var(--border-default)', background: 'transparent',
              fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
              color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', opacity: 0.7,
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}>
              Connect Google Calendar
            </button>
          </div>

          {/* Right — Calls Today + Upcoming */}
          <div>
            {/* Calls Today */}
            <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Calls Today</h2>
              {todayCalls.length === 0 ? (
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.4 }}>No calls scheduled</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {todayCalls.map((evt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: '0.733px solid var(--border-default)' }}>
                      <div>
                        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, letterSpacing: '1px' }}>{evt.time}</span>
                        <div style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', marginTop: '2px' }}>{evt.title}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {evt.isPD && (
                          <button onClick={() => navigate('/pd/me')} style={{
                            fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                            padding: '4px 10px', borderRadius: '75.641px', border: '1px solid #6E93C340', background: '#6E93C315',
                            color: '#6E93C3', cursor: 'pointer',
                          }}>
                            Link to PD
                          </button>
                        )}
                        {evt.joinUrl && (
                          <a href={evt.joinUrl} style={{
                            fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                            padding: '4px 14px', borderRadius: '75.641px', background: '#D7ABC5', color: '#000',
                            textDecoration: 'none', fontWeight: 600,
                          }}>
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
              <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Upcoming</h2>
              {upcomingDates.length === 0 ? (
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.4 }}>No upcoming events</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {upcomingDates.map((dateStr) => {
                    const dayEvents = mockEvents.filter((e) => e.date === dateStr);
                    return (
                      <div key={dateStr}>
                        <div style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, marginBottom: '8px' }}>
                          {formatDateLabel(dateStr)}
                        </div>
                        {dayEvents.map((evt, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < dayEvents.length - 1 ? '0.733px solid var(--border-default)' : 'none' }}>
                            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, minWidth: '40px' }}>{evt.time}</span>
                            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', flex: 1 }}>{evt.title}</span>
                            {evt.isPD && (
                              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', border: '1px solid #6E93C340', color: '#6E93C3' }}>PD</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PD Integration */}
            <div style={{ marginTop: '24px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
              <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>PD Integration</h2>
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, margin: '0 0 12px 0' }}>
                Calls tagged with PD can be linked to your development tracker.
              </p>
              {mockEvents.filter((e) => e.isPD).map((evt, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '0.733px solid var(--border-default)' }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{evt.title}</span>
                  <button onClick={() => navigate('/pd/me')} style={{
                    fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                    padding: '4px 12px', borderRadius: '75.641px', border: '1px solid #6E93C340', background: 'transparent',
                    color: '#6E93C3', cursor: 'pointer',
                  }}>
                    Link to PD
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const navBtnStyle: React.CSSProperties = {
  fontFamily: "'Owners Wide', sans-serif", fontSize: '16px', background: 'none', border: '0.733px solid var(--border-default)',
  borderRadius: '75.641px', padding: '6px 16px', cursor: 'pointer', color: 'var(--text-primary)', transition: 'opacity 0.2s',
};

export default CalendarPage;
