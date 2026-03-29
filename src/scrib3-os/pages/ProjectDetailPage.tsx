import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { mockProjects, projectStatusColors } from '../lib/projects';
import { workflowTemplates } from '../lib/workflows';

const ProjectDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const project = mockProjects.find((p) => p.code === code);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'workflow' | 'alignment'>('overview');

  if (!project) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Project Not Found</h1>
        <button onClick={() => navigate('/projects')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', marginTop: '24px', padding: '10px 24px', border: '0.733px solid #000', borderRadius: '75.641px', background: 'transparent', cursor: 'pointer' }}>
          ← Projects
        </button>
      </div>
    );
  }

  // Find matching workflow template
  const workflow = workflowTemplates.find((w) =>
    project.services.some((s) => s.toLowerCase().includes(w.projectType.toLowerCase()))
  ) ?? workflowTemplates[1]; // Default to Social

  const statusColor = projectStatusColors[project.status] ?? '#95A5A6';

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          {project.code} — {project.clientName}
        </span>
        <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Title + status */}
        <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', opacity: 0.4 }}>{project.code}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', background: `${statusColor}15`, border: `1px solid ${statusColor}40` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            {project.status}
          </span>
          {!project.preAlignmentComplete && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#E67E22' }}>Alignment incomplete</span>}
        </div>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0', lineHeight: 1.1 }}>
          {project.title}
        </h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '24px' }}>{project.brief}</p>

        {/* Why This Matters — T3 #9 Strategic Translation */}
        <div style={{ background: 'rgba(215,171,197,0.08)', border: '1px solid rgba(215,171,197,0.2)', borderRadius: '10.258px', padding: '16px 20px', marginBottom: '24px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Why This Matters</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5 }}>
            {project.brief || 'Strategic context to be added by account lead. Every team member should understand why this project exists before starting work.'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          {([['overview', 'Overview'], ['documents', 'Documents'], ['workflow', 'Workflow'], ['alignment', 'Alignment']] as const).map(([key, label]) => (
            <Pill key={key} label={label} active={activeTab === key} onClick={() => setActiveTab(key)} />
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Properties grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <InfoCard label="Client" value={project.clientName} />
              <InfoCard label="Type" value={project.type} />
              <InfoCard label="Production Lead" value={project.productionLead} />
              <InfoCard label="Creative Lead" value={project.creativeLead} />
              <InfoCard label="Account Lead" value={project.accountLead} />
              <InfoCard label="Unit" value={project.unit} />
              <InfoCard label="Start Date" value={project.startDate} />
              <InfoCard label="Completion" value={project.completionDate || 'Ongoing'} />
            </div>

            {/* Services */}
            <Section title="Services">
              <div className="flex gap-2 flex-wrap">
                {project.services.map((s) => (
                  <span key={s} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.15)', border: '1px solid rgba(215,171,197,0.3)' }}>{s}</span>
                ))}
              </div>
            </Section>

            {/* Team */}
            <Section title="Team Members">
              <div className="flex gap-2 flex-wrap">
                {project.teamMembers.map((m) => (
                  <span key={m} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)' }}>{m}</span>
                ))}
                {project.freelancers.length > 0 && project.freelancers.map((f) => (
                  <span key={f} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)', opacity: 0.6 }}>{f} (vendor)</span>
                ))}
              </div>
            </Section>
          </>
        )}

        {activeTab === 'documents' && (
          <>
            <Section title="Project Documents">
              <div className="flex flex-col gap-3">
                <DocRow label="Master Service Agreement (MSA)" url={project.sowUrl} />
                <DocRow label="Statement of Work (SOW)" url={project.sowUrl} />
                <DocRow label="Project Brief" url={project.briefStatus === 'Complete' ? '#' : ''} status={project.briefStatus} />
                <DocRow label="Client Markdown File" url={project.clientSlug ? `/clients/${project.clientSlug}/hub` : ''} internal />
                <DocRow label="Linear Board" url={project.linearBoardUrl} />
                {project.clientSlug && <DocRow label="Client Portal" url={`/portal/${project.clientSlug}`} internal />}
              </div>
            </Section>
          </>
        )}

        {activeTab === 'workflow' && (
          <Section title={`Workflow: ${workflow.name}`}>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '16px' }}>
              Pre-defined task sequence for {workflow.projectType} projects. Each step must be completed in order.
            </p>
            {workflow.steps.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3" style={{ padding: '12px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '11px' }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>{step.title}</span>
                    {step.required && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#E74C3C', textTransform: 'uppercase' }}>Required</span>}
                  </div>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>{step.description}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', background: 'rgba(110,147,195,0.1)', border: '1px solid rgba(110,147,195,0.3)' }}>{step.phase}</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>→ {step.assigneeRole.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        )}

        {activeTab === 'alignment' && (
          <>
            <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>{project.preAlignmentComplete ? '✅' : '⚠️'}</span>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>
                {project.preAlignmentComplete ? 'Alignment Complete' : 'Alignment Incomplete'}
              </span>
            </div>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, marginBottom: '16px' }}>
              {project.preAlignmentComplete
                ? 'All 17 alignment fields have been completed and signed off. Project is cleared for production.'
                : 'This project has not completed the pre-alignment checklist. Production should not begin until all fields are filled and approved.'}
            </p>
            <button onClick={() => navigate('/pre-alignment')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
              {project.preAlignmentComplete ? 'View Alignment' : 'Complete Alignment →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>{title}</h3>
    {children}
  </div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '14px 18px' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '4px' }}>{label}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{value}</span>
  </div>
);

const DocRow: React.FC<{ label: string; url: string; status?: string; internal?: boolean }> = ({ label, url, status, internal }) => {
  const navigate = useNavigate();
  const hasUrl = url && url !== '#' && url !== '';
  return (
    <div className="flex items-center justify-between" style={{ padding: '14px 20px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px' }}>
      <div className="flex items-center gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{label}</span>
        {status && (
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', background: status === 'Complete' ? 'rgba(39,174,96,0.1)' : 'rgba(241,196,15,0.1)', border: `1px solid ${status === 'Complete' ? 'rgba(39,174,96,0.3)' : 'rgba(241,196,15,0.3)'}` }}>
            {status}
          </span>
        )}
      </div>
      {hasUrl ? (
        <button onClick={() => internal ? navigate(url) : window.open(url, '_blank')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', opacity: 0.6 }}>
          {internal ? 'Open' : 'View'}
        </button>
      ) : (
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '1px' }}>Not uploaded</span>
      )}
    </div>
  );
};

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

export default ProjectDetailPage;
