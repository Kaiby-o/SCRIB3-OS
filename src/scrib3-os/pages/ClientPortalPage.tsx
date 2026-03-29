import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { useIsMobile } from '../hooks/useIsMobile';
import { priorityClients } from '../lib/clients';

/* ------------------------------------------------------------------ */
/*  Plan v4 §3J — Client Portal (client-facing)                       */
/*  Custom-themed per client from brand token extraction               */
/*  Modules: Project Status / Deliverables / Team / Contract /         */
/*  Announcements / Asset Library / Content Calendar                   */
/* ------------------------------------------------------------------ */

const ClientPortalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const client = priorityClients.find((c) => c.slug === slug);

  if (!client) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Portal Not Found</h1>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', marginTop: '24px', padding: '10px 24px', border: '0.733px solid #000', borderRadius: '75.641px', background: 'transparent', cursor: 'pointer' }}>
          &larr; Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#1A1A1A', fontFamily: "'Owners Wide', sans-serif" }}>
      {/* Branded header */}
      <header style={{ background: client.primaryColour, padding: isMobile ? '16px' : '24px 40px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : undefined }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '14px' }}>{client.companyName.charAt(0)}</span>
          </div>
          <span style={{ color: '#fff', fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '16px' : '20px', textTransform: 'uppercase' }}>
            {client.companyName}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Client Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Powered by</span>
          <LogoScrib3 height={14} color="rgba(255,255,255,0.8)" />
        </div>
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Module grid */}
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '16px' } : { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto', gap: '16px', gridTemplateAreas: '"status status deliverables" "team contract contract" "announce assets calendar"' }}>
          {/* Project Status */}
          <PortalModule title="Project Status" gridArea="status">
            {client.activeProjects.map((p) => (
              <div key={p.code} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{p.code}</span>
                  <span style={{ fontSize: '12px', marginLeft: '8px' }}>{p.title}</span>
                </div>
                <StatusPill status={p.status} />
              </div>
            ))}
          </PortalModule>

          {/* Recent Deliverables */}
          <PortalModule title="Recent Deliverables" gridArea="deliverables">
            <DeliverableRow name="Brand Guidelines v3.pdf" date="Mar 18" status="Delivered" />
            <DeliverableRow name="Social Pack — March.zip" date="Mar 12" status="Delivered" />
            <DeliverableRow name="Q1 Campaign Deck.pdf" date="Mar 5" status="Review" />
          </PortalModule>

          {/* Your SCRIB3 Team */}
          <PortalModule title="Your SCRIB3 Team" gridArea="team">
            <TeamRow name={client.accountLead} role="Account Lead" />
            <TeamRow name={client.creativeLead} role="Creative Lead" />
            {client.prLead && <TeamRow name={client.prLead} role="PR Lead" />}
          </PortalModule>

          {/* Contract & Invoicing */}
          <PortalModule title="Contract & Invoicing" gridArea="contract">
            <div style={{ display: 'grid', gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <MiniCard label="Contract Type" value={client.contractType} />
              <MiniCard label="Started" value={client.contractStart} />
              <MiniCard label="Slack Channel" value={client.slackChannel} />
              <MiniCard label="Health" value={client.accountHealth} />
            </div>
          </PortalModule>

          {/* Announcements */}
          <PortalModule title="Announcements" gridArea="announce">
            <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>No new announcements.</p>
          </PortalModule>

          {/* Asset Library */}
          <PortalModule title="Asset Library" gridArea="assets">
            <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>Brand assets and deliverables will appear here.</p>
          </PortalModule>

          {/* Content Calendar */}
          <PortalModule title="Content Calendar" gridArea="calendar">
            {client.upcomingDates.map((d) => (
              <div key={d.date} style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: '12px' }}>
                <strong>{d.date}</strong> — {d.event}
              </div>
            ))}
          </PortalModule>
        </div>

        {/* Back link for internal users */}
        <div className="flex justify-center" style={{ marginTop: '40px' }}>
          <button onClick={() => navigate(`/clients/${client.slug}/hub`)} style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: '1px solid #ccc', background: 'transparent', cursor: 'pointer', opacity: 0.5 }}>
            &larr; Internal Hub
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Portal Module                                                      */
/* ------------------------------------------------------------------ */

const PortalModule: React.FC<{ title: string; gridArea: string; children: React.ReactNode }> = ({ title, gridArea, children }) => (
  <div style={{ gridArea: typeof window !== 'undefined' && window.innerWidth < 768 ? undefined : gridArea, background: '#fff', border: '1px solid #E8E8E8', borderRadius: '12px', padding: typeof window !== 'undefined' && window.innerWidth < 768 ? '16px' : '24px' }}>
    <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', margin: '0 0 16px 0', opacity: 0.6 }}>{title}</h3>
    {children}
  </div>
);

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const color = status === 'Active' ? '#27AE60' : status === 'In Progress' ? '#6E93C3' : '#95A5A6';
  return (
    <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', background: `${color}15`, border: `1px solid ${color}30` }}>
      {status}
    </span>
  );
};

const DeliverableRow: React.FC<{ name: string; date: string; status: string }> = ({ name, date, status }) => (
  <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: '12px' }}>
    <span>{name}</span>
    <div className="flex items-center gap-2">
      <span style={{ opacity: 0.5 }}>{date}</span>
      <StatusPill status={status} />
    </div>
  </div>
);

const TeamRow: React.FC<{ name: string; role: string }> = ({ name, role }) => (
  <div className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '11px' }}>{name.charAt(0)}</span>
    </div>
    <div>
      <span style={{ fontSize: '13px', display: 'block' }}>{name}</span>
      <span style={{ fontSize: '11px', opacity: 0.5 }}>{role}</span>
    </div>
  </div>
);

const MiniCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: '#F8F8F8', borderRadius: '8px', padding: '12px 16px' }}>
    <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '4px' }}>{label}</span>
    <span style={{ fontSize: '13px' }}>{value}</span>
  </div>
);

export default ClientPortalPage;
