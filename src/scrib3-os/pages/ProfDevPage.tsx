import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { mockTeam, getInitials } from '../lib/team';

/* ------------------------------------------------------------------ */
/*  Plan v4 §2D — Professional Development System — Layer 1            */
/*  Individual Tracker (member-facing, semi-private)                   */
/*  Source template: Stef's tracker                                    */
/* ------------------------------------------------------------------ */

/* Mock PD data */
interface Goal { id: string; title: string; type: string; targetDate: string; status: string }
interface POE { id: string; date: string; description: string; client: string; type: string }
interface OPRating { principle: string; selfRating: number; evidence: string }
interface Feedback { id: string; date: string; type: 'praise' | 'development'; content: string; context: string }

const mockGoals: Goal[] = [
  { id: 'g1', title: 'Complete Figma certification', type: 'Course', targetDate: '2026-04-30', status: 'In Progress' },
  { id: 'g2', title: 'Lead a brand pitch independently', type: 'Stretch', targetDate: '2026-06-01', status: 'Not Started' },
  { id: 'g3', title: 'Improve turnaround time to <48h on revisions', type: 'SMART', targetDate: '2026-03-31', status: 'Complete' },
];

const mockPOE: POE[] = [
  { id: 'p1', date: '2026-03-15', description: 'Delivered Rootstock brand refresh 3 days ahead of deadline — client called it "best work they\'d seen"', client: 'Rootstock', type: 'Client Recognition' },
  { id: 'p2', date: '2026-02-28', description: 'Developed reusable Figma component library — reduced design time by ~30% across team', client: 'SCRIB3', type: 'Internal Win' },
  { id: 'p3', date: '2026-02-10', description: 'Completed advanced typography course — applied learnings to Cardano campaign immediately', client: 'Cardano', type: 'Skill Milestone' },
];

const OPERATING_PRINCIPLES = [
  'Keep Externalities in Perspective',
  'If It Doesn\'t Make Sense Don\'t Do It',
  'Tackle Problems Head On',
  'Set Teammates Up for Success',
  'Develop or Die',
];

const mockOPRatings: OPRating[] = OPERATING_PRINCIPLES.map((p, i) => ({
  principle: p,
  selfRating: [4, 3, 5, 4, 3][i],
  evidence: ['Stayed focused during market downturn', 'Pushed back on scope creep for Canton', 'Flagged Rootstock risk same day', 'Created shared component library', 'Enrolled in Figma cert'][i],
}));

const mockFeedback: Feedback[] = [
  { id: 'f1', date: '2026-03-18', type: 'praise', content: 'Exceptional work on the Rootstock refresh — your attention to typographic detail was noticed by the client.', context: 'Rootstock brand refresh delivery' },
  { id: 'f2', date: '2026-03-05', type: 'development', content: 'Consider involving the account lead earlier in the revision process — it would prevent last-minute scope questions.', context: 'Cardano Q1 campaign revisions' },
  { id: 'f3', date: '2026-02-20', type: 'praise', content: 'The component library you built is saving the whole team time. Great initiative.', context: 'Internal tooling contribution' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ProfDevPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const member = mockTeam.find((m) => m.id === id);
  const [activeTab, setActiveTab] = useState<'goals' | 'poe' | 'principles' | 'feedback'>('goals');

  if (!member) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Member Not Found</h1>
        <button onClick={() => navigate('/team')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: '#000', marginTop: '24px', padding: '10px 24px', border: '0.733px solid #000', borderRadius: '75.641px', background: 'transparent', cursor: 'pointer' }}>
          &larr; Team Directory
        </button>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate(`/team/${member.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          Professional Development — {member.name}
        </span>
        <button onClick={() => navigate(`/team/${member.id}`)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Profile
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center gap-4" style={{ marginBottom: '32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '20px' }}>{getInitials(member.name)}</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>
              {member.name}
            </h1>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5 }}>Professional Development Tracker</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2" style={{ marginBottom: '28px' }}>
          {([['goals', 'Goals & Courses'], ['poe', 'Proof of Excellence'], ['principles', 'Operating Principles'], ['feedback', 'Instant Feedback']] as const).map(([key, label]) => (
            <Pill key={key} label={label} active={activeTab === key} onClick={() => setActiveTab(key)} />
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'poe' && <POETab />}
        {activeTab === 'principles' && <PrinciplesTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: Goals & Courses                                               */
/* ------------------------------------------------------------------ */

const GoalsTab: React.FC = () => (
  <>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
      SMART enforced: Specific / Measured / Achievable / Relevant / Time-bound
    </p>
    <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
      {mockGoals.map((g) => (
        <div key={g.id} className="flex items-center" style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div style={{ width: '45%' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{g.title}</span>
          </div>
          <div style={{ width: '15%' }}>
            <TypeBadge type={g.type} />
          </div>
          <div style={{ width: '20%' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.6 }}>{g.targetDate}</span>
          </div>
          <div style={{ width: '20%' }}>
            <StatusBadge status={g.status} />
          </div>
        </div>
      ))}
    </div>
  </>
);

/* ------------------------------------------------------------------ */
/*  Tab: Proof of Excellence                                           */
/* ------------------------------------------------------------------ */

const POETab: React.FC = () => (
  <>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
      Evidence of quality work. Added by manager, peer, or self (manager validates).
    </p>
    <div className="flex flex-col gap-3">
      {mockPOE.map((p) => (
        <div key={p.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px 24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <TypeBadge type={p.type} />
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{p.date}</span>
          </div>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px 0' }}>
            {p.description}
          </p>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>Client: {p.client}</span>
        </div>
      ))}
    </div>
  </>
);

/* ------------------------------------------------------------------ */
/*  Tab: Operating Principles                                          */
/* ------------------------------------------------------------------ */

const PrinciplesTab: React.FC = () => (
  <>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
      Quarterly self-assessment. Five Traits of a SCRIB3r: Passion · Curiosity · Vulnerability · Conviction · Resilience
    </p>
    <div className="flex flex-col gap-3">
      {mockOPRatings.map((op) => (
        <div key={op.principle} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px 24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
              {op.principle}
            </span>
            <RatingDots rating={op.selfRating} />
          </div>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.6, margin: 0 }}>
            {op.evidence}
          </p>
        </div>
      ))}
    </div>
  </>
);

const RatingDots: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <div key={n} style={{ width: 10, height: 10, borderRadius: '50%', background: n <= rating ? '#D7ABC5' : 'rgba(0,0,0,0.1)' }} />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Tab: Instant Feedback                                              */
/* ------------------------------------------------------------------ */

const FeedbackTab: React.FC = () => (
  <>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
      Real-time feedback — praise and development points. Logged immediately, reviewed in 1:1s.
    </p>
    <div className="flex flex-col gap-3">
      {mockFeedback.map((f) => (
        <div key={f.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px 24px', borderLeft: `3px solid ${f.type === 'praise' ? '#27AE60' : '#E67E22'}` }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <TypeBadge type={f.type === 'praise' ? 'Praise' : 'Development Point'} />
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{f.date}</span>
          </div>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px 0' }}>
            {f.content}
          </p>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>Context: {f.context}</span>
        </div>
      ))}
    </div>
  </>
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

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '3px 10px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.12)', border: '1px solid rgba(215,171,197,0.3)',
  }}>
    {type}
  </span>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color = status === 'Complete' ? '#27AE60' : status === 'In Progress' ? '#6E93C3' : '#95A5A6';
  return (
    <span style={{
      fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: '75.641px', background: `${color}15`, border: `1px solid ${color}40`,
    }}>
      {status}
    </span>
  );
};

export default ProfDevPage;
