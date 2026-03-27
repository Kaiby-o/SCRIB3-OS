import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Plan v4 §3G — Pre-Alignment Framework (Nick)                      */
/*  Every project requires completion before any production work.      */
/*  Status = "Blocked — alignment incomplete" until all fields filled. */
/* ------------------------------------------------------------------ */

interface PreAlignmentChecklist {
  productionLead: string;
  creativeLead: string;
  accountLead: string;
  executors: string;           // who is executing + specific tasks
  doneDefinition: string;      // what does "done" look like
  timeline: string;            // timeline with milestones
  inScope: string;             // linked to SOW
  notInScope: string;          // explicit exclusions
  approvalChain: string;       // who signs off at each stage
  whereEverythingLives: string; // Drive / Linear / Slack links
}

interface FiveBulletBrief {
  objective: string;
  tone: string;
  audience: string;
  constraints: string;
  successCriteria: string;
}

interface ComprehensionLoop {
  reflectionText: string;
  reflectedBy: string;
  confirmedByBriefer: boolean;
}

const defaultChecklist: PreAlignmentChecklist = {
  productionLead: '',
  creativeLead: '',
  accountLead: '',
  executors: '',
  doneDefinition: '',
  timeline: '',
  inScope: '',
  notInScope: '',
  approvalChain: '',
  whereEverythingLives: '',
};

const defaultBrief: FiveBulletBrief = {
  objective: '',
  tone: '',
  audience: '',
  constraints: '',
  successCriteria: '',
};

const defaultLoop: ComprehensionLoop = {
  reflectionText: '',
  reflectedBy: '',
  confirmedByBriefer: false,
};

const CHECKLIST_FIELDS: { key: keyof PreAlignmentChecklist; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: 'productionLead', label: 'Production Lead', placeholder: 'Single named person — owns the output' },
  { key: 'creativeLead', label: 'Creative Lead', placeholder: 'Who is directing the creative?' },
  { key: 'accountLead', label: 'Account Lead', placeholder: 'Who owns the client relationship?' },
  { key: 'executors', label: 'Who is executing?', placeholder: 'Each person + their specific tasks', multiline: true },
  { key: 'doneDefinition', label: 'What does "done" look like?', placeholder: 'Explicit deliverable definition', multiline: true },
  { key: 'timeline', label: 'Timeline with milestones', placeholder: 'Key dates and checkpoints', multiline: true },
  { key: 'inScope', label: 'What is IN scope?', placeholder: 'Linked to SOW section — be specific', multiline: true },
  { key: 'notInScope', label: 'What is NOT in scope?', placeholder: 'List explicitly — prevents scope creep', multiline: true },
  { key: 'approvalChain', label: 'Approval chain', placeholder: 'Who signs off at each stage?', multiline: true },
  { key: 'whereEverythingLives', label: 'Where does everything live?', placeholder: 'Drive folder / Linear board / Slack channel links', multiline: true },
];

const BRIEF_FIELDS: { key: keyof FiveBulletBrief; label: string; number: number; placeholder: string }[] = [
  { key: 'objective', label: 'Objective', number: 1, placeholder: 'What is this trying to achieve?' },
  { key: 'tone', label: 'Tone', number: 2, placeholder: 'How should it feel?' },
  { key: 'audience', label: 'Audience', number: 3, placeholder: 'Who specifically is this for?' },
  { key: 'constraints', label: 'Constraints', number: 4, placeholder: 'Hard limits (platform specs, legal, brand rules, deadlines)' },
  { key: 'successCriteria', label: 'Success Criteria', number: 5, placeholder: 'How do we know it\'s done and done well?' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const PreAlignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [checklist, setChecklist] = useState<PreAlignmentChecklist>(defaultChecklist);
  const [brief, setBrief] = useState<FiveBulletBrief>(defaultBrief);
  const [loop, setLoop] = useState<ComprehensionLoop>(defaultLoop);
  const [submitted, setSubmitted] = useState(false);

  const updateCL = (k: keyof PreAlignmentChecklist, v: string) =>
    setChecklist((prev) => ({ ...prev, [k]: v }));
  const updateBrief = (k: keyof FiveBulletBrief, v: string) =>
    setBrief((prev) => ({ ...prev, [k]: v }));

  const checklistComplete = CHECKLIST_FIELDS.every((f) => checklist[f.key].trim().length > 0);
  const briefComplete = BRIEF_FIELDS.every((f) => brief[f.key].trim().length > 0);
  const loopComplete = loop.reflectionText.trim().length > 0 && loop.confirmedByBriefer;
  const allComplete = checklistComplete && briefComplete && loopComplete && projectName.trim().length > 0;

  const completionCount = [
    ...CHECKLIST_FIELDS.map((f) => checklist[f.key].trim().length > 0),
    ...BRIEF_FIELDS.map((f) => brief[f.key].trim().length > 0),
    loop.reflectionText.trim().length > 0,
    loop.confirmedByBriefer,
  ].filter(Boolean).length;
  const totalFields = CHECKLIST_FIELDS.length + BRIEF_FIELDS.length + 2;

  const handleSubmit = () => {
    console.log('[pre-alignment] Submitted:', { projectName, projectCode, clientName, checklist, brief, loop });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '36px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", marginBottom: '16px' }}>
          Alignment Complete
        </h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>
          {projectName} ({projectCode}) is cleared for production.
        </p>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.4, marginBottom: '32px' }}>
          Status updated: Blocked → Ready for Production
        </p>
        <div className="flex gap-3">
          <PillBtn label="Dashboard" onClick={() => navigate('/dashboard')} />
          <PillBtn label="New Alignment" onClick={() => { setSubmitted(false); setChecklist(defaultChecklist); setBrief(defaultBrief); setLoop(defaultLoop); setProjectName(''); setProjectCode(''); setClientName(''); }} secondary />
        </div>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          Pre-Alignment Framework
        </span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '760px', margin: '0 auto' }}>
        {/* Title + progress */}
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>
            Pre-Alignment
          </h1>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', opacity: 0.5 }}>
            {completionCount} / {totalFields} complete
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{ width: `${(completionCount / totalFields) * 100}%`, height: '100%', background: allComplete ? '#27AE60' : '#D7ABC5', borderRadius: 2, transition: `width 0.3s ${easing}` }} />
        </div>

        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '32px' }}>
          Every project requires completion before any production work begins. Status = "Blocked — alignment incomplete" until all fields are filled.
        </p>

        {/* Project basics */}
        <Section title="Project">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <FormLabel>Project Name</FormLabel>
              <Input value={projectName} onChange={setProjectName} placeholder="e.g. Rootstock Q2 Campaign" />
            </div>
            <div style={{ width: '160px' }} className="flex flex-col gap-1">
              <FormLabel>Code</FormLabel>
              <Input value={projectCode} onChange={setProjectCode} placeholder="RSK-005" />
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <FormLabel>Client</FormLabel>
            <Input value={clientName} onChange={setClientName} placeholder="Client name" />
          </div>
        </Section>

        {/* Pre-Alignment Checklist */}
        <Section title="Pre-Alignment Checklist" badge={checklistComplete ? '✓ Complete' : `${CHECKLIST_FIELDS.filter((f) => checklist[f.key].trim()).length}/${CHECKLIST_FIELDS.length}`}>
          {CHECKLIST_FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <CheckDot filled={checklist[f.key].trim().length > 0} />
                <FormLabel>{f.label}</FormLabel>
              </div>
              {f.multiline ? (
                <Textarea value={checklist[f.key]} onChange={(v) => updateCL(f.key, v)} placeholder={f.placeholder} />
              ) : (
                <Input value={checklist[f.key]} onChange={(v) => updateCL(f.key, v)} placeholder={f.placeholder} />
              )}
            </div>
          ))}
        </Section>

        {/* Five-Bullet Brief */}
        <Section title="Five-Bullet Brief" badge={briefComplete ? '✓ Complete' : `${BRIEF_FIELDS.filter((f) => brief[f.key].trim()).length}/5`}>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, marginBottom: '16px' }}>
            Mandatory before any creative task begins. Each bullet must be answered.
          </p>
          {BRIEF_FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', width: 22, textAlign: 'center', opacity: brief[f.key].trim() ? 1 : 0.3 }}>
                  {f.number}
                </span>
                <FormLabel>{f.label}</FormLabel>
              </div>
              <Textarea value={brief[f.key]} onChange={(v) => updateBrief(f.key, v)} placeholder={f.placeholder} />
            </div>
          ))}
        </Section>

        {/* Comprehension Loop */}
        <Section title="Comprehension Loop" badge={loopComplete ? '✓ Complete' : 'Pending'}>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, marginBottom: '16px' }}>
            Recipient reflects back understanding before work starts. Briefer must respond same working day.
          </p>
          <div className="flex flex-col gap-1" style={{ marginBottom: '12px' }}>
            <FormLabel>Recipient's reflection</FormLabel>
            <Textarea value={loop.reflectionText} onChange={(v) => setLoop((prev) => ({ ...prev, reflectionText: v }))} placeholder="In my understanding, the deliverable is... The key constraints are... I'll focus on..." />
          </div>
          <div className="flex flex-col gap-1" style={{ marginBottom: '12px' }}>
            <FormLabel>Reflected by</FormLabel>
            <Input value={loop.reflectedBy} onChange={(v) => setLoop((prev) => ({ ...prev, reflectedBy: v }))} placeholder="Team member name" />
          </div>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer', padding: '8px 0' }}>
            <div
              style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid var(--border-default)', background: loop.confirmedByBriefer ? '#D7ABC5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `background 0.15s ${easing}` }}
              onClick={() => setLoop((prev) => ({ ...prev, confirmedByBriefer: !prev.confirmedByBriefer }))}
            >
              {loop.confirmedByBriefer && <span style={{ color: '#000', fontSize: '12px' }}>✓</span>}
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>
              Briefer confirms understanding is correct
            </span>
          </label>
        </Section>

        {/* Submit */}
        <div className="flex items-center justify-between" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '0.733px solid var(--border-default)' }}>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: allComplete ? 1 : 0.4 }}>
            {allComplete ? '✓ All sections complete — ready for production' : 'Complete all sections to unlock production'}
          </span>
          <PillBtn
            label={allComplete ? 'Confirm Alignment' : 'Incomplete'}
            onClick={allComplete ? handleSubmit : () => {}}
            accent={allComplete}
            secondary={!allComplete}
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Micro-components                                                   */
/* ------------------------------------------------------------------ */

const Section: React.FC<{ title: string; badge?: string; children: React.ReactNode }> = ({ title, badge, children }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '28px', marginBottom: '20px' }}>
    <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
      <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', margin: 0 }}>
        {title}
      </h2>
      {badge && (
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, padding: '3px 10px', borderRadius: '75.641px', border: '1px solid var(--border-default)' }}>
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{children}</span>
);

const Input: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', color: 'var(--text-primary)', outline: 'none', width: '100%' }} />
);

const Textarea: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', width: '100%' }} />
);

const CheckDot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid', borderColor: filled ? '#27AE60' : 'var(--border-default)', background: filled ? '#27AE60' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: `all 0.15s ${easing}` }}>
    {filled && <span style={{ color: '#fff', fontSize: '9px', lineHeight: 1 }}>✓</span>}
  </div>
);

const PillBtn: React.FC<{ label: string; onClick: () => void; secondary?: boolean; accent?: boolean }> = ({ label, onClick, secondary, accent }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '10px 24px', borderRadius: '75.641px',
    border: secondary ? '1px solid var(--border-default)' : 'none',
    background: accent ? '#D7ABC5' : secondary ? 'transparent' : '#000',
    color: accent ? '#000' : secondary ? 'var(--text-primary)' : '#EAF2D7',
    cursor: accent || !secondary ? 'pointer' : 'default',
    opacity: secondary && !accent ? 0.4 : 1,
    transition: `opacity 0.2s ${easing}`,
  }}
    onMouseEnter={(e) => { if (accent || !secondary) e.currentTarget.style.opacity = '0.8'; }}
    onMouseLeave={(e) => { e.currentTarget.style.opacity = secondary && !accent ? '0.4' : '1'; }}>
    {label}
  </button>
);

export default PreAlignmentPage;
