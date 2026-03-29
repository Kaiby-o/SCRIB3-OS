import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import VirtualOffice from '../../scrib3-device/components/virtual-office/VirtualOffice';
import { useAuthStore as useDeviceAuth } from '../../scrib3-device/store/auth.store';

const ALLOWED_EMAIL = 'ben.lydiat@scrib3.co';

const OfficePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const deviceFetchProfile = useDeviceAuth((s) => s.fetchProfile);

  // Gate: only allowed email
  const email = user?.email ?? profile?.email ?? '';
  const allowed = email.toLowerCase() === ALLOWED_EMAIL;

  // Initialise DEVICE auth store so VirtualOffice can read profile
  useEffect(() => {
    if (allowed && user?.id) {
      deviceFetchProfile(user.id);
    }
  }, [allowed, user?.id, deviceFetchProfile]);

  if (!allowed) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', textTransform: 'uppercase', marginBottom: '12px' }}>Office Coming Soon</h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5 }}>The virtual office is currently in development.</p>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', marginTop: '24px', padding: '10px 24px', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', background: 'transparent', cursor: 'pointer' }}>
          &larr; Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: '#000000' }}>
      <VirtualOffice
        bgMode="dark"
        onClose={() => navigate('/dashboard')}
        onEditAvatar={() => navigate('/device/avatar-creator')}
      />
    </div>
  );
};

export default OfficePage;
