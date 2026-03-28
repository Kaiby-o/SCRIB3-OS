// ===== Battle Lobby =====
// Entry point: select opponent (online users, AI) and match type (1v1, 6v6)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTeam } from '../../../../scrib3-os/lib/team';

const BattleLobby: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'1v1' | '6v6'>('1v1');
  const [opponent, setOpponent] = useState<'ai' | string>('ai');

  // Simulated online users
  const onlineUsers = mockTeam.filter((m) => m.isOnline && m.availability !== 'offline').slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--battle-bg-dark)', color: 'var(--battle-mint)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: 24, left: 24, fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--battle-pink)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
        &larr; Exit Battle
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--battle-pink)', marginBottom: '8px', textAlign: 'center' }}>
        Battle Mode
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', opacity: 0.5, marginBottom: '40px' }}>
        Choose your opponent and match type
      </p>

      {/* Match type */}
      <div className="flex gap-3" style={{ marginBottom: '32px' }}>
        {(['1v1', '6v6'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '2px',
            padding: '16px 40px', borderRadius: '8px', cursor: 'pointer',
            border: mode === m ? '2px solid var(--battle-pink)' : '1px solid rgba(215,171,197,0.2)',
            background: mode === m ? 'rgba(215,171,197,0.1)' : 'transparent',
            color: mode === m ? 'var(--battle-pink)' : 'var(--battle-mint)',
          }}>{m}</button>
        ))}
      </div>

      {/* Opponent selection */}
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '32px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '12px' }}>
          Select Opponent
        </span>

        {/* AI option */}
        <button onClick={() => setOpponent('ai')} style={{
          width: '100%', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px',
          display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
          border: opponent === 'ai' ? '2px solid var(--battle-pink)' : '1px solid rgba(215,171,197,0.15)',
          background: opponent === 'ai' ? 'rgba(215,171,197,0.08)' : 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(215,171,197,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--battle-mint)', display: 'block' }}>Computer</span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', opacity: 0.4 }}>AI Opponent — always ready</span>
          </div>
        </button>

        {/* Online users */}
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.3, display: 'block', margin: '16px 0 8px' }}>
          Online Now ({onlineUsers.length})
        </span>
        {onlineUsers.map((user) => (
          <button key={user.id} onClick={() => setOpponent(user.id)} style={{
            width: '100%', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
            display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
            border: opponent === user.id ? '2px solid var(--battle-pink)' : '1px solid rgba(215,171,197,0.1)',
            background: opponent === user.id ? 'rgba(215,171,197,0.08)' : 'transparent',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 800, color: 'var(--battle-mint)' }}>{user.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--battle-mint)' }}>{user.name}</span>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60' }} />
          </button>
        ))}
      </div>

      {/* Start battle */}
      <button onClick={() => navigate('/battle/team-select')} style={{
        fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
        padding: '16px 48px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: 'var(--battle-pink)', color: 'var(--battle-bg-dark)',
      }}>
        Select Team →
      </button>
    </div>
  );
};

export default BattleLobby;
