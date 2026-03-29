import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../hooks/useAuth';
import { mockTeam } from '../lib/team';

/* ------------------------------------------------------------------ */
/*  Professional Development Hub — redirects to user's own PD tracker  */
/*  or shows overview for managers                                     */
/* ------------------------------------------------------------------ */

const ProfDevHubPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, role } = useAuthStore();
  const currentMember = mockTeam.find((m) => m.email === user?.email);
  const directReports = mockTeam.filter((m) => m.managerId === currentMember?.id);
  const isManager = directReports.length > 0 || role === 'admin';

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Professional Development</span>
        <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', textTransform: 'uppercase', margin: '0 0 24px 0' }}>Your Development</h1>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <QuickCard title="My PD Tracker" desc="Goals, proof of excellence, operating principles, feedback" onClick={() => currentMember && navigate(`/pd/${currentMember.id}`)} />
          <QuickCard title="Feedback Hub" desc="Give and receive feedback, peer reviews, self assessment" onClick={() => navigate('/feedback')} />
          <QuickCard title="Culture" desc="Operating principles, XP leaderboard, culture book" onClick={() => navigate('/culture')} />
          <QuickCard title="What Good Looks Like" desc="Quality standards library with real examples" onClick={() => navigate('/resources/what-good-looks-like')} />
        </div>

        {/* Manager view — direct reports */}
        {isManager && (
          <>
            <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
              {role === 'admin' ? 'All Team Members' : 'Your Direct Reports'}
            </h2>
            <div className="flex flex-col gap-3">
              {(role === 'admin' ? mockTeam : directReports).map((member) => (
                <div key={member.id} onClick={() => navigate(`/pd/${member.id}`)}
                  className="flex items-center gap-3" style={{ padding: '14px 20px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {member.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                      <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '12px' }}>{member.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block' }}>{member.name}</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{member.title} · {member.unit}</span>
                  </div>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3 }}>View PD →</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const QuickCard: React.FC<{ title: string; desc: string; onClick: () => void }> = ({ title, desc, onClick }) => (
  <div onClick={onClick} style={{ padding: '20px', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', cursor: 'pointer', transition: 'all 0.15s' }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}>
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{title}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{desc}</span>
  </div>
);

export default ProfDevHubPage;
