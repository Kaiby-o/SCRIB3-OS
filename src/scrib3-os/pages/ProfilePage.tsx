import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../hooks/useAuth';
import { mockTeam } from '../lib/team';
import { getLevel, getLevelProgress } from '../lib/xp';

const ICON_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Icons/';

interface ProfileData {
  id: string;
  display_name: string;
  email: string;
  role: string;
  title: string;
  unit: string;
  location: string;
  timezone: string;
  bio: string;
  xp: number;
  avatar_url?: string;
  created_at?: string;
  skillsets?: string[];
  social_links?: { platform: string; url: string }[];
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [editBio, setEditBio] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkillsets, setEditSkillsets] = useState('');
  const [editSocials, setEditSocials] = useState<{ platform: string; url: string }[]>([]);
  const [addingSocial, setAddingSocial] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const profileId = id ?? user?.id;
  const isOwnProfile = user?.id === profileId;

  // Also try to get mock data for enrichment
  const mockMember = mockTeam.find((m) => m.email === profile?.email);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
        if (cancelled) return;
        if (error) console.warn('[profile] Load failed:', error.message);
        if (data) {
          const p = data as ProfileData;
          setProfile(p);
          setEditBio(p.bio ?? '');
          setEditTitle(p.title ?? '');
          setEditLocation(p.location ?? '');
          setEditSkillsets((p.skillsets ?? []).join(', '));
          setEditSocials(p.social_links ?? []);
        }
      } catch (e) { console.warn('[profile] Error:', e); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  const handleSave = async () => {
    if (!profile || !isOwnProfile) return;
    setSaving(true);
    const updates = {
      bio: editBio, title: editTitle, location: editLocation,
      skillsets: editSkillsets.split(',').map((s) => s.trim()).filter(Boolean),
      social_links: editSocials,
    };
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, ...updates });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const addSocial = () => {
    if (!newPlatform || !newUrl) return;
    setEditSocials([...editSocials, { platform: newPlatform, url: newUrl }]);
    setNewPlatform(''); setNewUrl(''); setAddingSocial(false);
  };

  const currentClients = mockMember?.currentClients ?? [];
  const currentProjects = mockMember?.currentProjects ?? [];

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{profile?.display_name ?? 'Profile'}</span>
        <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ marginTop: '120px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.4, textTransform: 'uppercase' }}>Loading...</span>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center" style={{ marginTop: '120px' }}>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Profile Not Found</h1>
          </div>
        ) : (
          <>
            {/* Avatar + Name + Title */}
            <div className="flex items-start gap-6" style={{ marginBottom: '16px' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                  <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '40px' }}>{profile.display_name?.charAt(0) ?? '?'}</span>}
              </div>
              <div className="flex flex-col gap-2" style={{ paddingTop: '8px', flex: 1 }}>
                <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>{profile.display_name}</h1>
                {editing ? (
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title"
                    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '6px 14px', outline: 'none' }} />
                ) : (
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.6 }}>{profile.title || profile.role}</span>
                )}
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', background: '#000', color: '#EAF2D7', padding: '5px 14px', borderRadius: '75.641px' }}>{profile.role}</span>
                  {isOwnProfile && !editing && <button onClick={() => setEditing(true)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', opacity: 0.5 }}>Edit</button>}
                  {saved && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', color: '#27AE60' }}>Saved</span>}
                </div>
              </div>
            </div>

            {/* XP + Bandwidth bar — prominent at top */}
            {(() => {
              const xp = profile.xp ?? 0;
              const level = getLevel(xp);
              const progress = getLevelProgress(xp);
              const bw = mockMember?.bandwidthPct ?? 0;
              return (
                <div className="flex gap-4" style={{ marginBottom: '16px' }}>
                  <div style={{ flex: 1, background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '14px 18px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>XP — Lvl {level.level} {level.name}</span>
                      <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px' }}>{xp}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: '#D7ABC5', borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '14px 18px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>Bandwidth</span>
                      <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px' }}>{bw}%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${bw}%`, height: '100%', background: bw > 85 ? '#E74C3C' : bw > 60 ? '#E67E22' : '#27AE60', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick actions: Chat + Dapps */}
            {!isOwnProfile && (
              <div className="flex gap-2" style={{ marginBottom: '16px' }}>
                <button onClick={() => navigate('/chat')} className="flex items-center gap-2"
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
                  <img src={ICON_BASE + 'chat.svg'} alt="" style={{ width: 16, height: 16 }} />
                  Message
                </button>
                <button onClick={() => navigate('/dapps')} className="flex items-center gap-2"
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
                  <img src={ICON_BASE + 'dapps.svg'} alt="" style={{ width: 16, height: 16 }} />
                  Dapp
                </button>
              </div>
            )}

            {/* Social links as capsules — email + socials + add button */}
            <div className="flex gap-2 flex-wrap" style={{ marginBottom: '24px' }}>
              <LinkCapsule platform="Email" url={`mailto:${profile.email}`} label={profile.email} />
              {(editing ? editSocials : (profile.social_links ?? [])).map((link, i) => (
                <LinkCapsule key={i} platform={link.platform} url={link.url} label={link.platform} />
              ))}
              {isOwnProfile && editing && (
                addingSocial ? (
                  <div className="flex gap-2 items-center">
                    <input value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} placeholder="Platform" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', width: '80px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '5px 10px', outline: 'none' }} />
                    <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', width: '150px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '5px 10px', outline: 'none' }} />
                    <button onClick={addSocial} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', padding: '5px 10px', borderRadius: '75.641px', border: 'none', background: '#D7ABC5', cursor: 'pointer' }}>Add</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSocial(true)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', padding: '5px 14px', borderRadius: '75.641px', border: '1px dashed var(--border-default)', background: 'transparent', cursor: 'pointer', opacity: 0.4 }}>+ Add</button>
                )
              )}
            </div>

            {/* Bio */}
            <Sec title="Bio">
              {editing ? (
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell the team about yourself..." rows={4}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px', outline: 'none', resize: 'vertical' }} />
              ) : (
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.6, opacity: profile.bio ? 0.8 : 0.3, margin: 0 }}>
                  {profile.bio || (isOwnProfile ? 'Click Edit to add a bio' : 'No bio yet')}
                </p>
              )}
            </Sec>

            {/* Skillsets */}
            <Sec title="Skillsets">
              {editing ? (
                <input value={editSkillsets} onChange={(e) => setEditSkillsets(e.target.value)} placeholder="Comma-separated"
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', outline: 'none' }} />
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {(profile.skillsets ?? []).length > 0 ? (profile.skillsets ?? []).map((s) => (
                    <span key={s} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.15)', border: '1px solid rgba(215,171,197,0.3)' }}>{s}</span>
                  )) : <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.3 }}>No skills listed</span>}
                </div>
              )}
            </Sec>

            {/* Current Clients — clickable */}
            {currentClients.length > 0 && (
              <Sec title="Current Clients">
                <div className="flex gap-2 flex-wrap">
                  {currentClients.map((c) => (
                    <button key={c} onClick={() => navigate(`/clients/${c.toLowerCase().replace(/\s+/g, '-')}/hub`)}
                      style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </Sec>
            )}

            {/* Current Projects — clickable */}
            {currentProjects.length > 0 && (
              <Sec title="Current Projects">
                <div className="flex gap-2 flex-wrap">
                  {currentProjects.map((p) => (
                    <button key={p} onClick={() => navigate(`/projects/${p}`)}
                      style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </Sec>
            )}

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <Card label="Unit" value={profile.unit ?? '—'} />
              {editing ? (
                <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '14px 18px' }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '4px' }}>Location</span>
                  <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', width: '100%', background: 'transparent', border: 'none', outline: 'none' }} />
                </div>
              ) : <Card label="Location" value={profile.location ?? '—'} />}
              <Card label="Joined" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'} />
              <Card label="Experience" value={`${profile.xp ?? 0} XP`} />
            </div>

            {/* XP bar */}
            <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px', marginBottom: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>XP</span>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px' }}>{profile.xp ?? 0} / 100</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(((profile.xp ?? 0) / 100) * 100, 100)}%`, height: '100%', background: '#D7ABC5', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Save / Cancel */}
            {editing && (
              <div className="flex gap-3" style={{ marginBottom: '24px' }}>
                <button onClick={handleSave} disabled={saving} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}

            {isOwnProfile && !editing && (
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.35, textAlign: 'center' }}>This is your profile</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Sec: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{title}</h2>
    {children}
  </div>
);

const Card: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '14px 18px' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '4px' }}>{label}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{value}</span>
  </div>
);

const LinkCapsule: React.FC<{ platform: string; url: string; label: string }> = ({ url, label }) => (
  <a href={url} target="_blank" rel="noopener noreferrer"
    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)', color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    {label}
  </a>
);

export default ProfilePage;
