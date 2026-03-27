import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { mockScopeWatch, frequencyColors, type ScopeWatchEntry } from '../lib/scopeWatch';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Plan v4 §3H — Scope Watch (Sixtyne + Elena)                       */
/* ------------------------------------------------------------------ */

const clients = [...new Set(mockScopeWatch.map((e) => e.clientName))];

const ScopeWatchPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = clientFilter === 'all'
    ? mockScopeWatch
    : mockScopeWatch.filter((e) => e.clientName === clientFilter);

  const outOfScope = mockScopeWatch.filter((e) => !e.inScope).length;
  const frequent = mockScopeWatch.filter((e) => e.frequency === 'frequent').length;

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Scope Watch</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Persistent banner — Plan v4 requirement */}
        <div style={{ background: '#000', color: '#EAF2D7', borderRadius: '10.258px', padding: '16px 24px', marginBottom: '32px' }}>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '0.8px' }}>
            ⚠ Client questions go to the account lead — never DM a client directly.
          </span>
        </div>

        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>
          Scope Watch
        </h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '24px' }}>
          Out-of-scope requests that come up regularly. Reference before responding to client asks.
        </p>

        {/* Stats */}
        <div className="flex gap-6" style={{ marginBottom: '24px' }}>
          <Stat value={mockScopeWatch.length.toString()} label="total entries" />
          <Stat value={outOfScope.toString()} label="out of scope" accent />
          <Stat value={frequent.toString()} label="frequent" accent={frequent > 0} />
          <Stat value={clients.length.toString()} label="clients covered" />
        </div>

        {/* Client filter */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: '24px' }}>
          <Pill label="All Clients" active={clientFilter === 'all'} onClick={() => setClientFilter('all')} />
          {clients.map((c) => (
            <Pill key={c} label={c} active={clientFilter === c} onClick={() => setClientFilter(c)} />
          ))}
        </div>

        {/* Entries */}
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <ScopeCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center" style={{ padding: '64px', opacity: 0.4 }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No scope watch entries for this client
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Scope Card                                                         */
/* ------------------------------------------------------------------ */

const ScopeCard: React.FC<{
  entry: ScopeWatchEntry;
  expanded: boolean;
  onToggle: () => void;
}> = ({ entry, expanded, onToggle }) => (
  <div
    style={{
      border: '0.733px solid var(--border-default)',
      borderRadius: '10.258px',
      overflow: 'hidden',
      transition: `all 0.2s ${easing}`,
    }}
  >
    {/* Header row — always visible */}
    <div
      onClick={onToggle}
      className="flex items-center gap-3"
      style={{
        padding: '16px 24px',
        cursor: 'pointer',
        background: expanded ? 'var(--bg-surface)' : 'transparent',
        transition: `background 0.15s ${easing}`,
      }}
      onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = 'var(--bg-surface)'; }}
      onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Scope indicator */}
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
          padding: '3px 10px', borderRadius: '75.641px', flexShrink: 0,
          background: entry.inScope ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
          border: `1px solid ${entry.inScope ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`,
          color: entry.inScope ? '#27AE60' : '#E74C3C',
        }}
      >
        {entry.inScope ? 'In Scope' : 'Out of Scope'}
      </span>

      {/* Frequency */}
      <span
        style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: frequencyColors[entry.frequency], flexShrink: 0,
        }}
        title={entry.frequency}
      />

      {/* Client */}
      <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', flexShrink: 0, minWidth: '120px' }}>
        {entry.clientName}
      </span>

      {/* Request type */}
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', flex: 1 }}>
        {entry.requestType}
      </span>

      {/* Expand arrow */}
      <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '14px', opacity: 0.4, transform: expanded ? 'rotate(90deg)' : 'none', transition: `transform 0.2s ${easing}` }}>
        ›
      </span>
    </div>

    {/* Expanded detail */}
    {expanded && (
      <div style={{ padding: '0 24px 20px 24px', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px' }}>
          <DetailBlock label="SOW Clause" value={entry.sowClause} />
          <DetailBlock label="Approved Response" value={entry.approvedResponse} highlight />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <DetailBlock label="Added By" value={entry.addedBy} />
          <DetailBlock label="Date" value={entry.addedAt} />
          <DetailBlock label="Frequency" value={entry.frequency.charAt(0).toUpperCase() + entry.frequency.slice(1)} />
        </div>
      </div>
    )}
  </div>
);

const DetailBlock: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '6px' }}>
      {label}
    </span>
    <span style={{
      fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, display: 'block',
      ...(highlight ? { background: 'rgba(215,171,197,0.1)', border: '1px solid rgba(215,171,197,0.2)', borderRadius: '10.258px', padding: '12px' } : {}),
    }}>
      {value}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const Stat: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="flex flex-col gap-1">
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: accent ? '#E74C3C' : 'var(--text-primary)' }}>{value}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{label}</span>
  </div>
);

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

export default ScopeWatchPage;
