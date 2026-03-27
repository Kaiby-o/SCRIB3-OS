import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { priorityClients, type ClientProfile } from '../lib/clients';
import { useSupabaseRow, useSupabaseQuery } from '../hooks/useSupabase';

/* ------------------------------------------------------------------ */
/*  Plan v4 §3K — Client Hub (internal team-facing)                    */
/*  /clients/:slug/hub                                                 */
/* ------------------------------------------------------------------ */

const ClientHubPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'brand' | 'projects' | 'contacts' | 'strategy'>('overview');

  // Try Supabase first, fall back to mock
  const { data: dbClient } = useSupabaseRow<Record<string, unknown>>('client_profiles', 'slug', slug ?? '');
  const { data: dbContacts } = useSupabaseQuery<Record<string, unknown>>(
    'client_contacts', '*', slug ? [{ column: 'client_id', value: dbClient?.id as string ?? '' }] : undefined
  );

  const client: ClientProfile | undefined = useMemo(() => {
    if (dbClient) {
      const social = (dbClient.social_links ?? {}) as Record<string, string>;
      return {
        id: dbClient.id as string,
        slug: dbClient.slug as string,
        companyName: (dbClient.company_name ?? '') as string,
        industry: (dbClient.industry ?? '') as string,
        website: (dbClient.website ?? '') as string,
        twitter: social.twitter ?? '',
        linkedin: social.linkedin ?? '',
        discord: social.discord ?? '',
        contractStart: (dbClient.contract_start ?? '') as string,
        contractType: (dbClient.contract_type ?? 'Monthly Remit') as ClientProfile['contractType'],
        accountHealth: (dbClient.account_health ?? '🟢') as ClientProfile['accountHealth'],
        accountLead: '', creativeLead: '', prLead: '',
        slackChannel: '',
        primaryColour: '#000', secondaryColours: [], primaryFont: '',
        toneOfVoice: '', keyMessaging: [], contentDos: [], contentDonts: [],
        servicesActive: [],
        macroStrategy: (dbClient.notes ?? '') as string,
        currentSprintFocus: '', whatWeAreNotDoing: '',
        contacts: dbContacts.map((c) => ({
          name: (c.name ?? '') as string,
          role: (c.role ?? '') as string,
          email: (c.email ?? '') as string,
          commsPreference: (c.comms_preference ?? '') as string,
          isPrimary: (c.is_primary ?? false) as boolean,
        })),
        activeProjects: [],
        upcomingDates: [],
        scopeWatch: (dbClient.scope_watch ?? []) as ClientProfile['activeProjects'],
      } as unknown as ClientProfile;
    }
    return priorityClients.find((c) => c.slug === slug);
  }, [dbClient, dbContacts, slug]);

  if (!client) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Client Not Found</h1>
        <button onClick={() => navigate('/clients')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: '#000', marginTop: '24px', padding: '10px 24px', border: '0.733px solid #000', borderRadius: '75.641px', background: 'transparent', cursor: 'pointer' }}>
          &larr; Client List
        </button>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/clients')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          {client.companyName} — Internal Hub
        </span>
        <button onClick={() => navigate('/clients')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Clients
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Client header */}
        <div className="flex items-center gap-4" style={{ marginBottom: '8px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: client.primaryColour, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '18px' }}>{client.companyName.charAt(0)}</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>{client.companyName}</h1>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5 }}>{client.industry}</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '20px' }}>{client.accountHealth}</span>
        </div>

        {/* Quick info */}
        <div className="flex gap-4 flex-wrap" style={{ marginBottom: '28px' }}>
          <QuickPill label="Account Lead" value={client.accountLead} />
          <QuickPill label="Creative" value={client.creativeLead} />
          {client.prLead && <QuickPill label="PR" value={client.prLead} />}
          <QuickPill label="Slack" value={client.slackChannel} />
          <QuickPill label="Type" value={client.contractType} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: '28px' }}>
          {([['overview', 'Overview'], ['brand', 'Brand'], ['projects', 'Projects'], ['contacts', 'Contacts'], ['strategy', 'Strategy']] as const).map(([key, label]) => (
            <Pill key={key} label={label} active={tab === key} onClick={() => setTab(key)} />
          ))}
          <button onClick={() => navigate(`/portal/${client.slug}`)} style={{ marginLeft: 'auto', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '75.641px', border: '1px solid #D7ABC5', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', opacity: 0.7 }}>
            View Client Portal →
          </button>
        </div>

        {tab === 'overview' && <OverviewTab client={client} />}
        {tab === 'brand' && <BrandTab client={client} />}
        {tab === 'projects' && <ProjectsTab client={client} />}
        {tab === 'contacts' && <ContactsTab client={client} />}
        {tab === 'strategy' && <StrategyTab client={client} />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const OverviewTab: React.FC<{ client: ClientProfile }> = ({ client: c }) => (
  <div className="flex flex-col gap-4">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
      <InfoCard label="Website" value={c.website} />
      <InfoCard label="Twitter" value={c.twitter} />
      <InfoCard label="LinkedIn" value={c.linkedin || '—'} />
      <InfoCard label="Discord" value={c.discord || '—'} />
      <InfoCard label="Contract Start" value={c.contractStart} />
      <InfoCard label="Contract Type" value={c.contractType} />
    </div>
    <Section title="Services Active">
      {c.servicesActive.map((s) => (
        <div key={s.service} className="flex items-center" style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <span style={{ width: '25%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{s.service}</span>
          <span style={{ width: '40%', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{s.description}</span>
          <span style={{ width: '35%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{s.scopeNotes}</span>
        </div>
      ))}
    </Section>
    <Section title="Upcoming Dates">
      {c.upcomingDates.map((d) => (
        <div key={d.date} className="flex items-center" style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <span style={{ width: '20%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px' }}>{d.date}</span>
          <span style={{ width: '50%', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{d.event}</span>
          <span style={{ width: '30%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{d.who}</span>
        </div>
      ))}
    </Section>
  </div>
);

const BrandTab: React.FC<{ client: ClientProfile }> = ({ client: c }) => (
  <div className="flex flex-col gap-4">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '12px' }}>Primary Colour</span>
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 8, background: c.primaryColour }} />
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px' }}>{c.primaryColour}</span>
        </div>
      </div>
      <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '12px' }}>Secondary</span>
        <div className="flex gap-2">
          {c.secondaryColours.map((col) => (
            <div key={col} style={{ width: 32, height: 32, borderRadius: 6, background: col, border: '1px solid rgba(0,0,0,0.1)' }} title={col} />
          ))}
        </div>
      </div>
    </div>
    <InfoCard label="Primary Font" value={c.primaryFont} />
    <InfoCard label="Tone of Voice" value={c.toneOfVoice} />
    <Section title="Key Messaging Pillars">
      <div className="flex flex-col gap-1">
        {c.keyMessaging.map((m) => <span key={m} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', padding: '4px 0' }}>• {m}</span>)}
      </div>
    </Section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <Section title="Content DO's">
        {c.contentDos.map((d) => <span key={d} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', display: 'block', padding: '3px 0', color: '#27AE60' }}>✓ {d}</span>)}
      </Section>
      <Section title="Content DON'Ts">
        {c.contentDonts.map((d) => <span key={d} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', display: 'block', padding: '3px 0', color: '#E74C3C' }}>✗ {d}</span>)}
      </Section>
    </div>
  </div>
);

const ProjectsTab: React.FC<{ client: ClientProfile }> = ({ client: c }) => (
  <Section title="Active Projects">
    <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
      <div className="flex items-center" style={{ padding: '12px 20px', borderBottom: '0.733px solid var(--border-default)', opacity: 0.5 }}>
        <TH width="15%">Code</TH><TH width="30%">Title</TH><TH width="15%">Status</TH><TH width="20%">Lead</TH><TH width="20%">Blocker</TH>
      </div>
      {c.activeProjects.map((p) => (
        <div key={p.code} className="flex items-center" style={{ padding: '12px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <span style={{ width: '15%', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{p.code}</span>
          <span style={{ width: '30%', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{p.title}</span>
          <span style={{ width: '15%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px' }}>{p.status}</span>
          <span style={{ width: '20%', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{p.lead}</span>
          <span style={{ width: '20%', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{p.blocker || '—'}</span>
        </div>
      ))}
    </div>
  </Section>
);

const ContactsTab: React.FC<{ client: ClientProfile }> = ({ client: c }) => (
  <div className="flex flex-col gap-3">
    {c.contacts.map((ct) => (
      <div key={ct.email} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px 24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{ct.name}</span>
          {ct.isPrimary && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.15)', border: '1px solid rgba(215,171,197,0.3)' }}>Primary</span>}
        </div>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.6, display: 'block' }}>{ct.role}</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', display: 'block', marginTop: '4px' }}>{ct.email}</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, display: 'block', marginTop: '4px' }}>Prefers: {ct.commsPreference}</span>
      </div>
    ))}
  </div>
);

const StrategyTab: React.FC<{ client: ClientProfile }> = ({ client: c }) => (
  <div className="flex flex-col gap-4">
    <Section title="Macro Strategy">
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{c.macroStrategy}</p>
    </Section>
    <Section title="Current Sprint Focus">
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{c.currentSprintFocus}</p>
    </Section>
    <Section title="What We Are NOT Doing">
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: 0, color: '#E74C3C' }}>{c.whatWeAreNotDoing}</p>
    </Section>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '8px' }}>
    <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>{title}</h3>
    {children}
  </div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '16px 20px' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '6px' }}>{label}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{value}</span>
  </div>
);

const QuickPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '0.5px', padding: '4px 12px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)', opacity: 0.7 }}>
    {label}: <strong>{value}</strong>
  </span>
);

const TH: React.FC<{ width: string; children: React.ReactNode }> = ({ width, children }) => (
  <span style={{ width, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{children}</span>
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

export default ClientHubPage;
