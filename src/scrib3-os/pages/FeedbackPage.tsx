import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useAuthStore } from '../hooks/useAuth';
import { mockTeam } from '../lib/team';

/* ------------------------------------------------------------------ */
/*  Feedback & Professional Development Hub                            */
/*  Based on Notion PD Hub structure                                   */
/*  Sections: Peer Reviews | Self Assessment | Feedback Log |          */
/*  Call Notes | Action Items                                          */
/* ------------------------------------------------------------------ */


// Mock data
interface PeerReview {
  id: string;
  reviewerName: string;
  revieweeName: string;
  status: 'nominated' | 'in_progress' | 'submitted';
  cycle: string;
  submittedAt: string | null;
}

interface FeedbackEntry {
  id: string;
  fromName: string;
  toName: string;
  type: 'praise' | 'development';
  content: string;
  context: string;
  createdAt: string;
  isRepeated: boolean;
}

interface CallNote {
  id: string;
  date: string;
  participants: string;
  agenda: string;
  summary: string;
  actionItems: string[];
  recordingUrl: string;
}

interface ActionItem {
  id: string;
  title: string;
  source: string;
  status: 'pending' | 'in_progress' | 'complete';
  dueDate: string;
  linkedGoal: string | null;
}

const OPERATING_PRINCIPLES = [
  'Keep Externalities in Perspective',
  "If It Doesn't Make Sense, Don't Do It",
  'Tackle Problems Head On',
  'Set Teammates Up for Success',
  'Develop or Die',
];

const mockReviews: PeerReview[] = [
  { id: 'pr-1', reviewerName: 'Kevin Moran', revieweeName: 'Ben Lydiat', status: 'submitted', cycle: 'Q1 2026', submittedAt: '2026-03-20' },
  { id: 'pr-2', reviewerName: 'Elena Zheng', revieweeName: 'Ben Lydiat', status: 'in_progress', cycle: 'Q1 2026', submittedAt: null },
  { id: 'pr-3', reviewerName: 'Ben Lydiat', revieweeName: 'Kevin Moran', status: 'nominated', cycle: 'Q1 2026', submittedAt: null },
];

const mockFeedback: FeedbackEntry[] = [
  { id: 'fb-1', fromName: 'Sixtyne Perez', toName: 'Ben Lydiat', type: 'praise', content: 'Exceptional work driving the SCRIB3-OS build. The pace and quality of output has been remarkable.', context: 'SCRIB3-OS Sprint', createdAt: '2026-03-27', isRepeated: false },
  { id: 'fb-2', fromName: 'Nick Mitchell', toName: 'Ben Lydiat', type: 'development', content: 'Consider involving account leads earlier in the design process to ensure client expectations are aligned from day one.', context: 'Rootstock Brand Refresh', createdAt: '2026-03-22', isRepeated: false },
  { id: 'fb-3', fromName: 'Elena Zheng', toName: 'Ben Lydiat', type: 'praise', content: 'The pre-alignment framework you built directly addresses our biggest bottleneck. Teams are already using it.', context: 'Process Improvement', createdAt: '2026-03-18', isRepeated: false },
];

const mockCallNotes: CallNote[] = [
  { id: 'cn-1', date: '2026-03-25', participants: 'Ben, Sixtyne', agenda: '1. SOLVE: OS deployment blockers\n2. STRENGTHEN: Team onboarding flow\n3. SCALE: Professional happiness (8/10)', summary: 'Discussed deployment pipeline. Agreed to prioritise Linear integration. Ben to document onboarding process.', actionItems: ['Document onboarding process by Mar 28', 'Set up Linear webhook', 'Schedule team demo for Apr 1'], recordingUrl: '#' },
  { id: 'cn-2', date: '2026-03-18', participants: 'Ben, Nick', agenda: '1. SOLVE: Pre-alignment adoption\n2. STRENGTHEN: Client communication\n3. SCALE: Professional happiness (7/10)', summary: 'Nick emphasised need for "What Good Looks Like" examples. Agreed to seed 10 sections with real work.', actionItems: ['Seed WGLL with 7 real examples', 'Add "Why This Matters" to project pages', 'Review scope watch entries'], recordingUrl: '#' },
];

const mockActions: ActionItem[] = [
  { id: 'act-1', title: 'Document onboarding process', source: '1:1 with Sixtyne (Mar 25)', status: 'in_progress', dueDate: '2026-03-28', linkedGoal: null },
  { id: 'act-2', title: 'Involve account leads earlier in design', source: 'Feedback from Nick (Mar 22)', status: 'pending', dueDate: '2026-04-05', linkedGoal: null },
  { id: 'act-3', title: 'Seed WGLL with real examples', source: '1:1 with Nick (Mar 18)', status: 'complete', dueDate: '2026-03-22', linkedGoal: 'Quality Standards' },
];

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<'feedback' | 'peer-review' | 'self-assessment' | 'call-notes' | 'actions'>('feedback');

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Feedback</span>
        <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '24px' }}>
          Your professional development hub. Give and receive feedback, track 1:1 sessions, and turn insights into action.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: '28px' }}>
          {([['feedback', 'Feedback Log'], ['peer-review', 'Peer Reviews'], ['self-assessment', 'Self Assessment'], ['call-notes', '1:1 Notes'], ['actions', 'Action Items']] as const).map(([key, label]) => (
            <Pill key={key} label={label} active={tab === key} onClick={() => setTab(key)} />
          ))}
        </div>

        {tab === 'feedback' && <FeedbackLogTab currentUser={profile?.display_name ?? ''} />}
        {tab === 'peer-review' && <PeerReviewTab currentUser={profile?.display_name ?? ''} />}
        {tab === 'self-assessment' && <SelfAssessmentTab />}
        {tab === 'call-notes' && <CallNotesTab />}
        {tab === 'actions' && <ActionsTab />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: Feedback Log                                                  */
/* ------------------------------------------------------------------ */

const FeedbackLogTab: React.FC<{ currentUser: string }> = ({ currentUser }) => {
  const [giving, setGiving] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [fbType, setFbType] = useState<'praise' | 'development'>('praise');
  const [content, setContent] = useState('');
  const [context, setContext] = useState('');

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: 0 }}>Instant Feedback</h3>
        <button onClick={() => setGiving(!giving)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
          {giving ? 'Cancel' : '+ Give Feedback'}
        </button>
      </div>

      {giving && (
        <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '24px' }}>
          <div className="flex flex-col gap-3">
            <div>
              <Label>To</Label>
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)}
                style={{ ...selectStyle, width: '100%' }}>
                <option value="">Select teammate</option>
                {mockTeam.filter((m) => m.name !== currentUser).map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFbType('praise')} style={{ ...pillStyle, background: fbType === 'praise' ? '#27AE60' : 'transparent', color: fbType === 'praise' ? '#fff' : 'var(--text-primary)', border: fbType === 'praise' ? 'none' : '1px solid var(--border-default)' }}>Praise</button>
              <button onClick={() => setFbType('development')} style={{ ...pillStyle, background: fbType === 'development' ? '#E67E22' : 'transparent', color: fbType === 'development' ? '#fff' : 'var(--text-primary)', border: fbType === 'development' ? 'none' : '1px solid var(--border-default)' }}>Development Point</button>
            </div>
            <div>
              <Label>Feedback</Label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Be specific about what they did and the impact..." rows={3} style={textareaStyle} />
            </div>
            <div>
              <Label>Context</Label>
              <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. Rootstock Brand Refresh, Q1 Sprint..." style={inputStyle} />
            </div>
            <button onClick={() => { setGiving(false); setContent(''); setContext(''); setRecipient(''); }}
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: '#D7ABC5', color: '#000', cursor: 'pointer', alignSelf: 'flex-start' }}>
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {mockFeedback.map((fb) => (
          <div key={fb.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '16px 20px', borderLeft: `3px solid ${fb.type === 'praise' ? '#27AE60' : '#E67E22'}` }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>{fb.fromName}</span>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>→ {fb.toName}</span>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', background: fb.type === 'praise' ? 'rgba(39,174,96,0.1)' : 'rgba(230,126,34,0.1)', border: `1px solid ${fb.type === 'praise' ? 'rgba(39,174,96,0.3)' : 'rgba(230,126,34,0.3)'}` }}>
                  {fb.type}
                </span>
              </div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>{fb.createdAt}</span>
            </div>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: '0 0 4px 0' }}>{fb.content}</p>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>Context: {fb.context}</span>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: Peer Reviews                                                  */
/* ------------------------------------------------------------------ */

const PeerReviewTab: React.FC<{ currentUser: string }> = ({ currentUser }) => {
  const [nominating, setNominating] = useState(false);
  const [nominee, setNominee] = useState('');

  const statusColors: Record<string, string> = { nominated: '#F1C40F', in_progress: '#6E93C3', submitted: '#27AE60' };

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: 0 }}>Peer Reviews — Q1 2026</h3>
        <button onClick={() => setNominating(!nominating)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
          {nominating ? 'Cancel' : '+ Nominate Reviewer'}
        </button>
      </div>

      {nominating && (
        <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px', marginBottom: '20px' }}>
          <Label>Who should review you?</Label>
          <div className="flex gap-2">
            <select value={nominee} onChange={(e) => setNominee(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
              <option value="">Select a peer</option>
              {mockTeam.filter((m) => m.name !== currentUser).map((m) => <option key={m.id} value={m.name}>{m.name} — {m.title}</option>)}
            </select>
            <button onClick={() => { setNominating(false); setNominee(''); }} style={{ ...pillStyle, background: '#D7ABC5', border: 'none' }}>Send Nomination</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {mockReviews.map((r) => (
          <div key={r.id} className="flex items-center justify-between" style={{ padding: '14px 20px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px' }}>
            <div>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{r.reviewerName}</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, marginLeft: '8px' }}>reviewing {r.revieweeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', background: `${statusColors[r.status]}20`, border: `1px solid ${statusColors[r.status]}40` }}>
                {r.status.replace('_', ' ')}
              </span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>{r.cycle}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: Self Assessment                                               */
/* ------------------------------------------------------------------ */

const SelfAssessmentTab: React.FC = () => {
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(OPERATING_PRINCIPLES.map((p) => [p, 0]))
  );
  const [evidence, setEvidence] = useState<Record<string, string>>(
    Object.fromEntries(OPERATING_PRINCIPLES.map((p) => [p, '']))
  );
  const [happiness, setHappiness] = useState(7);

  return (
    <>
      <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Operating Principles Self-Rating</h3>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '24px' }}>
        Rate yourself honestly on each principle (1-5). Provide evidence. This feeds into your performance review.
      </p>

      <div className="flex flex-col gap-4" style={{ marginBottom: '32px' }}>
        {OPERATING_PRINCIPLES.map((principle) => (
          <div key={principle} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{principle}</span>
            <div className="flex items-center gap-1" style={{ marginBottom: '8px' }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setRatings({ ...ratings, [principle]: n })}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: n <= ratings[principle] ? '#D7ABC5' : 'rgba(0,0,0,0.06)', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', color: n <= ratings[principle] ? '#000' : 'var(--text-primary)', opacity: n <= ratings[principle] ? 1 : 0.3 }}>
                  {n}
                </button>
              ))}
            </div>
            <input value={evidence[principle]} onChange={(e) => setEvidence({ ...evidence, [principle]: e.target.value })}
              placeholder="Evidence: what did you do that demonstrates this?" style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px', marginBottom: '24px' }}>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Professional Happiness Scale (1-10)
        </span>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button key={n} onClick={() => setHappiness(n)}
              style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: n <= happiness ? (happiness >= 7 ? '#27AE60' : happiness >= 4 ? '#F1C40F' : '#E74C3C') : 'rgba(0,0,0,0.06)', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', color: n <= happiness ? '#fff' : 'var(--text-primary)', opacity: n <= happiness ? 1 : 0.3 }}>
              {n}
            </button>
          ))}
        </div>
        {happiness < 5 && <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', color: '#E74C3C', marginTop: '8px' }}>If your happiness is below 5, please discuss this in your next 1:1.</p>}
      </div>

      <button style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
        Submit Self Assessment
      </button>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: 1:1 Call Notes                                                */
/* ------------------------------------------------------------------ */

const CallNotesTab: React.FC = () => {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: 0 }}>1:1 Call Notes</h3>
        <button onClick={() => setAdding(!adding)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
          {adding ? 'Cancel' : '+ Add Notes'}
        </button>
      </div>

      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
        1:1 Agenda structure: SOLVE (main blocker) → STRENGTHEN (development area) → SCALE (happiness 1-10) → Topics → Start/Stop/Continue
      </p>

      {adding && (
        <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '24px' }}>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div style={{ flex: 1 }}><Label>Date</Label><input type="date" style={inputStyle} /></div>
              <div style={{ flex: 1 }}><Label>Participants</Label><input placeholder="e.g. Ben, Sixtyne" style={inputStyle} /></div>
            </div>
            <div><Label>Agenda</Label><textarea rows={3} placeholder="1. SOLVE:\n2. STRENGTHEN:\n3. SCALE (happiness):\n4. Topics:" style={textareaStyle} /></div>
            <div><Label>Summary</Label><textarea rows={2} placeholder="Key takeaways..." style={textareaStyle} /></div>
            <div><Label>Recording URL (Fathom)</Label><input placeholder="https://fathom.video/..." style={inputStyle} /></div>
            <div><Label>Action Items (one per line)</Label><textarea rows={2} placeholder="Action item 1\nAction item 2" style={textareaStyle} /></div>
            <button onClick={() => setAdding(false)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: '#D7ABC5', color: '#000', cursor: 'pointer', alignSelf: 'flex-start' }}>Save Notes</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {mockCallNotes.map((cn) => (
          <div key={cn.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{cn.date}</span>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{cn.participants}</span>
              </div>
              {cn.recordingUrl !== '#' && (
                <a href={cn.recordingUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, textDecoration: 'underline' }}>Recording</a>
              )}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Label>Agenda</Label>
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', opacity: 0.6 }}>{cn.agenda}</p>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Label>Summary</Label>
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, margin: 0, opacity: 0.7 }}>{cn.summary}</p>
            </div>
            <div>
              <Label>Action Items</Label>
              {cn.actionItems.map((ai, i) => (
                <div key={i} className="flex items-center gap-2" style={{ padding: '4px 0' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: '1px solid var(--border-default)', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{ai}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: Action Items                                                  */
/* ------------------------------------------------------------------ */

const ActionsTab: React.FC = () => {
  const statusColors: Record<string, string> = { pending: '#F1C40F', in_progress: '#6E93C3', complete: '#27AE60' };

  return (
    <>
      <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Action Items</h3>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
        Actions generated from feedback, 1:1 sessions, and self assessments. Complete these to level up.
      </p>

      <div className="flex flex-col gap-3">
        {mockActions.map((a) => (
          <div key={a.id} className="flex items-center justify-between" style={{ padding: '14px 20px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', display: 'block' }}>{a.title}</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, display: 'block', marginTop: '2px' }}>Source: {a.source}</span>
              {a.linkedGoal && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#D7ABC5', display: 'block', marginTop: '2px' }}>Goal: {a.linkedGoal}</span>}
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>Due: {a.dueDate}</span>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', background: `${statusColors[a.status]}20`, border: `1px solid ${statusColors[a.status]}40` }}>
                {a.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>{children}</span>
);

const Pill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '6px 16px', borderRadius: '75.641px',
    border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
    cursor: 'pointer', opacity: active ? 1 : 0.6,
  }}>{label}</button>
);

const inputStyle: React.CSSProperties = { fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', color: '#000', outline: 'none' };
const textareaStyle: React.CSSProperties = { fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px', color: '#000', outline: 'none', resize: 'vertical' };
const selectStyle: React.CSSProperties = { fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', color: '#000', outline: 'none', cursor: 'pointer', appearance: 'none' as const };
const pillStyle: React.CSSProperties = { fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: '75.641px', cursor: 'pointer' };

export default FeedbackPage;
