import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { XP_LEVELS, XP_EVENTS } from '../lib/xp';
import { mockTeam, getInitials } from '../lib/team';

/* ------------------------------------------------------------------ */
/*  Plan v4 §6 — Culture Hub                                          */
/*  POE hub, Operating Principles, Culture Book, XP leaderboard        */
/* ------------------------------------------------------------------ */

const CultureHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'principles' | 'leaderboard' | 'xp-guide' | 'culture-book'>('principles');

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Culture</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 24px 0' }}>Culture</h1>

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: '32px' }}>
          {([['principles', 'Operating Principles'], ['leaderboard', 'XP Leaderboard'], ['xp-guide', 'XP Guide'], ['culture-book', 'Culture Book']] as const).map(([key, label]) => (
            <Pill key={key} label={label} active={tab === key} onClick={() => setTab(key)} />
          ))}
        </div>

        {tab === 'principles' && <PrinciplesTab />}
        {tab === 'leaderboard' && <LeaderboardTab navigate={navigate} />}
        {tab === 'xp-guide' && <XPGuideTab />}
        {tab === 'culture-book' && <CultureBookTab />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Operating Principles (§4E)                                         */
/* ------------------------------------------------------------------ */

const PRINCIPLES = [
  { title: 'Keep Externalities in Perspective', translation: 'Focus on controllables. Don\'t spiral on market noise.', trait: 'Resilience' },
  { title: 'If It Doesn\'t Make Sense, Don\'t Do It', translation: 'Push back with evidence + alternative. Never nod along.', trait: 'Conviction' },
  { title: 'Tackle Problems Head On', translation: 'Flag issues same day. Bring proposed solution alongside problem.', trait: 'Vulnerability' },
  { title: 'Set Teammates Up for Success', translation: 'Clear briefs. Clean handovers. Don\'t hoard process.', trait: 'Passion' },
  { title: 'Develop or Die', translation: 'Weekly 1:1s. Goals updated monthly. POE entries every cycle.', trait: 'Curiosity' },
];

const PrinciplesTab: React.FC = () => (
  <div className="flex flex-col gap-4">
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>
      Five Operating Principles + Five Traits of a SCRIB3r. These define how we work.
    </p>
    {PRINCIPLES.map((p, i) => (
      <div key={i} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>{p.title}</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.12)', border: '1px solid rgba(215,171,197,0.3)' }}>
            {p.trait}
          </span>
        </div>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.6, margin: 0, opacity: 0.7 }}>{p.translation}</p>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  XP Leaderboard (§Phase 7C preview)                                 */
/* ------------------------------------------------------------------ */

const LeaderboardTab: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const sorted = [...mockTeam].sort((a, b) => b.xp - a.xp);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '24px' }}>
        Monthly XP leaderboard — celebrate top contributors. Lifetime total tracked separately.
      </p>

      {/* Podium */}
      <div className="flex gap-4 justify-center" style={{ marginBottom: '32px' }}>
        {top3.map((m, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div key={m.id} onClick={() => navigate(`/team/${m.id}`)} className="flex flex-col items-center" style={{ cursor: 'pointer', padding: '20px 24px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', minWidth: '160px', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '28px', marginBottom: '8px' }}>{medals[i]}</span>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '16px' }}>{getInitials(m.name)}</span>
              </div>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{m.name}</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{m.title}</span>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '20px', marginTop: '8px' }}>{m.xp} XP</span>
            </div>
          );
        })}
      </div>

      {/* Rest */}
      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
        {rest.map((m, i) => (
          <div key={m.id} className="flex items-center" style={{ padding: '10px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <span style={{ width: '8%', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.4 }}>#{i + 4}</span>
            <span style={{ width: '30%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{m.name}</span>
            <span style={{ width: '25%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{m.title}</span>
            <span style={{ width: '15%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{m.unit}</span>
            <span style={{ width: '22%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textAlign: 'right' }}>{m.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  XP Guide                                                           */
/* ------------------------------------------------------------------ */

const XPGuideTab: React.FC = () => (
  <div className="flex flex-col gap-6">
    <div>
      <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>Levels</h3>
      <div className="flex gap-3 flex-wrap">
        {XP_LEVELS.map((l) => (
          <div key={l.level} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '16px 20px', minWidth: '140px' }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{l.badge}</span>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', display: 'block' }}>{l.name}</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>
              {l.minXp} — {l.maxXp === Infinity ? '∞' : l.maxXp} XP
            </span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>XP Events</h3>
      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
        {XP_EVENTS.map((ev) => (
          <div key={ev.type} className="flex items-center justify-between" style={{ padding: '10px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{ev.label}</span>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', color: '#D7ABC5' }}>+{ev.xp}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.35, marginTop: '12px' }}>
        XP does NOT award for: logging in, time spent, or anything that can be gamed by spamming low-effort actions.
      </p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Culture Book (rendered from PDF content)                           */
/* ------------------------------------------------------------------ */

const CULTURE_SECTIONS = [
  { title: 'Get Lit', content: 'Passion is the foundation. If you\'re not excited about the problem, you can\'t create great work. Get Lit means bringing energy, curiosity, and genuine interest to every task — even the mundane ones. It\'s about finding the spark in the work and letting it drive you forward.' },
  { title: 'Communication', content: 'Say what you mean, mean what you say. Default to written, default to public channels. Over-communicate intent, under-communicate noise. Every message should make the recipient\'s life easier, not create more questions.' },
  { title: 'Effective Feedback', content: 'Lead with what\'s working. Then what could be stronger. Then specific next steps. Never "I don\'t like it" without "because" and "instead try." Feedback is a gift — give it with care, receive it with grace.' },
  { title: 'Managing Conflict', content: 'Creative disagreements are healthy — the best work survives debate. But conflict should be about the work, never the person. Disagree openly, decide together, commit fully. No side channels, no passive aggression.' },
  { title: 'Trust, Accountability & Influence', content: 'Trust is built by doing what you said you\'d do, when you said you\'d do it. Accountability isn\'t punishment — it\'s the foundation of reliability. Influence comes from consistent quality, not volume or politics.' },
];

const CultureBookTab: React.FC = () => (
  <div className="flex flex-col gap-4">
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>
      From the SCRIB3 Culture Book — the POE modules that define our standards.
    </p>
    {CULTURE_SECTIONS.map((s) => (
      <div key={s.title} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
        <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>{s.title}</h3>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.7, margin: 0, opacity: 0.7 }}>{s.content}</p>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const Pill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '6px 16px', borderRadius: '75.641px',
    border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
    cursor: 'pointer', transition: 'all 0.2s', opacity: active ? 1 : 0.6,
  }}>{label}</button>
);

export default CultureHubPage;
