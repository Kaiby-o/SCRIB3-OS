import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import {
  mockEstimates,
  buildDigest,
  getCapacityColor,
  FULL_TEAM,
  type BandwidthEntry,
} from '../lib/bandwidth';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Capacity Bar                                                       */
/* ------------------------------------------------------------------ */

const CapacityBar: React.FC<{ pct: number; width?: number }> = ({ pct, width = 80 }) => (
  <div style={{ width, height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: getCapacityColor(pct), borderRadius: 3, transition: `width 0.3s ${easing}` }} />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Tab: Digest (Manager view — Ben + Elena)                           */
/* ------------------------------------------------------------------ */

const DigestTab: React.FC = () => {
  const digest = buildDigest(mockEstimates, '2026-03-23');

  return (
    <>
      {/* Banner */}
      <div style={{ background: 'rgba(215,171,197,0.12)', border: '1px solid rgba(215,171,197,0.3)', borderRadius: '10.258px', padding: '16px 24px', marginBottom: '24px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '0.5px' }}>
          📋 <strong>Monday Digest</strong> — Week of {digest.weekOf} · Auto-generated for Ben + Elena · {digest.submissions.length} / {FULL_TEAM.length} submitted
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-6 flex-wrap" style={{ marginBottom: '32px' }}>
        <Stat value={`${digest.teamAvgCapacity}%`} label="avg capacity" />
        <Stat value={digest.highCapacity.length.toString()} label="≥80% capacity" accent={digest.highCapacity.length > 0} />
        <Stat value={digest.missingSubmissions.length.toString()} label="missing" accent={digest.missingSubmissions.length > 0} />
      </div>

      {/* High capacity alert */}
      {digest.highCapacity.length > 0 && (
        <div style={{ background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '10.258px', padding: '16px 24px', marginBottom: '24px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚠ High Capacity Alert
          </span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.7 }}>
            {digest.highCapacity.map((e) => `${e.teamMemberName} (${e.capacityPct}%)`).join(' · ')}
          </span>
        </div>
      )}

      {/* Missing submissions */}
      {digest.missingSubmissions.length > 0 && (
        <div style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '10.258px', padding: '16px 24px', marginBottom: '24px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Missing Submissions
          </span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.7 }}>
            {digest.missingSubmissions.join(' · ')}
          </span>
        </div>
      )}

      {/* Team breakdown */}
      <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
        Team Breakdown
      </h3>
      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden', marginBottom: '32px' }}>
        <div className="flex items-center" style={{ padding: '12px 24px', borderBottom: '0.733px solid var(--border-default)', opacity: 0.5 }}>
          <TH width="22%">Team Member</TH>
          <TH width="12%">Hours</TH>
          <TH width="18%">Capacity</TH>
          <TH width="48%">Projects</TH>
        </div>
        {digest.submissions.sort((a, b) => b.capacityPct - a.capacityPct).map((est) => (
          <div key={est.id} className="flex items-center" style={{ padding: '12px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ width: '20%' }}>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>{est.teamMemberName}</span>
            </div>
            <div style={{ width: '12%' }}>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{est.totalHours}h</span>
            </div>
            <div style={{ width: '18%' }}>
              <div className="flex items-center gap-2">
                <CapacityBar pct={est.capacityPct} />
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', color: getCapacityColor(est.capacityPct) }}>{est.capacityPct}%</span>
              </div>
            </div>
            <div style={{ width: '48%' }}>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.6 }}>
                {est.entries.map((e) => `${e.projectCode} (${e.estimatedHours}h)`).join(' · ')}
              </span>
            </div>
          </div>
        ))}
      </div>

    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab: Submit (Team member form)                                     */
/* ------------------------------------------------------------------ */

const SubmitTab: React.FC = () => {
  const [memberName, setMemberName] = useState('');
  const [entries, setEntries] = useState<Omit<BandwidthEntry, 'labourCost'>[]>([
    { projectCode: '', projectName: '', clientName: '', estimatedHours: 0, hourlyRate: 0 },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const updateEntry = (idx: number, field: string, value: string | number) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const addRow = () => setEntries((prev) => [...prev, { projectCode: '', projectName: '', clientName: '', estimatedHours: 0, hourlyRate: 0 }]);
  const removeRow = (idx: number) => setEntries((prev) => prev.filter((_, i) => i !== idx));

  const totalHours = entries.reduce((a, e) => a + e.estimatedHours, 0);
  const capacityPct = Math.round((totalHours / 40) * 100);

  if (submitted) {
    return (
      <div className="flex flex-col items-center" style={{ paddingTop: '80px' }}>
        <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', textTransform: 'uppercase', marginBottom: '12px' }}>Submitted</h2>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.6, marginBottom: '24px' }}>
          {memberName}'s bandwidth estimate for this week has been recorded.
        </p>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.4 }}>
          {totalHours}h total · {capacityPct}% capacity
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: 'rgba(110,147,195,0.1)', border: '1px solid rgba(110,147,195,0.3)', borderRadius: '10.258px', padding: '16px 24px', marginBottom: '24px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
          📅 <strong>Friday form</strong> — Submit by 5pm UTC. Select your projects, estimate hours for the coming week.
        </span>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '28px', marginBottom: '24px' }}>
        <div className="flex flex-col gap-1" style={{ marginBottom: '20px' }}>
          <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Your Name</label>
          <select value={memberName} onChange={(e) => setMemberName(e.target.value)}
            style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', appearance: 'none', maxWidth: '300px' }}>
            <option value="">— Select —</option>
            {FULL_TEAM.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Entries */}
        {entries.map((entry, idx) => (
          <div key={idx} className="flex gap-3 items-end" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <SmField label="Project Code" value={entry.projectCode} onChange={(v) => updateEntry(idx, 'projectCode', v)} placeholder="RSK-001" width="120px" />
            <SmField label="Project Name" value={entry.projectName} onChange={(v) => updateEntry(idx, 'projectName', v)} placeholder="Rootstock Refresh" width="180px" />
            <SmField label="Client" value={entry.clientName} onChange={(v) => updateEntry(idx, 'clientName', v)} placeholder="Rootstock" width="140px" />
            <SmField label="Hours" value={entry.estimatedHours.toString()} onChange={(v) => updateEntry(idx, 'estimatedHours', parseFloat(v) || 0)} placeholder="0" width="80px" type="number" />
            {entries.length > 1 && (
              <button onClick={() => removeRow(idx)} style={{ fontFamily: "'Kaio', sans-serif", fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', padding: '8px', opacity: 0.5 }}>×</button>
            )}
          </div>
        ))}

        <button onClick={addRow} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border-default)', borderRadius: '75.641px', padding: '8px 20px', cursor: 'pointer', color: 'var(--text-primary)', opacity: 0.6, transition: `opacity 0.2s ${easing}` }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}>
          + Add Project
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between" style={{ padding: '20px 24px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', marginBottom: '24px' }}>
        <div className="flex gap-6">
          <Stat value={`${totalHours}h`} label="total hours" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: getCapacityColor(capacityPct) }}>{capacityPct}%</span>
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>capacity</span>
          </div>
        </div>
        <button onClick={() => { if (memberName) setSubmitted(true); }}
          style={{
            fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
            background: memberName ? '#D7ABC5' : 'transparent', color: memberName ? '#000' : 'var(--text-primary)',
            border: memberName ? 'none' : '1px solid var(--border-default)',
            borderRadius: '75.641px', padding: '10px 24px',
            cursor: memberName ? 'pointer' : 'default', opacity: memberName ? 1 : 0.3,
            transition: `opacity 0.2s ${easing}`,
          }}
          onMouseEnter={(e) => { if (memberName) e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = memberName ? '1' : '0.3'; }}>
          Submit Estimate
        </button>
      </div>
    </>
  );
};

const SmField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; width?: string; type?: string }> = ({ label, value, onChange, placeholder, width = '140px', type = 'text' }) => (
  <div className="flex flex-col gap-1" style={{ width }}>
    <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '8px 12px', color: 'var(--text-primary)', outline: 'none', width: '100%' }} />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const TH: React.FC<{ width: string; children: React.ReactNode }> = ({ width, children }) => (
  <span style={{ width, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{children}</span>
);

const Stat: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="flex flex-col gap-1">
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: accent ? '#E74C3C' : 'var(--text-primary)' }}>{value}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{label}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const BandwidthPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'digest' | 'submit'>('digest');

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Bandwidth Estimates</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 24px 0' }}>
          Bandwidth
        </h1>

        <div className="flex gap-2" style={{ marginBottom: '32px' }}>
          <Pill label="Digest" active={tab === 'digest'} onClick={() => setTab('digest')} />
          <Pill label="Submit Estimate" active={tab === 'submit'} onClick={() => setTab('submit')} />
        </div>

        {tab === 'digest' ? <DigestTab /> : <SubmitTab />}
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

export default BandwidthPage;
