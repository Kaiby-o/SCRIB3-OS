import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { mockTeam, availabilityColors, getInitials, type TeamMember } from '../lib/team';
import { getCapacityColor } from '../lib/bandwidth';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Plan v4 §2B — Team Profile Page                                    */
/*  Sections: Header → Social → Bio → Skillsets → Current Clients →   */
/*  Current Projects → (if own profile → Personal Dashboard Hub)       */
/* ------------------------------------------------------------------ */

const TeamProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const member = mockTeam.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Member Not Found</h1>
        <button onClick={() => navigate('/team')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: '#000', marginTop: '24px', padding: '10px 24px', border: '0.733px solid #000', borderRadius: '75.641px', background: 'transparent', cursor: 'pointer' }}>
          &larr; Team Directory
        </button>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/team')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          {member.name}
        </span>
        <button onClick={() => navigate('/team')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Directory
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Section 1: Header */}
        <ProfileHeader member={member} />

        {/* Section 2: Social icons */}
        {member.socialLinks.length > 0 && (
          <div className="flex gap-3" style={{ marginBottom: '32px' }}>
            {member.socialLinks.map((link) => (
              <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
                  padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)',
                  color: 'var(--text-primary)', textDecoration: 'none', transition: `opacity 0.2s ${easing}`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                {link.platform}
              </a>
            ))}
          </div>
        )}

        {/* Section 3: Bio */}
        {member.bio && (
          <Section title="Bio">
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
              {member.bio}
            </p>
          </Section>
        )}

        {/* Section 4: Skillsets */}
        {member.skillsets.length > 0 && (
          <Section title="Skillsets">
            <div className="flex gap-2 flex-wrap">
              {member.skillsets.map((s) => (
                <span key={s} style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
                  padding: '4px 12px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.15)', border: '1px solid rgba(215,171,197,0.3)',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Section 5: Current Clients */}
        {member.currentClients.length > 0 && (
          <Section title="Current Clients">
            <div className="flex gap-3 flex-wrap">
              {member.currentClients.map((c) => (
                <div key={c} className="flex items-center gap-2" style={{
                  padding: '8px 16px', borderRadius: '10.258px', border: '0.733px solid var(--border-default)',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '10px' }}>
                      {c.charAt(0)}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{c}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 6: Current Projects */}
        {member.currentProjects.length > 0 && (
          <Section title="Current Projects">
            <div className="flex gap-2 flex-wrap">
              {member.currentProjects.map((p) => (
                <span key={p} style={{
                  fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase',
                  padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)',
                }}>
                  {p}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '8px' }}>
          <InfoCard label="Email" value={member.email} />
          <InfoCard label="Unit" value={member.unit} />
          <InfoCard label="Location" value={member.location} />
          <InfoCard label="Timezone" value={member.timezone.split('/').pop()?.replace('_', ' ') ?? '—'} />
          <InfoCard label="Joined" value={new Date(member.joinedDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />
          <InfoCard label="XP" value={`${member.xp} XP`} />
        </div>

        {/* PD link */}
        <div className="flex justify-center" style={{ marginTop: '32px' }}>
          <button onClick={() => navigate(`/pd/${member.id}`)} style={{
            fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '10px 24px', borderRadius: '75.641px', border: '1px solid var(--border-default)',
            background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', transition: `opacity 0.2s ${easing}`,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            View Professional Development →
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Profile Header                                                     */
/* ------------------------------------------------------------------ */

const ProfileHeader: React.FC<{ member: TeamMember }> = ({ member: m }) => (
  <div className="flex items-start gap-6" style={{ marginBottom: '32px' }}>
    {/* Avatar */}
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {m.avatarUrl ? (
          <img src={m.avatarUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '38px' }}>
            {getInitials(m.name)}
          </span>
        )}
      </div>
      {/* Online dot */}
      <div style={{
        position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%',
        background: availabilityColors[m.availability], border: '2px solid var(--bg-primary)',
      }} />
    </div>

    {/* Info */}
    <div className="flex flex-col gap-2" style={{ paddingTop: '4px', flex: 1 }}>
      <div className="flex items-center gap-3">
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', lineHeight: 0.9, textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>
          {m.name}
        </h1>
      </div>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', letterSpacing: '0.8px', opacity: 0.6 }}>
        {m.title}
      </span>
      <div className="flex items-center gap-3">
        <span style={{ display: 'inline-block', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', background: '#000', color: '#EAF2D7', padding: '4px 12px', borderRadius: '75.641px' }}>
          {m.role}
        </span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>
          {m.location}
        </span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>
          {new Date().toLocaleTimeString('en-US', { timeZone: m.timezone, hour: '2-digit', minute: '2-digit', hour12: false })} local
        </span>
      </div>

      {/* Bandwidth bar */}
      <div className="flex items-center gap-3" style={{ marginTop: '4px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>Bandwidth</span>
        <div style={{ width: 100, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(m.bandwidthPct, 100)}%`, height: '100%', background: getCapacityColor(m.bandwidthPct), borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', color: getCapacityColor(m.bandwidthPct) }}>
          {m.bandwidthPct}%
        </span>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Micro-components                                                   */
/* ------------------------------------------------------------------ */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '28px' }}>
    <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 12px 0' }}>{title}</h2>
    {children}
  </div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '16px 20px' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '6px' }}>{label}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px' }}>{value}</span>
  </div>
);

export default TeamProfilePage;
