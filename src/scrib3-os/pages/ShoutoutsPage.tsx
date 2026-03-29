import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../hooks/useAuth';
import { mockTeam } from '../lib/team';

/* ------------------------------------------------------------------ */
/*  Dapps / Dapps — Give XP + Recognition to teammates             */
/* ------------------------------------------------------------------ */

interface Shoutout {
  id: string;
  fromName: string;
  fromAvatar?: string;
  toName: string;
  toAvatar?: string;
  message: string;
  xpAwarded: number;
  anonymous: boolean;
  createdAt: string;
}

const mockDapps: Shoutout[] = [
  { id: 'so-1', fromName: 'Ben Lydiat', toName: 'Kevin Moran', message: 'Incredible work on the Rootstock brand refresh. The attention to typographic detail was exceptional.', xpAwarded: 20, anonymous: false, createdAt: '2026-03-27T10:00:00Z' },
  { id: 'so-2', fromName: 'Elena Zheng', toName: 'Samantha Kelly', message: 'Thanks for stepping up on the Franklin Templeton BENJI series. Client loved the strategy deck.', xpAwarded: 15, anonymous: false, createdAt: '2026-03-26T14:00:00Z' },
  { id: 'so-3', fromName: 'Anonymous', toName: 'Tolani Daniel', message: 'Your motion work consistently elevates every project. Keep it up!', xpAwarded: 10, anonymous: true, createdAt: '2026-03-25T09:00:00Z' },
  { id: 'so-4', fromName: 'Omar Anwar', toName: 'Cynthia Gentry', message: 'Saved the day on the Canton case study copy. Turned it around in record time.', xpAwarded: 15, anonymous: false, createdAt: '2026-03-24T16:00:00Z' },
];

const DappsPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useAuthStore();
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [xpAmount, setXpAmount] = useState(10);
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!recipient || !message.trim()) return;
    // In production: write to Supabase + award XP
    console.log('[dapps] Submitted:', { from: profile?.display_name, to: recipient, message, xpAmount, anonymous });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setRecipient(''); setMessage(''); }, 3000);
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Dapps</span>
        <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Give a shoutout form */}
        <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Give a Shoutout</h2>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '20px' }}>
            Recognise a teammate's great work. They'll receive XP and a notification.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '6px' }}>Who are you shouting out?</label>
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', color: '#000', outline: 'none', cursor: 'pointer', appearance: 'none', width: '100%' }}>
                <option value="">Select a teammate</option>
                {mockTeam.filter((m) => m.name !== profile?.display_name).map((m) => (
                  <option key={m.id} value={m.name}>{m.name} — {m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '6px' }}>What did they do?</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the team what this person did that was awesome..."
                rows={3} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px', outline: 'none', resize: 'vertical' }} />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '6px' }}>XP to award</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((val) => (
                    <button key={val} onClick={() => setXpAmount(val)}
                      style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', padding: '6px 14px', borderRadius: '75.641px', border: xpAmount === val ? '2px solid #D7ABC5' : '1px solid var(--border-default)', background: xpAmount === val ? 'rgba(215,171,197,0.15)' : 'transparent', cursor: 'pointer' }}>
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', marginTop: '20px' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid var(--border-default)', background: anonymous ? '#D7ABC5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setAnonymous(!anonymous)}>
                  {anonymous && <span style={{ color: '#000', fontSize: '12px' }}>✓</span>}
                </div>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>Send anonymously</span>
              </label>
            </div>

            <button onClick={handleSubmit} disabled={!recipient || !message.trim()}
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '12px 24px', borderRadius: '75.641px', border: 'none', background: recipient && message.trim() ? '#D7ABC5' : 'rgba(0,0,0,0.1)', color: recipient && message.trim() ? '#000' : 'var(--text-primary)', cursor: recipient && message.trim() ? 'pointer' : 'default', alignSelf: 'flex-start' }}>
              {submitted ? 'Sent!' : 'Send Shoutout'}
            </button>
          </div>
        </div>

        {/* Recent dapps feed */}
        <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Recent Dapps</h2>
        <div className="flex flex-col gap-3">
          {mockDapps.map((so) => (
            <div key={so.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
                    {so.anonymous ? 'Anonymous' : so.fromName}
                  </span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>→</span>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', color: '#D7ABC5' }}>
                    {so.toName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', color: '#D7ABC5' }}>+{so.xpAwarded} XP</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>
                    {new Date(so.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: 0, opacity: 0.7 }}>{so.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DappsPage;
