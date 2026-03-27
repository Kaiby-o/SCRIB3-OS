import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { mockProjects, projectStatusColors, CLIENTS_WITH_PROJECTS, type Project, type ProjectStatus } from '../lib/projects';

/* ------------------------------------------------------------------ */
/*  Plan v4 §4A — Project Registry                                     */
/* ------------------------------------------------------------------ */

const ProjectRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockProjects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (clientFilter !== 'all' && p.clientName !== clientFilter) return false;
    if (search && !p.code.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = mockProjects.filter((p) => p.status === 'Active' || p.status === 'In Progress').length;
  const missingAlignment = mockProjects.filter((p) => !p.preAlignmentComplete && p.status !== 'Completed' && p.status !== 'Invoiced').length;

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Project Registry</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>Projects</h1>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
              {mockProjects.length} total · {active} active
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/pre-alignment')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', background: '#000', color: '#EAF2D7', border: 'none', borderRadius: '75.641px', padding: '10px 24px', cursor: 'pointer' }}>
              + New Project
            </button>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code or title..."
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 20px', color: 'var(--text-primary)', outline: 'none', width: '220px' }} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6" style={{ marginBottom: '24px' }}>
          <Stat value={active.toString()} label="active" />
          <Stat value={mockProjects.filter((p) => p.status === 'Completed').length.toString()} label="completed" />
          <Stat value={missingAlignment.toString()} label="missing alignment" accent={missingAlignment > 0} />
          <Stat value={CLIENTS_WITH_PROJECTS.length.toString()} label="clients" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap" style={{ marginBottom: '24px' }}>
          <FilterSelect label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}
            options={['all', 'Active', 'In Progress', 'On Hold', 'Completed', 'Not Started']} />
          <FilterSelect label="Client" value={clientFilter} onChange={setClientFilter}
            options={['all', ...CLIENTS_WITH_PROJECTS]} />
        </div>

        {/* Missing alignment warning */}
        {missingAlignment > 0 && (
          <div style={{ background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '10.258px', padding: '14px 24px', marginBottom: '20px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
              ⚠ <strong>{missingAlignment} project{missingAlignment > 1 ? 's' : ''}</strong> missing pre-alignment — status: "Blocked — alignment incomplete"
            </span>
          </div>
        )}

        {/* Project table */}
        <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
          <div className="flex items-center" style={{ padding: '12px 24px', borderBottom: '0.733px solid var(--border-default)', opacity: 0.5 }}>
            <TH width="9%">Code</TH>
            <TH width="13%">Client</TH>
            <TH width="22%">Title</TH>
            <TH width="10%">Status</TH>
            <TH width="8%">Type</TH>
            <TH width="12%">Production Lead</TH>
            <TH width="10%">Team</TH>
            <TH width="8%">Aligned</TH>
            <TH width="8%">Brief</TH>
          </div>
          {filtered.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center" style={{ padding: '48px', opacity: 0.4 }}>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>No projects match</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectRow: React.FC<{ project: Project }> = ({ project: p }) => (
  <div className="flex items-center" style={{ padding: '14px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', transition: 'background 0.15s' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
    <div style={{ width: '9%' }}>
      <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{p.code}</span>
    </div>
    <div style={{ width: '13%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{p.clientName}</span>
    </div>
    <div style={{ width: '22%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{p.title}</span>
    </div>
    <div style={{ width: '10%' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '75.641px', background: `${projectStatusColors[p.status]}15`, border: `1px solid ${projectStatusColors[p.status]}40` }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: projectStatusColors[p.status], display: 'inline-block' }} />
        {p.status}
      </span>
    </div>
    <div style={{ width: '8%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.6 }}>{p.type}</span>
    </div>
    <div style={{ width: '12%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{p.productionLead}</span>
    </div>
    <div style={{ width: '10%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.6 }}>{p.teamMembers.length} members</span>
    </div>
    <div style={{ width: '8%' }}>
      <span style={{ fontSize: '14px' }}>{p.preAlignmentComplete ? '✅' : '⚠️'}</span>
    </div>
    <div style={{ width: '8%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '75.641px', background: p.briefStatus === 'Complete' ? 'rgba(39,174,96,0.1)' : 'rgba(241,196,15,0.1)', border: `1px solid ${p.briefStatus === 'Complete' ? 'rgba(39,174,96,0.3)' : 'rgba(241,196,15,0.3)'}` }}>
        {p.briefStatus}
      </span>
    </div>
  </div>
);

const Stat: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="flex flex-col gap-1">
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: accent ? '#E74C3C' : 'var(--text-primary)' }}>{value}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{label}</span>
  </div>
);

const TH: React.FC<{ width: string; children: React.ReactNode }> = ({ width, children }) => (
  <span style={{ width, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{children}</span>
);

const FilterSelect: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="flex items-center gap-2">
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{label}:</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '6px 14px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
      {options.map((o) => <option key={o} value={o}>{o === 'all' ? 'All' : o}</option>)}
    </select>
  </div>
);

export default ProjectRegistryPage;
