import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { XP_LEVELS, XP_EVENTS } from '../lib/xp';
import { mockTeam, getInitials } from '../lib/team';

/* ------------------------------------------------------------------ */
/*  Plan v4 §6 — Culture Hub                                          */
/*  POE hub, Operating Principles, Culture Book, XP leaderboard        */
/* ------------------------------------------------------------------ */

const CultureHubPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'principles' | 'leaderboard' | 'xp-guide' | 'culture-book' | 'poe'>('principles');

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

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '24px' : '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 24px 0' }}>Culture</h1>

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: '32px' }}>
          {([['principles', 'Operating Principles'], ['leaderboard', 'XP Leaderboard'], ['xp-guide', 'XP Guide'], ['culture-book', 'Culture Book'], ['poe', 'Proof of Excellence']] as const).map(([key, label]) => (
            <Pill key={key} label={label} active={tab === key} onClick={() => setTab(key)} />
          ))}
        </div>

        {tab === 'principles' && <PrinciplesTab />}
        {tab === 'leaderboard' && <LeaderboardTab navigate={navigate} />}
        {tab === 'xp-guide' && <XPGuideTab />}
        {tab === 'culture-book' && <CultureBookTab />}
        {tab === 'poe' && <ProofOfExcellenceTab />}
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
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}><div style={{ minWidth: '700px' }}>
      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
        {rest.map((m, i) => (
          <div key={m.id} onClick={() => navigate(`/team/${m.id}`)} className="flex items-center" style={{ padding: '10px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <span style={{ width: '8%', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.4 }}>#{i + 4}</span>
            <span style={{ width: '30%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{m.name}</span>
            <span style={{ width: '25%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{m.title}</span>
            <span style={{ width: '15%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{m.unit}</span>
            <span style={{ width: '22%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textAlign: 'right' }}>{m.xp} XP</span>
          </div>
        ))}
      </div>
      </div></div>
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

const BOOK_PAGES = [
  { type: 'cover' as const, title: 'SCRIB3\nCulture Book', subtitle: 'The principles, standards, and values that define how we work.' },
  ...CULTURE_SECTIONS.map((s) => ({ type: 'content' as const, title: s.title, content: s.content })),
  { type: 'back' as const, title: 'End of Book', subtitle: 'These principles are living documents. Suggest additions via #culture or your 1:1.' },
];

const CultureBookTab: React.FC = () => {
  const [spread, setSpread] = useState(0); // each spread = 2 pages
  const totalSpreads = Math.ceil(BOOK_PAGES.length / 2);

  const leftPage = BOOK_PAGES[spread * 2] ?? null;
  const rightPage = BOOK_PAGES[spread * 2 + 1] ?? null;

  return (
    <div>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '24px', textAlign: 'center' }}>
        From the SCRIB3 Culture Book — the POE modules that define our standards.
      </p>

      <div className="flex items-center justify-center gap-4" style={{ marginBottom: '24px' }}>
        {/* Left arrow */}
        <button onClick={() => setSpread((s) => Math.max(0, s - 1))} disabled={spread === 0}
          style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border-default)', background: 'transparent', cursor: spread === 0 ? 'default' : 'pointer', opacity: spread === 0 ? 0.15 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Book spread — two portrait pages */}
        <div className="flex" style={{ border: '0.733px solid var(--border-default)', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', maxWidth: '800px', width: '100%' }}>
          {/* Left page */}
          <div style={{ flex: 1, minHeight: '500px', padding: '40px 32px', background: '#fff', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: leftPage?.type === 'cover' ? 'center' : 'flex-start', alignItems: leftPage?.type === 'cover' ? 'center' : 'stretch' }}>
            {leftPage ? (
              leftPage.type === 'cover' || leftPage.type === 'back' ? (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', lineHeight: 1.1, color: '#000', whiteSpace: 'pre-line', marginBottom: '16px' }}>{leftPage.title}</h2>
                  {'subtitle' in leftPage && <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', color: '#000', opacity: 0.5, maxWidth: '280px', margin: '0 auto' }}>{leftPage.subtitle}</p>}
                </div>
              ) : (
                <>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#D7ABC5', marginBottom: '20px' }}>SCRIB3 Culture Book</span>
                  <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '22px', textTransform: 'uppercase', color: '#000', lineHeight: 1.1, marginBottom: '20px' }}>{leftPage.title}</h3>
                  {'content' in leftPage && <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.8, color: '#000', opacity: 0.7, margin: 0 }}>{leftPage.content}</p>}
                </>
              )
            ) : (
              <div style={{ flex: 1 }} />
            )}
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3, marginTop: 'auto', textAlign: 'center', color: '#000' }}>{spread * 2 + 1}</span>
          </div>

          {/* Right page */}
          <div style={{ flex: 1, minHeight: '500px', padding: '40px 32px', background: '#fafaf5', display: 'flex', flexDirection: 'column', justifyContent: rightPage?.type === 'back' ? 'center' : 'flex-start', alignItems: rightPage?.type === 'back' ? 'center' : 'stretch' }}>
            {rightPage ? (
              rightPage.type === 'cover' || rightPage.type === 'back' ? (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', textTransform: 'uppercase', lineHeight: 1.1, color: '#000', marginBottom: '16px' }}>{rightPage.title}</h2>
                  {'subtitle' in rightPage && <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', color: '#000', opacity: 0.5, maxWidth: '280px', margin: '0 auto' }}>{rightPage.subtitle}</p>}
                </div>
              ) : (
                <>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#D7ABC5', marginBottom: '20px' }}>SCRIB3 Culture Book</span>
                  <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '22px', textTransform: 'uppercase', color: '#000', lineHeight: 1.1, marginBottom: '20px' }}>{rightPage.title}</h3>
                  {'content' in rightPage && <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.8, color: '#000', opacity: 0.7, margin: 0 }}>{rightPage.content}</p>}
                </>
              )
            ) : (
              <div style={{ flex: 1 }} />
            )}
            {rightPage && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3, marginTop: 'auto', textAlign: 'center', color: '#000' }}>{spread * 2 + 2}</span>}
          </div>
        </div>

        {/* Right arrow */}
        <button onClick={() => setSpread((s) => Math.min(totalSpreads - 1, s + 1))} disabled={spread >= totalSpreads - 1}
          style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border-default)', background: 'transparent', cursor: spread >= totalSpreads - 1 ? 'default' : 'pointer', opacity: spread >= totalSpreads - 1 ? 0.15 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Page indicator */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: totalSpreads }, (_, i) => (
          <button key={i} onClick={() => setSpread(i)}
            style={{ width: spread === i ? 20 : 6, height: 6, borderRadius: 3, background: spread === i ? '#D7ABC5' : 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Proof of Excellence                                                */
/* ------------------------------------------------------------------ */

interface POEEntry {
  id: string;
  category: string;
  title: string;
  description: string;
  submittedBy: string;
  date: string;
  clientRecognition?: boolean;
}

const POE_CATEGORIES = [
  'Client Facilitation', 'Communication', 'Brief Writing', 'Content Strategy',
  'Social Content', 'Animation / Motion', 'Brand Work', 'Campaign Concepting',
  'PR Pitch', 'Account Management',
];

const mockPOE: POEEntry[] = [
  { id: 'poe-1', category: 'Brand Work', title: 'Rootstock Brand Refresh Phase 2', description: 'Delivered comprehensive brand refresh across all touchpoints — developer portal, social templates, presentation decks. Client described it as "the best brand work we\'ve ever received."', submittedBy: 'Kevin Moran', date: '2026-03-20', clientRecognition: true },
  { id: 'poe-2', category: 'Content Strategy', title: 'BENJI Content Series Framework', description: 'Created a 6-month content framework for Franklin Templeton\'s BENJI token. Content pillars mapped to audience journey stages. Series outperformed engagement benchmarks by 40%.', submittedBy: 'Samantha Kelly', date: '2026-03-15', clientRecognition: true },
  { id: 'poe-3', category: 'Client Facilitation', title: 'Canton Scope Negotiation', description: 'Successfully navigated weekend content request from Canton. Used approved scope watch response, maintained relationship while protecting team bandwidth.', submittedBy: 'Elena Zheng', date: '2026-03-18' },
  { id: 'poe-4', category: 'Communication', title: 'Pre-Alignment Framework Launch', description: 'Designed and launched the 17-field pre-alignment checklist now used for all new projects. Reduced scope creep incidents by eliminating ambiguous project starts.', submittedBy: 'Ben Lydiat', date: '2026-03-10' },
  { id: 'poe-5', category: 'Animation / Motion', title: 'Cardano Explainer Series', description: 'Produced 4 explainer animations for Cardano Q1 campaign. Each under 60 seconds, each communicating complex technical concepts accessibly. All approved first round.', submittedBy: 'Tolani Daniel', date: '2026-03-22', clientRecognition: true },
];

const ProofOfExcellenceTab: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const filtered = filter === 'all' ? mockPOE : mockPOE.filter((p) => p.category === filter);

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Proof of Excellence</h3>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, margin: 0 }}>
            Real examples of exceptional work. Submit your own or nominate a teammate. +20 XP per entry.
          </p>
        </div>
        <button onClick={() => setSubmitting(!submitting)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer', flexShrink: 0 }}>
          {submitting ? 'Cancel' : '+ Submit POE'}
        </button>
      </div>

      {submitting && (
        <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '24px' }}>
          <div className="flex flex-col gap-3">
            <div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Category</span>
              <select style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', width: '100%', outline: 'none', cursor: 'pointer', appearance: 'none' as const }}>
                {POE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Title</span>
              <input placeholder="Brief title of the work" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', outline: 'none' }} />
            </div>
            <div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Description</span>
              <textarea rows={3} placeholder="What was the challenge, what did you do, what was the impact?" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px', outline: 'none', resize: 'vertical' }} />
            </div>
            <button onClick={() => setSubmitting(false)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: '#D7ABC5', color: '#000', cursor: 'pointer', alignSelf: 'flex-start' }}>
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: '20px' }}>
        <Pill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        {POE_CATEGORIES.slice(0, 6).map((c) => (
          <Pill key={c} label={c} active={filter === c} onClick={() => setFilter(filter === c ? 'all' : c)} />
        ))}
      </div>

      {/* POE entries */}
      <div className="flex flex-col gap-3">
        {filtered.map((poe) => (
          <div key={poe.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px', borderLeft: poe.clientRecognition ? '3px solid #27AE60' : undefined }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{poe.title}</span>
                {poe.clientRecognition && (
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27AE60' }}>
                    Client Recognition
                  </span>
                )}
              </div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>{poe.date}</span>
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>{poe.category}</span>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px 0', opacity: 0.7 }}>{poe.description}</p>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>Submitted by {poe.submittedBy}</span>
          </div>
        ))}
      </div>
    </>
  );
};

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
