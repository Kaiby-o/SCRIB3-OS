import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProfileData {
  id: string;
  display_name: string;
  email: string;
  role: string;
  xp: number;
  avatar_url?: string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      setProfile(data as ProfileData | null);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="os-root" style={{ padding: '40px' }}>
      {/* Back link */}
      <Link
        to="/dashboard"
        style={{
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          opacity: 0.5,
          textDecoration: 'none',
        }}
      >
        &larr; BACK TO DASHBOARD
      </Link>

      {loading ? (
        <div className="flex items-center justify-center" style={{ marginTop: '200px' }}>
          <span className="text-body-sml" style={{ opacity: 0.5 }}>LOADING...</span>
        </div>
      ) : !profile ? (
        <div className="flex flex-col items-center justify-center" style={{ marginTop: '200px' }}>
          <h1 className="text-display-dash">PROFILE NOT FOUND</h1>
          <p className="text-body-sml" style={{ opacity: 0.5, marginTop: '16px' }}>
            User ID: {id}
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: '600px', margin: '80px auto 0' }}>
          {/* Avatar */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              overflow: 'hidden',
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '48px' }}>
                {profile.display_name?.charAt(0) ?? '?'}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-display-dash" style={{ marginBottom: '8px' }}>
            {profile.display_name}
          </h1>

          {/* Role badge */}
          <span
            style={{
              display: 'inline-block',
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              background: '#000000',
              color: '#EAF2D7',
              padding: '6px 16px',
              borderRadius: '75.641px',
              marginBottom: '32px',
            }}
          >
            {profile.role}
          </span>

          {/* Info grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginTop: '16px',
            }}
          >
            <InfoCard label="EMAIL" value={profile.email ?? '—'} />
            <InfoCard label="XP" value={`${profile.xp ?? 0} XP`} />
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      background: 'var(--bg-surface)',
      border: '0.733px solid var(--border-default)',
      borderRadius: '10.258px',
      padding: '20px',
    }}
  >
    <span
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        opacity: 0.5,
        display: 'block',
        marginBottom: '8px',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '16px',
        letterSpacing: '0.96px',
      }}
    >
      {value}
    </span>
  </div>
);

export default ProfilePage;
