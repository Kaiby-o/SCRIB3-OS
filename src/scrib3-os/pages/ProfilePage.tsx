import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../hooks/useAuth';

interface ProfileData {
  id: string;
  display_name: string;
  email: string;
  role: string;
  xp: number;
  avatar_url?: string;
  created_at?: string;
}

/* Role → title mapping for display */
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

  /* If no id provided, redirect to own profile */
  const profileId = id ?? user?.id;

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      setProfile(data as ProfileData | null);
      setLoading(false);
    })();
  }, [profileId]);

  const isOwnProfile = user?.id === profileId;

  return (
    <div className="os-root" style={{ padding: '40px', minHeight: '100vh' }}>
      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          opacity: 0.5,
          textDecoration: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
      >
        &larr; Back to Dashboard
      </button>

      {loading ? (
        <div className="flex items-center justify-center" style={{ marginTop: '200px' }}>
          <span
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '14px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              opacity: 0.4,
            }}
          >
            Loading...
          </span>
        </div>
      ) : !profile ? (
        <div className="flex flex-col items-center justify-center" style={{ marginTop: '200px' }}>
          <h1
            style={{
              fontFamily: "'Kaio', sans-serif",
              fontWeight: 800,
              fontSize: '30px',
              textTransform: 'uppercase',
            }}
          >
            Profile Not Found
          </h1>
          <p
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '14px',
              opacity: 0.5,
              marginTop: '16px',
            }}
          >
            User ID: {profileId}
          </p>
          <Link
            to="/dashboard"
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#000',
              marginTop: '32px',
              padding: '10px 24px',
              border: '0.733px solid #000',
              borderRadius: '75.641px',
              textDecoration: 'none',
            }}
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: '640px', margin: '60px auto 0' }}>
          {/* Header section */}
          <div className="flex items-start gap-6" style={{ marginBottom: '40px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '40px' }}>
                  {profile.display_name?.charAt(0) ?? '?'}
                </span>
              )}
            </div>

            {/* Name + role */}
            <div className="flex flex-col gap-2" style={{ paddingTop: '8px' }}>
              <h1
                style={{
                  fontFamily: "'Kaio', sans-serif",
                  fontWeight: 800,
                  fontSize: '32px',
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  fontFeatureSettings: "'ordn' 1, 'dlig' 1",
                  margin: 0,
                }}
              >
                {profile.display_name}
              </h1>
              <span
                style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0.8px',
                  opacity: 0.6,
                }}
              >
                {roleTitles[profile.role] ?? profile.role}
              </span>
              {/* Role badge */}
              <span
                style={{
                  display: 'inline-block',
                  width: 'fit-content',
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  background: '#000000',
                  color: '#EAF2D7',
                  padding: '5px 14px',
                  borderRadius: '75.641px',
                }}
              >
                {profile.role}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <InfoCard label="Email" value={profile.email ?? '—'} />
            <InfoCard label="Experience" value={`${profile.xp ?? 0} XP`} />
            <InfoCard label="Status" value="Active" />
            <InfoCard
              label="Joined"
              value={
                profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
              }
            />
          </div>

          {/* XP progress */}
          <div
            style={{
              marginTop: '24px',
              background: 'var(--bg-surface, rgba(234,242,215,0.2))',
              border: '0.733px solid var(--border-default)',
              borderRadius: '10.258px',
              padding: '24px',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <span
                style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                }}
              >
                Experience Progress
              </span>
              <span
                style={{
                  fontFamily: "'Kaio', sans-serif",
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                {profile.xp ?? 0} / 100
              </span>
            </div>
            <div
              style={{
                height: '6px',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(((profile.xp ?? 0) / 100) * 100, 100)}%`,
                  height: '100%',
                  background: '#D7ABC5',
                  borderRadius: '3px',
                  transition: 'width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
                }}
              />
            </div>
          </div>

          {/* Edit own profile hint */}
          {isOwnProfile && (
            <p
              style={{
                fontFamily: "'Owners Wide', sans-serif",
                fontSize: '12px',
                letterSpacing: '0.5px',
                opacity: 0.35,
                marginTop: '32px',
                textAlign: 'center',
              }}
            >
              This is your profile
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      background: 'var(--bg-surface, rgba(234,242,215,0.2))',
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
        fontSize: '15px',
        letterSpacing: '0.6px',
      }}
    >
      {value}
    </span>
  </div>
);

export default ProfilePage;
