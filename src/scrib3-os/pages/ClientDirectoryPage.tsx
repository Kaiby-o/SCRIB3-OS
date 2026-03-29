import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { priorityClients, type ClientProfile } from '../lib/clients';

/* ------------------------------------------------------------------ */
/*  Client Directory — grid of all clients with brand colours + logos   */
/* ------------------------------------------------------------------ */

const LOGO_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/ClientLogos/';

// Extended client list (priority + additional from Plan v4)
const allClients: (ClientProfile & { logoUrl?: string })[] = [
  ...priorityClients.map((c) => ({ ...c, logoUrl: LOGO_BASE + c.slug + '.svg' })),
];

const ClientDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  const filtered = allClients.filter((c) => {
    if (search && !c.companyName.toLowerCase().includes(search.toLowerCase()) && !c.industry.toLowerCase().includes(search.toLowerCase())) return false;
    if (healthFilter !== 'all' && c.accountHealth !== healthFilter) return false;
    return true;
  });

  const activeCount = allClients.length;
  const healthyCounts = {
    '🟢': allClients.filter((c) => c.accountHealth === '🟢').length,
    '🟡': allClients.filter((c) => c.accountHealth === '🟡').length,
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Clients</span>
        <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Title + Search */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px', flexWrap: isMobile ? 'wrap' as const : undefined, gap: isMobile ? '12px' : undefined }}>
          <div>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '24px' : '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>Clients</h1>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
              {activeCount} active clients
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..."
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 20px', color: 'var(--text-primary)', outline: 'none', width: isMobile ? '100%' : '240px' }} />
            <button onClick={() => navigate('/clients/onboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', background: '#000', color: '#EAF2D7', border: 'none', borderRadius: '75.641px', padding: '10px 24px', cursor: 'pointer' }}>
              + New Client
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6" style={{ marginBottom: '24px' }}>
          <Stat value={activeCount.toString()} label="total clients" />
          <Stat value={healthyCounts['🟢'].toString()} label="healthy" />
          <Stat value={healthyCounts['🟡'].toString()} label="attention needed" accent />
        </div>

        {/* Health filter */}
        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          <Pill label="All" active={healthFilter === 'all'} onClick={() => setHealthFilter('all')} />
          {['🟢', '🟡', '🟠', '🔴', '⭐'].map((h) => (
            <Pill key={h} label={`${h}`} active={healthFilter === h} onClick={() => setHealthFilter(healthFilter === h ? 'all' : h)} />
          ))}
        </div>

        {/* Client grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.slug}/hub`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center" style={{ padding: '80px', opacity: 0.4 }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>No clients match this filter</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Client Card                                                        */
/* ------------------------------------------------------------------ */

const ClientCard: React.FC<{ client: ClientProfile & { logoUrl?: string }; onClick: () => void }> = ({ client: c, onClick }) => {
  const [imgError, setImgError] = useState(false);
  

  return (
    <div onClick={onClick} style={{
      border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px',
      cursor: 'pointer', transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Brand colour stripe at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: c.primaryColour }} />

      {/* Health indicator */}
      <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '16px' }}>{c.accountHealth}</div>

      {/* Logo / Brand initial */}
      <div className="flex items-center gap-4" style={{ marginBottom: '16px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '10.258px', background: c.primaryColour,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
        }}>
          {c.logoUrl && !imgError ? (
            <img src={c.logoUrl} alt={c.companyName} style={{ width: '70%', height: '70%', objectFit: 'contain' }} onError={() => setImgError(true)} />
          ) : (
            <span style={{ color: '#fff', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '22px' }}>{c.companyName.charAt(0)}</span>
          )}
        </div>
        <div>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', display: 'block', lineHeight: 1.1 }}>{c.companyName}</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{c.industry}</span>
        </div>
      </div>

      {/* Services */}
      <div className="flex gap-1 flex-wrap" style={{ marginBottom: '12px' }}>
        {c.servicesActive.slice(0, 3).map((s) => (
          <span key={s.service} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.12)', border: '1px solid rgba(215,171,197,0.3)' }}>
            {s.service}
          </span>
        ))}
      </div>

      {/* Key info row */}
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>
          {c.contractType} · Since {c.contractStart}
        </span>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>{c.accountLead}</span>
        </div>
      </div>

      {/* Contacts count */}
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.35 }}>
          {c.contacts.length} contact{c.contacts.length !== 1 ? 's' : ''} · {c.activeProjects.length} active project{c.activeProjects.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const Stat: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="flex flex-col gap-1">
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: accent ? '#F1C40F' : 'var(--text-primary)' }}>{value}</span>
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
    cursor: 'pointer', opacity: active ? 1 : 0.6,
  }}>{label}</button>
);

export default ClientDirectoryPage;
