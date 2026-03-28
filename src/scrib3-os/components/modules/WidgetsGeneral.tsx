// ===== New Dashboard Widgets — General & Creative =====

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProjects, projectStatusColors } from '../../lib/projects';
import { mockTeam, getInitials } from '../../lib/team';

/* Shared micro-components */
const L: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{children}</span>
);
const V: React.FC<{ children: React.ReactNode; lg?: boolean }> = ({ children, lg }) => (
  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: lg ? '36px' : '22px', lineHeight: 1, textTransform: 'uppercase' }}>{children}</span>
);
const R: React.FC<{ left: React.ReactNode; right?: React.ReactNode; muted?: boolean }> = ({ left, right, muted }) => (
  <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', opacity: muted ? 0.5 : 1 }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{left}</span>
    {right && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, flexShrink: 0, marginLeft: 8 }}>{right}</span>}
  </div>
);
const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, marginRight: 6 }} />
);
const Bar: React.FC<{ pct: number; color?: string }> = ({ pct, color = '#000' }) => (
  <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', flex: 1, maxWidth: 80 }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
  </div>
);

/* ===== G1 — Clock & Weather ===== */
export const ClockWeatherContent: React.FC = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const h = now.getHours();
  return (
    <div className="flex flex-col gap-2">
      <div style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', lineHeight: 1 }}>{time}</div>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5 }}>{date}</span>
      <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
        <span style={{ fontSize: '18px' }}>{h >= 6 && h < 20 ? '☀️' : '🌙'}</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>{tz}</span>
      </div>
      <div className="flex gap-4" style={{ marginTop: 2 }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.35 }}>↑ 06:42</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.35 }}>↓ 19:18</span>
      </div>
    </div>
  );
};

/* ===== G2 — Quick Links ===== */
export const QuickLinksContent: React.FC = () => {
  const nav = useNavigate();
  const links = [
    { label: 'Chat', route: '/chat' }, { label: 'Tasks', route: '/tasks' }, { label: 'Projects', route: '/projects' },
    { label: 'Bandwidth', route: '/bandwidth' }, { label: 'Feedback', route: '/feedback' }, { label: 'Settings', route: '/settings' },
    { label: 'Culture', route: '/culture' }, { label: 'Finance', route: '/finance' }, { label: 'Tools', route: '/tools' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
      {links.map((l) => (
        <button key={l.label} onClick={() => nav(l.route)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '10px 4px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.1)', background: 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
          {l.label}
        </button>
      ))}
    </div>
  );
};

/* ===== G3 — Announcements ===== */
export const AnnouncementsContent: React.FC = () => {
  const announcements = [
    { name: 'Sixtyne Perez', msg: 'Q1 performance reviews are open — complete your self-assessment by Apr 5.', time: '2h ago' },
    { name: 'Ben Lydiat', msg: 'SCRIB3-OS v2 is live. Please explore and report any issues.', time: '1d ago' },
    { name: 'Nick Mitchell', msg: 'Pre-alignment is now mandatory for all new projects.', time: '3d ago' },
  ];
  return (
    <div className="flex flex-col gap-3">
      {announcements.map((a, i) => {
        const member = mockTeam.find((m) => m.name === a.name);
        return (
          <div key={i} className="flex gap-2" style={{ borderBottom: i < 2 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', paddingBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {member?.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '10px' }}>{getInitials(a.name)}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}>{a.name}</span>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', opacity: 0.35 }}>{a.time}</span>
              </div>
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', lineHeight: 1.4, margin: 0, opacity: 0.7 }}>{a.msg}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ===== G4 — Recent Activity ===== */
export const RecentActivityContent: React.FC = () => (
  <div className="flex flex-col gap-0">
    <R left="Ben updated Rootstock Brand Refresh" right="2m ago" />
    <R left="Elena approved scope change — Canton" right="18m ago" />
    <R left="Kevin uploaded brand assets" right="1h ago" />
    <R left="Sixtyne completed Q1 review" right="3h ago" />
    <R left="Omar submitted bandwidth estimate" right="5h ago" muted />
  </div>
);

/* ===== G5 — Upcoming Events ===== */
export const UpcomingEventsContent: React.FC = () => {
  const events = [
    { name: 'Cardano QBR', date: 'Apr 2', days: 5 },
    { name: 'FT Contract Renewal', date: 'Apr 10', days: 13 },
    { name: 'Rootstock Sprint Review', date: 'Apr 5', days: 8 },
    { name: 'Team All-Hands', date: 'Apr 1', days: 4 },
  ];
  return (
    <div className="flex flex-col gap-0">
      {events.map((e) => (
        <R key={e.name} left={<><Dot color={e.days <= 5 ? '#E74C3C' : '#6E93C3'} />{e.name}</>} right={`${e.date} · ${e.days}d`} />
      ))}
    </div>
  );
};

/* ===== G7 — Search ===== */
export const SearchContent: React.FC = () => {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const results = q.length >= 2 ? [
    ...mockTeam.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((m) => ({ label: m.name, route: `/team/${m.id}`, type: 'Team' })),
    ...mockProjects.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((p) => ({ label: `${p.code} — ${p.title}`, route: `/projects/${p.code}`, type: 'Project' })),
  ] : [];
  return (
    <div className="flex flex-col gap-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team, clients, projects..."
        style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '75.641px', padding: '8px 14px', outline: 'none', width: '100%' }} />
      {results.map((r) => (
        <button key={r.route} onClick={() => nav(r.route)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', opacity: 0.7 }}>
          <span style={{ fontSize: '9px', opacity: 0.4, textTransform: 'uppercase', marginRight: 6 }}>{r.type}</span>{r.label}
        </button>
      ))}
    </div>
  );
};

/* ===== C1 — My Projects Widget ===== */
export const MyProjectsWidgetContent: React.FC = () => {
  const active = mockProjects.filter((p) => p.status === 'Active' || p.status === 'In Progress');
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V>{active.length}</V><L>my projects</L></div>
      {active.slice(0, 4).map((p) => (
        <R key={p.id} left={<><Dot color={projectStatusColors[p.status]} />{p.code} — {p.title}</>} right={p.status} />
      ))}
    </div>
  );
};

/* ===== C2 — Task Queue Widget ===== */
export const TaskQueueWidgetContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-2"><V>12</V><L>tasks pending</L></div>
    <R left="Review brand guidelines v3" right="Today" />
    <R left="Submit token copy to legal" right="Today" />
    <R left="Wireframe mobile navigation" right="Tomorrow" />
    <R left="Update style guide colours" right="Mar 30" />
    <R left="Prepare client presentation" right="Apr 1" muted />
  </div>
);

/* ===== C3 — Deliverable Tracker ===== */
export const DeliverableTrackerContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex gap-4 mb-2">
      <div className="flex flex-col gap-1"><V>4</V><L>in review</L></div>
      <div className="flex flex-col gap-1"><V>7</V><L>approved</L></div>
      <div className="flex flex-col gap-1"><V>2</V><L>revision</L></div>
    </div>
    <R left="Logo concepts — Round 2" right="Review" />
    <R left="Landing page mockup" right="Review" />
    <R left="Social templates v3" right="Revision" />
  </div>
);

/* ===== C4 — Brand Quick Ref ===== */
export const BrandQuickRefContent: React.FC = () => (
  <div className="flex flex-col gap-2">
    <L>Cardano</L>
    <div className="flex gap-2 mt-1">
      {['#0033AD', '#1A44B8', '#F5F5F5', '#000000'].map((c) => (
        <div key={c} style={{ width: 24, height: 24, borderRadius: 4, background: c, border: '0.5px solid rgba(0,0,0,0.1)' }} />
      ))}
    </div>
    <div><span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>Font:</span> <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px' }}>Chivo</span></div>
    <div><span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>Tone:</span> <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px' }}>Technical, confident, accessible</span></div>
  </div>
);

/* ===== C5 — Content Calendar ===== */
export const ContentCalendarContent: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const items = [
    { day: 'Mon', label: 'Blog: Staking Guide', client: 'Cardano' },
    { day: 'Tue', label: 'Social: Thread', client: 'FT' },
    { day: 'Wed', label: 'Newsletter', client: 'Rootstock' },
    { day: 'Thu', label: 'Motion: Explainer', client: 'Cardano' },
    { day: 'Fri', label: 'Social: Recap', client: 'Canton' },
  ];
  return (
    <div className="flex flex-col gap-1">
      <L>this week</L>
      {days.map((d) => {
        const item = items.find((i) => i.day === d);
        return <R key={d} left={<><span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '10px', fontWeight: 800, width: 28, display: 'inline-block' }}>{d}</span>{item?.label ?? '—'}</>} right={item?.client} />;
      })}
    </div>
  );
};

/* ===== C7 — Culture Snippet ===== */
export const CultureSnippetContent: React.FC = () => {
  const snippets = [
    { title: 'Keep Externalities in Perspective', text: 'Focus on controllables. Don\'t spiral on market noise.' },
    { title: 'Set Teammates Up for Success', text: 'Clear briefs. Clean handovers. Don\'t hoard process.' },
    { title: 'Tackle Problems Head On', text: 'Flag issues same day. Bring proposed solution alongside problem.' },
  ];
  const [idx] = useState(() => Math.floor(Math.random() * snippets.length));
  const s = snippets[idx];
  return (
    <div>
      <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{s.title}</span>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, margin: 0, opacity: 0.6 }}>{s.text}</p>
    </div>
  );
};

export { L, V, R, Dot, Bar };
