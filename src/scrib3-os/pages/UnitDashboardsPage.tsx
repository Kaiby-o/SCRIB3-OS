import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { mockTeam } from '../lib/team';
import { mockProjects } from '../lib/projects';
import { mockEngagements, getHealthTier } from '../lib/engagementHealth';
import { mockInvoices } from '../lib/vendors';
import { getCapacityColor } from '../lib/bandwidth';

/* ------------------------------------------------------------------ */
/*  Plan v4 §4B — Unit Dashboards                                     */
/*  Accounts | CSuite | Brand | PR | Ops                               */
/* ------------------------------------------------------------------ */

type UnitKey = 'accounts' | 'csuite' | 'brand' | 'pr' | 'ops';

const UNITS: { key: UnitKey; label: string }[] = [
  { key: 'accounts', label: 'Accounts' },
  { key: 'csuite', label: 'C-Suite' },
  { key: 'brand', label: 'Brand' },
  { key: 'pr', label: 'PR' },
  { key: 'ops', label: 'Ops' },
];

const UnitDashboardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitKey>('accounts');

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Unit Dashboards</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 24px 0' }}>Units</h1>

        {/* Unit tabs */}
        <div className="flex gap-2" style={{ marginBottom: '32px' }}>
          {UNITS.map((u) => (
            <Pill key={u.key} label={u.label} active={unit === u.key} onClick={() => setUnit(u.key)} />
          ))}
        </div>

        {unit === 'accounts' && <AccountsUnit />}
        {unit === 'csuite' && <CSuiteUnit />}
        {unit === 'brand' && <BrandUnit />}
        {unit === 'pr' && <PRUnit />}
        {unit === 'ops' && <OpsUnit />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Accounts Unit                                                      */
/* ------------------------------------------------------------------ */

const AccountsUnit: React.FC = () => {
  const members = mockTeam.filter((m) => m.unit === 'Accounts');
  const clients = mockEngagements;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        <Stat value={clients.length.toString()} label="active clients" />
        <Stat value={clients.filter((e) => e.currentMarginPct >= 30).length.toString()} label="healthy" />
        <Stat value={clients.filter((e) => e.currentMarginPct < 20).length.toString()} label="at risk" accent />
        <Stat value={members.length.toString()} label="team members" />
      </div>
      <Section title="Client Health">
        {clients.map((e) => {
          const tier = getHealthTier(e.currentMarginPct);
          return (
            <Row key={e.id}>
              <Cell width="25%" bold>{e.clientName}</Cell>
              <Cell width="20%">{e.accountLead}</Cell>
              <Cell width="15%">${(e.monthlyRemit / 1000).toFixed(0)}K/mo</Cell>
              <Cell width="15%">{e.currentMarginPct.toFixed(0)}%</Cell>
              <Cell width="25%"><span style={{ fontSize: '14px' }}>{tier.emoji}</span> {tier.label}</Cell>
            </Row>
          );
        })}
      </Section>
      <MemberList members={members} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  C-Suite Unit                                                       */
/* ------------------------------------------------------------------ */

const CSuiteUnit: React.FC = () => {
  const members = mockTeam.filter((m) => m.unit === 'C-Suite');
  const totalRemit = mockEngagements.reduce((a, e) => a + e.monthlyRemit, 0);
  const avgMargin = mockEngagements.reduce((a, e) => a + e.currentMarginPct, 0) / mockEngagements.length;
  const teamBandwidth = mockTeam.filter((m) => m.role === 'team').reduce((a, m) => a + m.bandwidthPct, 0) / mockTeam.filter((m) => m.role === 'team').length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        <Stat value={`$${(totalRemit / 1000).toFixed(0)}K`} label="monthly remit" />
        <Stat value={`${avgMargin.toFixed(0)}%`} label="avg margin" />
        <Stat value={`${teamBandwidth.toFixed(0)}%`} label="team bandwidth" accent={teamBandwidth > 80} />
        <Stat value={members.length.toString()} label="c-suite" />
      </div>
      <Section title="Engagement Pipeline">
        {mockEngagements.map((e) => {
          const tier = getHealthTier(e.currentMarginPct);
          return (
            <Row key={e.id}>
              <Cell width="20%" bold>{e.clientName}</Cell>
              <Cell width="15%">${(e.monthlyRemit / 1000).toFixed(0)}K</Cell>
              <Cell width="15%">{e.currentMarginPct.toFixed(0)}% margin</Cell>
              <Cell width="20%">{tier.emoji} {tier.label}</Cell>
              <Cell width="30%" muted>{e.contractEndType === 'auto-renew-mtm' ? 'Auto-Renew' : `Ends ${e.contractEnd}`}</Cell>
            </Row>
          );
        })}
      </Section>
      <MemberList members={members} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Brand Unit                                                         */
/* ------------------------------------------------------------------ */

const BrandUnit: React.FC = () => {
  const members = mockTeam.filter((m) => m.unit === 'Brand');
  const projects = mockProjects.filter((p) => p.unit === 'Brand' && (p.status === 'Active' || p.status === 'In Progress'));
  const avgBandwidth = members.length > 0 ? Math.round(members.reduce((a, m) => a + m.bandwidthPct, 0) / members.length) : 0;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        <Stat value={projects.length.toString()} label="active projects" />
        <Stat value={members.length.toString()} label="team members" />
        <Stat value={`${avgBandwidth}%`} label="avg bandwidth" accent={avgBandwidth > 80} />
      </div>
      <Section title="Active Briefs">
        {projects.map((p) => (
          <Row key={p.id}>
            <Cell width="12%" bold>{p.code}</Cell>
            <Cell width="25%">{p.title}</Cell>
            <Cell width="15%">{p.clientName}</Cell>
            <Cell width="18%">{p.productionLead}</Cell>
            <Cell width="15%">{p.services.join(', ')}</Cell>
            <Cell width="15%" muted>{p.startDate} → {p.completionDate || '—'}</Cell>
          </Row>
        ))}
      </Section>
      <MemberList members={members} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  PR Unit                                                            */
/* ------------------------------------------------------------------ */

const PRUnit: React.FC = () => {
  const members = mockTeam.filter((m) => m.unit === 'PR');
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        <Stat value={members.length.toString()} label="team members" />
        <Stat value="3" label="active clients" />
        <Stat value="12" label="media placements (Q1)" />
        <Stat value="4" label="podcast bookings" />
      </div>
      <Section title="Coverage Tracker">
        <Row><Cell width="25%" bold>Cardano Consensus Coverage</Cell><Cell width="20%">Matt Brannon</Cell><Cell width="20%">3 tier-1 interviews</Cell><Cell width="35%" muted>CoinDesk, The Block, Decrypt</Cell></Row>
        <Row><Cell width="25%" bold>Franklin Templeton BENJI</Cell><Cell width="20%">Kevin Arteaga</Cell><Cell width="20%">2 features</Cell><Cell width="35%" muted>Bloomberg Crypto, Fortune</Cell></Row>
        <Row><Cell width="25%" bold>Midnight Testnet</Cell><Cell width="20%">Destini</Cell><Cell width="20%">5 pickups</Cell><Cell width="35%" muted>Pending — launch dependent</Cell></Row>
      </Section>
      <MemberList members={members} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Ops Unit                                                           */
/* ------------------------------------------------------------------ */

const OpsUnit: React.FC = () => {
  const members = mockTeam.filter((m) => m.unit === 'Ops');
  const pendingInvoices = mockInvoices.filter((i) => i.status === 'submitted' || i.status === 'validated');
  const totalPending = pendingInvoices.reduce((a, i) => a + i.totalAmount, 0);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        <Stat value={`$${totalPending.toLocaleString()}`} label="invoices pending" accent={totalPending > 0} />
        <Stat value={mockInvoices.filter((i) => i.status === 'submitted').length.toString()} label="awaiting review" accent />
        <Stat value={members.length.toString()} label="ops team" />
      </div>
      <Section title="Invoice Pipeline">
        {mockInvoices.filter((i) => i.status !== 'paid').map((inv) => (
          <Row key={inv.id}>
            <Cell width="15%" bold>{inv.id.toUpperCase()}</Cell>
            <Cell width="20%">{inv.vendorName}</Cell>
            <Cell width="15%">${inv.totalAmount.toLocaleString()}</Cell>
            <Cell width="15%">{inv.status}</Cell>
            <Cell width="35%" muted>{inv.lineItems.map((l) => l.projectCode).join(', ')}</Cell>
          </Row>
        ))}
      </Section>
      <MemberList members={members} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const MemberList: React.FC<{ members: typeof mockTeam }> = ({ members }) => (
  <Section title="Team">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3" style={{ padding: '12px 16px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '11px' }}>{m.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          </div>
          <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
            <div className="flex items-center gap-2">
              <div style={{ width: 30, height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(m.bandwidthPct, 100)}%`, height: '100%', background: getCapacityColor(m.bandwidthPct), borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: getCapacityColor(m.bandwidthPct) }}>{m.bandwidthPct}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>{title}</h3>
    {children}
  </div>
);

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center" style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>{children}</div>
);

const Cell: React.FC<{ width: string; bold?: boolean; muted?: boolean; children: React.ReactNode }> = ({ width, bold, muted, children }) => (
  <span style={{ width, fontFamily: bold ? "'Kaio', sans-serif" : "'Owners Wide', sans-serif", fontWeight: bold ? 800 : 400, fontSize: bold ? '12px' : '12px', textTransform: bold ? 'uppercase' : 'none', opacity: muted ? 0.5 : 1 }}>{children}</span>
);

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

export default UnitDashboardsPage;
