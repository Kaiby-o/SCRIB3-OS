import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { supabaseInsert } from '../hooks/useSupabase';

/* ------------------------------------------------------------------ */
/*  Onboarding phases (mirrors DEVICE journey: Dating → Signing →     */
/*  Onboarding → Doing the Work)                                       */
/* ------------------------------------------------------------------ */

const PHASES = [
  { key: 'discovery', label: 'Discovery', sublabel: 'Dating' },
  { key: 'agreement', label: 'Agreement', sublabel: 'Signing' },
  { key: 'setup', label: 'Setup', sublabel: 'Onboarding' },
  { key: 'kickoff', label: 'Kickoff', sublabel: 'Doing the Work' },
] as const;

type Phase = (typeof PHASES)[number]['key'];

/* ------------------------------------------------------------------ */
/*  Form state                                                         */
/* ------------------------------------------------------------------ */

interface OnboardForm {
  // Discovery
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  projectBrief: string;
  referralSource: string;
  // Agreement
  engagementType: string;
  estimatedBudget: string;
  msaStatus: string;
  sowStatus: string;
  // Setup
  slackChannel: string;
  notionHub: string;
  driveFolder: string;
  accountLead: string;
  // Kickoff
  kickoffDate: string;
  firstDeliverable: string;
  milestones: string;
  notes: string;
}

const defaultForm: OnboardForm = {
  companyName: '',
  contactName: '',
  contactEmail: '',
  industry: '',
  projectBrief: '',
  referralSource: '',
  engagementType: 'retainer',
  estimatedBudget: '',
  msaStatus: 'pending',
  sowStatus: 'pending',
  slackChannel: '',
  notionHub: '',
  driveFolder: '',
  accountLead: 'Ben Lydiatt',
  kickoffDate: '',
  firstDeliverable: '',
  milestones: '',
  notes: '',
};

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ClientOnboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState<Phase>('discovery');
  const [form, setForm] = useState<OnboardForm>(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  const phaseIndex = PHASES.findIndex((p) => p.key === currentPhase);

  const update = (field: keyof OnboardForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => {
    if (phaseIndex < PHASES.length - 1) {
      setCurrentPhase(PHASES[phaseIndex + 1].key);
    }
  };

  const prev = () => {
    if (phaseIndex > 0) {
      setCurrentPhase(PHASES[phaseIndex - 1].key);
    }
  };

  const handleSubmit = async () => {
    const slug = form.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { error } = await supabaseInsert('client_profiles', {
      slug,
      company_name: form.companyName,
      industry: form.industry,
      contract_type: form.engagementType === 'retainer' ? 'Monthly Remit' : form.engagementType === 'project' ? 'One Time' : 'As-Needed',
      contract_start: form.kickoffDate || null,
      onboarding_complete: false,
      notes: form.projectBrief,
    });
    if (error) console.error('[client-onboard] Insert failed:', error);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1
          style={{
            fontFamily: "'Kaio', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            textTransform: 'uppercase',
            fontFeatureSettings: "'ordn' 1, 'dlig' 1",
            marginBottom: '16px',
          }}
        >
          Client Created
        </h1>
        <p
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '14px',
            letterSpacing: '0.8px',
            opacity: 0.6,
            marginBottom: '32px',
          }}
        >
          {form.companyName} has been added to the system.
        </p>
        <div className="flex gap-3">
          <PillButton label="View Clients" onClick={() => navigate('/clients')} />
          <PillButton label="Dashboard" onClick={() => navigate('/dashboard')} secondary />
        </div>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{
          height: '85px',
          padding: '0 40px',
          borderBottom: '0.733px solid var(--border-default)',
        }}
      >
        <button
          onClick={() => navigate('/clients')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>

        <span
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          New Client Onboarding
        </span>

        <button
          onClick={() => navigate('/clients')}
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            opacity: 0.5,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        >
          &larr; Clients
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '720px', margin: '0 auto' }}>
        {/* Phase stepper */}
        <div className="flex items-center" style={{ marginBottom: '48px', gap: '0' }}>
          {PHASES.map((phase, i) => (
            <React.Fragment key={phase.key}>
              <button
                onClick={() => setCurrentPhase(phase.key)}
                className="flex flex-col items-center"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: i <= phaseIndex ? 1 : 0.3,
                  transition: `opacity 200ms ${easing}`,
                  flex: 1,
                }}
              >
                {/* Step circle */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background:
                      i < phaseIndex
                        ? '#D7ABC5'
                        : i === phaseIndex
                          ? '#000000'
                          : 'transparent',
                    border:
                      i === phaseIndex
                        ? '2px solid #000000'
                        : '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    transition: `all 200ms ${easing}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Kaio', sans-serif",
                      fontWeight: 800,
                      fontSize: '12px',
                      color:
                        i < phaseIndex || i === phaseIndex
                          ? '#EAF2D7'
                          : 'var(--text-primary)',
                    }}
                  >
                    {i < phaseIndex ? '✓' : i + 1}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Kaio', sans-serif",
                    fontWeight: 800,
                    fontSize: '13px',
                    textTransform: 'uppercase',
                  }}
                >
                  {phase.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Owners Wide', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.8px',
                    opacity: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {phase.sublabel}
                </span>
              </button>
              {i < PHASES.length - 1 && (
                <div
                  style={{
                    flex: 0.5,
                    height: '1px',
                    background: i < phaseIndex ? '#D7ABC5' : 'var(--border-default)',
                    opacity: i < phaseIndex ? 1 : 0.3,
                    marginBottom: '28px',
                    transition: `all 200ms ${easing}`,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Phase content */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '0.733px solid var(--border-default)',
            borderRadius: '10.258px',
            padding: '32px',
          }}
        >
          {currentPhase === 'discovery' && (
            <PhaseDiscovery form={form} update={update} />
          )}
          {currentPhase === 'agreement' && (
            <PhaseAgreement form={form} update={update} />
          )}
          {currentPhase === 'setup' && (
            <PhaseSetup form={form} update={update} />
          )}
          {currentPhase === 'kickoff' && (
            <PhaseKickoff form={form} update={update} />
          )}
        </div>

        {/* Navigation buttons */}
        <div
          className="flex items-center justify-between"
          style={{ marginTop: '24px' }}
        >
          {phaseIndex > 0 ? (
            <PillButton label="&larr; Previous" onClick={prev} secondary />
          ) : (
            <div />
          )}

          {phaseIndex < PHASES.length - 1 ? (
            <PillButton label="Next &rarr;" onClick={next} />
          ) : (
            <PillButton
              label="Create Client"
              onClick={handleSubmit}
              accent
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Phase Forms                                                        */
/* ------------------------------------------------------------------ */

interface PhaseProps {
  form: OnboardForm;
  update: (field: keyof OnboardForm, value: string) => void;
}

const PhaseDiscovery: React.FC<PhaseProps> = ({ form, update }) => (
  <div className="flex flex-col gap-4">
    <PhaseHeading>Discovery</PhaseHeading>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>
      Capture initial client details from the pitch/dating phase.
    </p>
    <FormField label="Company Name" value={form.companyName} onChange={(v) => update('companyName', v)} placeholder="e.g. Nexus Labs" />
    <FormField label="Primary Contact" value={form.contactName} onChange={(v) => update('contactName', v)} placeholder="Full name" />
    <FormField label="Contact Email" value={form.contactEmail} onChange={(v) => update('contactEmail', v)} placeholder="email@company.com" type="email" />
    <FormField label="Industry" value={form.industry} onChange={(v) => update('industry', v)} placeholder="e.g. Web3, DeFi, Gaming" />
    <FormField label="Project Brief" value={form.projectBrief} onChange={(v) => update('projectBrief', v)} placeholder="What are they looking for?" multiline />
    <FormSelect
      label="Referral Source"
      value={form.referralSource}
      onChange={(v) => update('referralSource', v)}
      options={['', 'Inbound (Website)', 'Referral', 'Conference/Event', 'Cold Outreach', 'Social Media', 'Other']}
    />
  </div>
);

const PhaseAgreement: React.FC<PhaseProps> = ({ form, update }) => (
  <div className="flex flex-col gap-4">
    <PhaseHeading>Agreement</PhaseHeading>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>
      Contract and commercial details — MSA and SOW status.
    </p>
    <FormSelect
      label="Engagement Type"
      value={form.engagementType}
      onChange={(v) => update('engagementType', v)}
      options={['retainer', 'project', 'ad-hoc', 'consulting']}
    />
    <FormField label="Estimated Budget" value={form.estimatedBudget} onChange={(v) => update('estimatedBudget', v)} placeholder="e.g. $25,000" />
    <FormSelect
      label="MSA Status"
      value={form.msaStatus}
      onChange={(v) => update('msaStatus', v)}
      options={['pending', 'sent', 'signed', 'not-required']}
    />
    <FormSelect
      label="SOW Status"
      value={form.sowStatus}
      onChange={(v) => update('sowStatus', v)}
      options={['pending', 'draft', 'sent', 'signed']}
    />
  </div>
);

const PhaseSetup: React.FC<PhaseProps> = ({ form, update }) => (
  <div className="flex flex-col gap-4">
    <PhaseHeading>Setup</PhaseHeading>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>
      Provision internal tools and assign ownership. These will be auto-linked to the client hub.
    </p>
    <FormField label="Slack Channel" value={form.slackChannel} onChange={(v) => update('slackChannel', v)} placeholder="#client-nexus" />
    <FormField label="Notion Hub URL" value={form.notionHub} onChange={(v) => update('notionHub', v)} placeholder="https://notion.so/..." />
    <FormField label="Google Drive Folder" value={form.driveFolder} onChange={(v) => update('driveFolder', v)} placeholder="https://drive.google.com/..." />
    <FormSelect
      label="Account Lead"
      value={form.accountLead}
      onChange={(v) => update('accountLead', v)}
      options={['Ben Lydiatt', 'Sixtyne Perez', 'CK', 'Nick Mitchell']}
    />
  </div>
);

const PhaseKickoff: React.FC<PhaseProps> = ({ form, update }) => (
  <div className="flex flex-col gap-4">
    <PhaseHeading>Kickoff</PhaseHeading>
    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>
      Schedule the kickoff and define initial deliverables.
    </p>
    <FormField label="Kickoff Date" value={form.kickoffDate} onChange={(v) => update('kickoffDate', v)} type="date" />
    <FormField label="First Deliverable" value={form.firstDeliverable} onChange={(v) => update('firstDeliverable', v)} placeholder="e.g. Brand audit report" />
    <FormField label="Key Milestones" value={form.milestones} onChange={(v) => update('milestones', v)} placeholder="Phase 1: Research — Phase 2: Concepts — Phase 3: Delivery" multiline />
    <FormField label="Notes" value={form.notes} onChange={(v) => update('notes', v)} placeholder="Anything else to capture..." multiline />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Form Components                                                    */
/* ------------------------------------------------------------------ */

const PhaseHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2
    style={{
      fontFamily: "'Kaio', sans-serif",
      fontWeight: 800,
      fontSize: '22px',
      textTransform: 'uppercase',
      fontFeatureSettings: "'ordn' 1, 'dlig' 1",
      margin: 0,
    }}
  >
    {children}
  </h2>
);

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', multiline }) => (
  <div className="flex flex-col gap-1">
    <label
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        opacity: 0.5,
      }}
    >
      {label}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '14px',
          letterSpacing: '0.5px',
          background: 'var(--bg-primary)',
          border: '0.733px solid var(--border-default)',
          borderRadius: '10.258px',
          padding: '12px 16px',
          color: 'var(--text-primary)',
          outline: 'none',
          resize: 'vertical',
        }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '14px',
          letterSpacing: '0.5px',
          background: 'var(--bg-primary)',
          border: '0.733px solid var(--border-default)',
          borderRadius: '75.641px',
          padding: '10px 16px',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      />
    )}
  </div>
);

const FormSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        opacity: 0.5,
      }}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '14px',
        letterSpacing: '0.5px',
        background: 'var(--bg-primary)',
        border: '0.733px solid var(--border-default)',
        borderRadius: '75.641px',
        padding: '10px 16px',
        color: 'var(--text-primary)',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt || '— Select —'}
        </option>
      ))}
    </select>
  </div>
);

const PillButton: React.FC<{
  label: string;
  onClick: () => void;
  secondary?: boolean;
  accent?: boolean;
}> = ({ label, onClick, secondary, accent }) => (
  <button
    onClick={onClick}
    dangerouslySetInnerHTML={{ __html: label }}
    style={{
      fontFamily: "'Owners Wide', sans-serif",
      fontSize: '12px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      padding: '10px 24px',
      borderRadius: '75.641px',
      border: secondary ? '1px solid var(--border-default)' : 'none',
      background: accent ? '#D7ABC5' : secondary ? 'transparent' : '#000000',
      color: accent ? '#000000' : secondary ? 'var(--text-primary)' : '#EAF2D7',
      cursor: 'pointer',
      transition: `opacity 200ms ${easing}`,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
  />
);

export default ClientOnboardPage;
