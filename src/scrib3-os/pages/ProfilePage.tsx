import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../hooks/useAuth';

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

const roleTitles: Record<string, string> = {
  admin: 'Administrator',
  team: 'Team Member',
  csuite: 'Executive',
  client: 'Client Partner',
  vendor: 'Vendor Partner',
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit form state
  const [editBio, setEditBio] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkillsets, setEditSkillsets] = useState('');

  const profileId = id ?? user?.id;
  const isOwnProfile = user?.id === profileId;

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (data) {
        const p = data as ProfileData;
        setProfile(p);
        setEditBio(p.bio ?? '');
        setEditTitle(p.title ?? '');
        setEditLocation(p.location ?? '');
        setEditSkillsets((p.skillsets ?? []).join(', '));
      }
      setLoading(false);
    })();
  }, [profileId]);

  const handleSave = async () => {
    if (!profile || !isOwnProfile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      bio: editBio,
      title: editTitle,
      location: editLocation,
      skillsets: editSkillsets.split(',').map((s) => s.trim()).filter(Boolean),
    }).eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, bio: editBio, title: editTitle, location: editLocation, skillsets: editSkillsets.split(',').map((s) => s.trim()).filter(Boolean) });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          {profile?.display_name ?? 'Profile'}
        </span>
        <button onClick={() => navigate(-1 as number)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ marginTop: '120px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>Loading...</span>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center" style={{ marginTop: '120px' }}>
            <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>Profile Not Found</h1>
          </div>
        ) : (
          <>
            {/* Header section */}
            <div className="flex items-start gap-6" style={{ marginBottom: '32px' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '40px' }}>
                    {profile.display_name?.charAt(0) ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2" style={{ paddingTop: '8px', flex: 1 }}>
                <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '32px', lineHeight: 0.9, textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: 0 }}>
                  {profile.display_name}
                </h1>
                {editing ? (
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title / role"
                    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '6px 14px', outline: 'none' }} />
                ) : (
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', letterSpacing: '0.8px', opacity: 0.6 }}>
                    {profile.title || (roleTitles[profile.role] ?? profile.role)}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span style={{ display: 'inline-block', width: 'fit-content', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', background: '#000', color: '#EAF2D7', padding: '5px 14px', borderRadius: '75.641px' }}>
                    {profile.role}
                  </span>
                  {isOwnProfile && !editing && (
                    <button onClick={() => setEditing(true)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', opacity: 0.5 }}>
                      Edit Profile
                    </button>
                  )}
                  {saved && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', color: '#27AE60' }}>Saved</span>}
                </div>
              </div>
            </div>

            {/* Bio */}
            <Section title="Bio">
              {editing ? (
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell the team about yourself..." rows={4}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px', outline: 'none', resize: 'vertical' }} />
              ) : (
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.6, opacity: profile.bio ? 0.8 : 0.3, margin: 0 }}>
                  {profile.bio || (isOwnProfile ? 'Click "Edit Profile" to add a bio' : 'No bio yet')}
                </p>
              )}
            </Section>

            {/* Skillsets */}
            <Section title="Skillsets">
              {editing ? (
                <input value={editSkillsets} onChange={(e) => setEditSkillsets(e.target.value)} placeholder="Comma-separated skills"
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', outline: 'none' }} />
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {(profile.skillsets ?? []).length > 0 ? (profile.skillsets ?? []).map((s) => (
                    <span key={s} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.15)', border: '1px solid rgba(215,171,197,0.3)' }}>{s}</span>
                  )) : (
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.3 }}>{isOwnProfile ? 'Add your skills' : 'No skills listed'}</span>
                  )}
                </div>
              )}
            </Section>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <InfoCard label="Email" value={profile.email ?? '—'} />
              <InfoCard label="Unit" value={profile.unit ?? '—'} />
              {editing ? (
                <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '16px 20px' }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '6px' }}>Location</span>
                  <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: 'transparent', border: 'none', outline: 'none' }} />
                </div>
              ) : (
                <InfoCard label="Location" value={profile.location ?? '—'} />
              )}
              <InfoCard label="Joined" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'} />
              <InfoCard label="Experience" value={`${profile.xp ?? 0} XP`} />
              <InfoCard label="Role" value={profile.role?.toUpperCase() ?? '—'} />
            </div>

            {/* XP bar */}
            <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Experience Progress</span>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px' }}>{profile.xp ?? 0} / 100</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(((profile.xp ?? 0) / 100) * 100, 100)}%`, height: '100%', background: '#D7ABC5', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Save / Cancel buttons */}
            {editing && (
              <div className="flex gap-3" style={{ marginBottom: '24px' }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); setEditBio(profile.bio ?? ''); setEditTitle(profile.title ?? ''); setEditLocation(profile.location ?? ''); setEditSkillsets((profile.skillsets ?? []).join(', ')); }}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
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

export default ProfilePage;
