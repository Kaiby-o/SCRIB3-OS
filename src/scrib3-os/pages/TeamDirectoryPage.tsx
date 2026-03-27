import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { mockTeam, availabilityColors, getInitials, type TeamMember } from '../lib/team';
import { getCapacityColor } from '../lib/bandwidth';
import { useSupabaseQuery } from '../hooks/useSupabase';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Plan v4 §2E — Team Directory                                      */
/*  /team — filterable gallery of all active members                   */
/*  Filter by: Unit, Location, Availability, Online status             */
/* ------------------------------------------------------------------ */

const TeamDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [unitFilter, setUnitFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Supabase query — used to enrich mock data with live DB values
  const { data: dbProfiles } = useSupabaseQuery<Record<string, unknown>>(
    'profiles', '*', undefined, { column: 'display_name', ascending: true }
  );

  // Start with mock data (has complete info + avatars), enrich with Supabase where available
  const allMembers: TeamMember[] = useMemo(() => {
    if (dbProfiles.length === 0) return mockTeam;

    // Build a lookup by email from Supabase
    const dbByEmail = new Map<string, Record<string, unknown>>();
    for (const p of dbProfiles) {
      if (p.email) dbByEmail.set(p.email as string, p);
    }

    // Merge: mock data is the base, Supabase overrides specific fields
    return mockTeam.map((m) => {
      const db = dbByEmail.get(m.email);
      if (!db) return m;
      return {
        ...m,
        // Override with DB values where they exist and are non-empty
        name: (db.display_name as string) || m.name,
        title: (db.title as string) || m.title,
        unit: (db.unit as string) || m.unit,
        location: (db.location as string) || m.location,
        bio: (db.bio as string) || m.bio,
        xp: (db.xp as number) ?? m.xp,
        bandwidthPct: (db.bandwidth as number) ?? m.bandwidthPct,
        avatarUrl: (db.avatar_url as string) || m.avatarUrl,
        availability: (db.availability as TeamMember['availability']) || m.availability,
        isOnline: (db.is_online as boolean) ?? m.isOnline,
      };
    });
  }, [dbProfiles]);

  const UNITS = useMemo(() => [...new Set(allMembers.map((m) => m.unit))].filter(u => u !== '—').sort(), [allMembers]);
  const LOCATIONS = useMemo(() => [...new Set(allMembers.map((m) => m.location))].filter(l => l !== '—').sort(), [allMembers]);

  const filtered = allMembers.filter((m) => {
    if (unitFilter !== 'all' && m.unit !== unitFilter) return false;
    if (locationFilter !== 'all' && m.location !== locationFilter) return false;
    if (availFilter !== 'all' && m.availability !== availFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const online = allMembers.filter((m) => m.isOnline).length;

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Team Directory</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>
              Team
            </h1>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
              {mockTeam.length} members · {online} online
            </p>
          </div>

          {/* Search */}
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or title..."
            style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 20px', color: 'var(--text-primary)', outline: 'none', width: '280px' }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap" style={{ marginBottom: '28px' }}>
          <FilterGroup label="Unit" value={unitFilter} onChange={setUnitFilter} options={['all', ...UNITS]} />
          <FilterGroup label="Location" value={locationFilter} onChange={setLocationFilter} options={['all', ...LOCATIONS]} />
          <FilterGroup label="Status" value={availFilter} onChange={setAvailFilter} options={['all', 'available', 'busy', 'away', 'offline']} />
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} onClick={() => navigate(`/team/${member.id}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center" style={{ padding: '80px', opacity: 0.4 }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No team members match these filters
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Member Card                                                        */
/* ------------------------------------------------------------------ */

const MemberCard: React.FC<{ member: TeamMember; onClick: () => void }> = ({ member: m, onClick }) => (
  <div
    onClick={onClick}
    style={{
      border: '0.733px solid var(--border-default)',
      borderRadius: '10.258px',
      padding: '24px',
      cursor: 'pointer',
      transition: `all 0.15s ${easing}`,
      position: 'relative',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
  >
    {/* Online dot */}
    <div
      style={{
        position: 'absolute', top: 16, right: 16,
        width: 8, height: 8, borderRadius: '50%',
        background: availabilityColors[m.availability],
      }}
      title={m.availability}
    />

    {/* Avatar */}
    <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
      <div
        style={{
          width: 52, height: 52, borderRadius: '50%', background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {m.avatarUrl ? (
          <img src={m.avatarUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '18px' }}>
            {getInitials(m.name)}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '15px', textTransform: 'uppercase' }}>
          {m.name}
        </span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.6 }}>
          {m.title}
        </span>
      </div>
    </div>

    {/* Unit badge */}
    <span
      style={{
        display: 'inline-block',
        fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
        background: '#000', color: '#EAF2D7', padding: '3px 10px', borderRadius: '75.641px',
        marginBottom: '12px',
      }}
    >
      {m.unit}
    </span>

    {/* Location + bandwidth */}
    <div className="flex items-center justify-between">
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>
        {m.location}
      </span>
      <div className="flex items-center gap-2">
        <div style={{ width: 40, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(m.bandwidthPct, 100)}%`, height: '100%', background: getCapacityColor(m.bandwidthPct), borderRadius: 2 }} />
        </div>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: getCapacityColor(m.bandwidthPct) }}>
          {m.bandwidthPct}%
        </span>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Filter Group                                                       */
/* ------------------------------------------------------------------ */

const FilterGroup: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="flex items-center gap-2">
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>
      {label}:
    </span>
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        fontFamily: "'Owners Wide', sans-serif", fontSize: '12px',
        background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)',
        borderRadius: '75.641px', padding: '6px 14px', color: 'var(--text-primary)',
        outline: 'none', cursor: 'pointer', appearance: 'none',
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o === 'all' ? 'All' : o}</option>)}
    </select>
  </div>
);

export default TeamDirectoryPage;
