import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { useSupabaseQuery } from '../hooks/useSupabase';

/* ------------------------------------------------------------------ */
/*  Mock client data                                                   */
/* ------------------------------------------------------------------ */

interface ClientRecord {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  status: 'active' | 'onboarding' | 'completed' | 'paused';
  projectCount: number;
  revenue: string;
  startDate: string;
}

const mockClients: ClientRecord[] = [
  {
    id: 'c1',
    name: 'Nexus Labs',
    contactName: 'Sarah Chen',
    contactEmail: 'sarah@nexuslabs.io',
    status: 'active',
    projectCount: 3,
    revenue: '$48,000',
    startDate: 'Jan 2026',
  },
  {
    id: 'c2',
    name: 'BlockVenture',
    contactName: 'Marcus Rivera',
    contactEmail: 'marcus@blockventure.co',
    status: 'active',
    projectCount: 2,
    revenue: '$32,000',
    startDate: 'Feb 2026',
  },
  {
    id: 'c3',
    name: 'MetaDAO',
    contactName: 'Aiko Tanaka',
    contactEmail: 'aiko@metadao.xyz',
    status: 'onboarding',
    projectCount: 0,
    revenue: '$0',
    startDate: 'Mar 2026',
  },
  {
    id: 'c4',
    name: 'ChainPay',
    contactName: 'Dev Patel',
    contactEmail: 'dev@chainpay.finance',
    status: 'active',
    projectCount: 1,
    revenue: '$18,500',
    startDate: 'Dec 2025',
  },
  {
    id: 'c5',
    name: 'Prism Protocol',
    contactName: 'Ella Morrison',
    contactEmail: 'ella@prismprotocol.io',
    status: 'completed',
    projectCount: 2,
    revenue: '$27,000',
    startDate: 'Oct 2025',
  },
  {
    id: 'c6',
    name: 'Lunar Collective',
    contactName: 'Jordan Kim',
    contactEmail: 'jordan@lunarcollective.art',
    status: 'paused',
    projectCount: 1,
    revenue: '$12,000',
    startDate: 'Nov 2025',
  },
];

const statusColors: Record<string, string> = {
  active: '#D7ABC5',
  onboarding: '#6E93C3',
  completed: '#000000',
  paused: 'rgba(0,0,0,0.3)',
};

/* ------------------------------------------------------------------ */
/*  Client List Page                                                   */
/* ------------------------------------------------------------------ */

const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');

  // Supabase query
  const { data: dbClients } = useSupabaseQuery<Record<string, unknown>>(
    'client_profiles', '*', undefined, { column: 'company_name', ascending: true }
  );

  const allClients: ClientRecord[] = useMemo(() => {
    if (dbClients.length > 0) {
      return dbClients.map((c) => ({
        id: c.id as string,
        name: (c.company_name ?? '') as string,
        contactName: '—',
        contactEmail: '',
        status: (c.onboarding_complete ? 'active' : 'onboarding') as ClientRecord['status'],
        projectCount: 0,
        revenue: c.contract_value ? `$${Number(c.contract_value).toLocaleString()}` : '—',
        startDate: c.contract_start ? new Date(c.contract_start as string).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—',
      }));
    }
    return mockClients;
  }, [dbClients]);

  const filtered =
    filter === 'all'
      ? allClients
      : allClients.filter((c) => c.status === filter);

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{
          position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px',
          padding: '0 40px',
          borderBottom: '0.733px solid var(--border-default)',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
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
          Client Management
        </span>

        <button
          onClick={() => navigate('/dashboard')}
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
          &larr; Dashboard
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Title + Onboard button */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '32px' }}
        >
          <h1
            style={{
              fontFamily: "'Kaio', sans-serif",
              fontWeight: 800,
              fontSize: '32px',
              textTransform: 'uppercase',
              fontFeatureSettings: "'ordn' 1, 'dlig' 1",
              margin: 0,
            }}
          >
            Clients
          </h1>
          <button
            onClick={() => navigate('/clients/onboard')}
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              background: '#000000',
              color: '#EAF2D7',
              border: 'none',
              borderRadius: '75.641px',
              padding: '10px 24px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            + New Client
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          {['all', 'active', 'onboarding', 'completed', 'paused'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "'Owners Wide', sans-serif",
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '6px 16px',
                borderRadius: '75.641px',
                border:
                  filter === f
                    ? '1px solid var(--text-primary)'
                    : '1px solid var(--border-default)',
                background: filter === f ? 'var(--text-primary)' : 'transparent',
                color:
                  filter === f
                    ? 'var(--bg-primary)'
                    : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: filter === f ? 1 : 0.6,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex gap-6" style={{ marginBottom: '32px' }}>
          <Stat value={mockClients.filter((c) => c.status === 'active').length.toString()} label="active" />
          <Stat value={mockClients.filter((c) => c.status === 'onboarding').length.toString()} label="onboarding" />
          <Stat value="$137.5K" label="total revenue" />
          <Stat
            value={mockClients.reduce((a, c) => a + c.projectCount, 0).toString()}
            label="total projects"
          />
        </div>

        {/* Client table */}
        <div
          style={{
            border: '0.733px solid var(--border-default)',
            borderRadius: '10.258px',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            className="flex items-center"
            style={{
              padding: '14px 24px',
              borderBottom: '0.733px solid var(--border-default)',
              opacity: 0.5,
            }}
          >
            <TableHead width="25%">Client</TableHead>
            <TableHead width="20%">Contact</TableHead>
            <TableHead width="15%">Status</TableHead>
            <TableHead width="12%">Projects</TableHead>
            <TableHead width="15%">Revenue</TableHead>
            <TableHead width="13%">Since</TableHead>
          </div>

          {/* Table rows */}
          {filtered.map((client) => (
            <div
              key={client.id}
              className="flex items-center"
              style={{
                padding: '16px 24px',
                borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--bg-surface)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <div style={{ width: '25%' }}>
                <span
                  style={{
                    fontFamily: "'Kaio', sans-serif",
                    fontWeight: 800,
                    fontSize: '15px',
                    textTransform: 'uppercase',
                  }}
                >
                  {client.name}
                </span>
              </div>
              <div style={{ width: '20%' }}>
                <div className="flex flex-col">
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>
                    {client.contactName}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Owners Wide', sans-serif",
                      fontSize: '11px',
                      opacity: 0.5,
                    }}
                  >
                    {client.contactEmail}
                  </span>
                </div>
              </div>
              <div style={{ width: '15%' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: "'Owners Wide', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: statusColors[client.status],
                      display: 'inline-block',
                    }}
                  />
                  {client.status}
                </span>
              </div>
              <div style={{ width: '12%' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>
                  {client.projectCount}
                </span>
              </div>
              <div style={{ width: '15%' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>
                  {client.revenue}
                </span>
              </div>
              <div style={{ width: '13%' }}>
                <span
                  style={{
                    fontFamily: "'Owners Wide', sans-serif",
                    fontSize: '12px',
                    opacity: 0.6,
                  }}
                >
                  {client.startDate}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              className="flex items-center justify-center"
              style={{ padding: '48px', opacity: 0.4 }}
            >
              <span
                style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                No clients match this filter
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Micro-components                                                   */
/* ------------------------------------------------------------------ */

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col gap-1">
    <span
      style={{
        fontFamily: "'Kaio', sans-serif",
        fontWeight: 800,
        fontSize: '24px',
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        opacity: 0.45,
      }}
    >
      {label}
    </span>
  </div>
);

const TableHead: React.FC<{ width: string; children: React.ReactNode }> = ({
  width,
  children,
}) => (
  <span
    style={{
      width,
      fontFamily: "'Owners Wide', sans-serif",
      fontSize: '11px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    }}
  >
    {children}
  </span>
);

export default ClientListPage;
