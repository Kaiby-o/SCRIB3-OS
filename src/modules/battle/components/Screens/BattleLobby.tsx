// ===== Battle Lobby =====

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTeam } from '../../../../scrib3-os/lib/team';
import { useTeamSelectStore } from '../../store/teamSelectStore';

const BattleLobby: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'1v1' | '6v6'>('1v1');
  const [opponent, setOpponent] = useState<'ai' | string>('ai');
  const { setDifficulty } = useTeamSelectStore();

  const onlineUsers = mockTeam.filter((m) => m.isOnline && m.availability !== 'offline').slice(0, 8);

  const handleStart = () => {
    if (mode === '1v1') setDifficulty('easy');
    navigate('/battle/team-select', { state: { mode } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EAF2D7', color: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: 24, left: 24, fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: '#000', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
        &larr; Exit
      </button>

      <h1 style={{ fontFamily: "'Kaio', sans-serif", fontSize: '48px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '6px', color: '#000', marginBottom: '8px', textAlign: 'center' }}>
        Battle Mode
      </h1>
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.4, marginBottom: '40px' }}>
        Choose your opponent and match type
      </p>

      {/* Match type */}
      <div className="flex gap-3" style={{ marginBottom: '32px' }}>
        {(['1v1', '6v6'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: "'Kaio', sans-serif", fontSize: '18px', fontWeight: 800, letterSpacing: '3px',
            padding: '14px 40px', borderRadius: '75.641px', cursor: 'pointer',
            border: mode === m ? '2px solid #000' : '1px solid rgba(0,0,0,0.15)',
            background: mode === m ? '#000' : 'transparent',
            color: mode === m ? '#EAF2D7' : '#000',
          }}>{m}</button>
        ))}
      </div>

      {/* Opponent selection */}
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '32px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.3, display: 'block', marginBottom: '12px' }}>
          Select Opponent
        </span>

        {/* AI option */}
        <button onClick={() => setOpponent('ai')} style={{
          width: '100%', padding: '14px 20px', borderRadius: '10.258px', cursor: 'pointer', marginBottom: '8px',
          display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', position: 'relative',
          border: opponent === 'ai' ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
          background: opponent === 'ai' ? 'rgba(0,0,0,0.04)' : 'transparent',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', display: 'block' }}>Computer</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>AI Opponent — always ready</span>
          </div>
          {opponent === 'ai' && (
            <button onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{
              fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '8px 20px', borderRadius: '75.641px', border: 'none', background: '#D7ABC5', color: '#000', cursor: 'pointer',
            }}>Select Team →</button>
          )}
        </button>

        {/* Online users */}
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.25, display: 'block', margin: '16px 0 8px' }}>
          Online Now ({onlineUsers.length})
        </span>
        {onlineUsers.map((user) => (
          <button key={user.id} onClick={() => setOpponent(user.id)} style={{
            width: '100%', padding: '10px 16px', borderRadius: '10.258px', cursor: 'pointer', marginBottom: '4px',
            display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', position: 'relative',
            border: opponent === user.id ? '2px solid #000' : '1px solid rgba(0,0,0,0.06)',
            background: opponent === user.id ? 'rgba(0,0,0,0.04)' : 'transparent',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '10px', fontWeight: 800, color: '#EAF2D7' }}>{user.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', flex: 1 }}>{user.name}</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60' }} />
            {opponent === user.id && (
              <button onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{
                fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '8px 20px', borderRadius: '75.641px', border: 'none', background: '#D7ABC5', color: '#000', cursor: 'pointer',
              }}>Select Team →</button>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BattleLobby;
