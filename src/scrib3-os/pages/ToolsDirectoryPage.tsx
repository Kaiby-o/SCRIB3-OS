import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';

/* ------------------------------------------------------------------ */
/*  Plan v4 §6 — Tools Directory                                      */
/*  Linear, Figma, Adobe, Slack, Culture Amp, Google Workspace,        */
/*  Fathom, Lovable, Claude Code, Mercury, Typeform/Fillout            */
/* ------------------------------------------------------------------ */

interface Tool {
  name: string;
  category: string;
  description: string;
  usedBy: string;
  status: 'active' | 'planned' | 'deprecated';
  url: string;
}

const tools: Tool[] = [
  { name: 'Linear', category: 'Project Management', description: 'Task tracking, sprint planning, and issue management for all projects.', usedBy: 'All team', status: 'active', url: 'https://linear.app' },
  { name: 'Figma', category: 'Design', description: 'UI/UX design, brand systems, and design collaboration.', usedBy: 'Brand, Creative', status: 'active', url: 'https://figma.com' },
  { name: 'Adobe Creative Suite', category: 'Design', description: 'After Effects (motion), Illustrator (vectors), Photoshop (photo editing).', usedBy: 'Brand, Motion', status: 'active', url: 'https://adobe.com' },
  { name: 'Slack', category: 'Communication', description: 'Primary async communication. Client channels, internal channels, DMs.', usedBy: 'All team + clients', status: 'active', url: 'https://slack.com' },
  { name: 'Google Workspace', category: 'Productivity', description: 'Drive (file storage), Docs, Sheets, Slides, Calendar, Meet.', usedBy: 'All team', status: 'active', url: 'https://workspace.google.com' },
  { name: 'Notion', category: 'Knowledge Base', description: 'Client hubs, project databases, team wiki, meeting notes.', usedBy: 'All team', status: 'active', url: 'https://notion.so' },
  { name: 'Culture Amp', category: 'People', description: 'Performance reviews, engagement surveys, feedback cycles.', usedBy: 'All team + HR', status: 'active', url: 'https://cultureamp.com' },
  { name: 'Fathom', category: 'Meetings', description: 'AI meeting recorder and summariser. Auto-generates notes and action items.', usedBy: 'Accounts, C-Suite', status: 'active', url: 'https://fathom.video' },
  { name: 'Mercury', category: 'Finance', description: 'Business banking, payments, and financial operations.', usedBy: 'Ops, Finance', status: 'active', url: 'https://mercury.com' },
  { name: 'Claude Code', category: 'Development', description: 'AI-powered development assistant. Building SCRIB3-OS.', usedBy: 'Dev, Creative', status: 'active', url: 'https://claude.ai' },
  { name: 'Lovable', category: 'Development', description: 'Future: bespoke SCRIB3 web tools. Will replace Fillout forms and host client portal.', usedBy: 'Dev', status: 'planned', url: '#' },
  { name: 'Fillout', category: 'Forms', description: 'Client onboarding forms, bandwidth estimates (being replaced by OS native forms).', usedBy: 'Accounts, All team', status: 'deprecated', url: 'https://fillout.com' },
  { name: 'Typeform', category: 'Forms', description: 'Survey and form builder. Legacy — migrating to OS native.', usedBy: 'Various', status: 'deprecated', url: 'https://typeform.com' },
];

const CATEGORIES = [...new Set(tools.map((t) => t.category))].sort();

const statusConfig = {
  active: { label: 'Active', color: '#27AE60' },
  planned: { label: 'Planned', color: '#6E93C3' },
  deprecated: { label: 'Deprecated', color: '#E67E22' },
};

const ToolsDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [catFilter, setCatFilter] = useState('all');

  const filtered = catFilter === 'all' ? tools : tools.filter((t) => t.category === catFilter);

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Tools & Integrations</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>Tools</h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '24px' }}>
          {tools.filter((t) => t.status === 'active').length} active tools across {CATEGORIES.length} categories
        </p>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: '28px' }}>
          <Pill label="All" active={catFilter === 'all'} onClick={() => setCatFilter('all')} />
          {CATEGORIES.map((c) => (
            <Pill key={c} label={c} active={catFilter === c} onClick={() => setCatFilter(c)} />
          ))}
        </div>

        {/* Tool cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((tool) => (
            <div key={tool.name} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>{tool.name}</span>
                <span style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: '75.641px',
                  background: `${statusConfig[tool.status].color}15`,
                  border: `1px solid ${statusConfig[tool.status].color}40`,
                }}>
                  {statusConfig[tool.status].label}
                </span>
              </div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>{tool.category}</span>
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: '0 0 12px 0', opacity: 0.7 }}>{tool.description}</p>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>Used by: {tool.usedBy}</span>
            </div>
          ))}
        </div>
      </div>
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
    cursor: 'pointer', transition: 'all 0.2s', opacity: active ? 1 : 0.6,
  }}>{label}</button>
);

export default ToolsDirectoryPage;
