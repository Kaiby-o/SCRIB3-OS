// ===== Team Selection Screen =====

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTeamSelectStore } from '../../store/teamSelectStore';
import { spritePath } from '../../utils/formatters';
import { fighters } from '../../data/fighters';

const ROLE_COLORS: Record<string, string> = {
  founder: '#EAF2D7', creative: '#D7ABC5', strategy: '#6E93C3',
  pr: '#6E93C3', social: '#D7ABC5', ops: '#7B7554', digital: '#27AE60',
};

const TeamSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state as { mode?: string })?.mode ?? '6v6';
  const maxTeamSize = mode === '1v1' ? 1 : 6;
  const { roster, playerTeam, difficulty, setRoster, addToTeam, removeFromTeam, setDifficulty, randomTeam, generateOpponentTeam } = useTeamSelectStore();

  useEffect(() => {
    if (roster.length === 0 && fighters.length > 0) {
      setRoster(fighters as never[]);
    }
  }, [roster.length, setRoster]);

  const handleConfirm = () => {
    if (playerTeam.length === 0) return;
    generateOpponentTeam();
    navigate('/battle/fight');
  };

  const isSelected = (id: string) => playerTeam.some((f) => f.id === id);

  return (
    <div style={{ minHeight: '100vh', background: '#EAF2D7', color: '#000', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/battle')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: '#000', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
            &larr; Back
          </button>
          <h1 style={{ fontFamily: "'Kaio', sans-serif", fontSize: '28px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', color: '#000' }}>
            {mode === '1v1' ? 'Choose Your Fighter' : 'Select Your Team'}
          </h1>
          <div className="flex gap-2">
            {mode !== '1v1' && (['easy', 'normal', 'hard'] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px',
                padding: '6px 14px', borderRadius: '75.641px', cursor: 'pointer',
                border: difficulty === d ? '1.5px solid #000' : '1px solid rgba(0,0,0,0.15)',
                background: difficulty === d ? '#000' : 'transparent',
                color: difficulty === d ? '#EAF2D7' : '#000',
              }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Fighter grid — new card layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '100px' }}>
          {roster.map((fighter) => {
            const selected = isSelected(fighter.id);
            const order = playerTeam.findIndex((f) => f.id === fighter.id) + 1;
            const roleColor = ROLE_COLORS[fighter.roleColor as string] ?? '#D7ABC5';

            return (
              <div key={fighter.id}
                onClick={() => {
                  if (selected) { removeFromTeam(fighter.id); return; }
                  if (playerTeam.length < maxTeamSize) addToTeam(fighter);
                }}
                style={{
                  position: 'relative', borderRadius: '10.258px', overflow: 'hidden', cursor: 'pointer',
                  border: selected ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                  background: '#000', color: '#EAF2D7',
                  transition: 'border-color 200ms, box-shadow 200ms',
                  boxShadow: selected ? '0 0 20px rgba(0,0,0,0.15)' : 'none',
                }}>
                {/* Selection badge */}
                {selected && (
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', background: '#D7ABC5', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Kaio', sans-serif", fontSize: '13px', fontWeight: 800, zIndex: 2 }}>
                    {order}
                  </div>
                )}

                {/* Card content — sprite left, info right */}
                <div className="flex" style={{ padding: '16px' }}>
                  {/* Sprite — large, cropped to center */}
                  <div style={{ width: 120, height: 160, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <img src={spritePath(fighter.id, 'front')} alt={fighter.name}
                      style={{ width: 140, height: 140, imageRendering: 'pixelated', objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, paddingLeft: '12px' }}>
                    <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', display: 'block', lineHeight: 1.1, marginBottom: '4px' }}>{fighter.name}</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5, display: 'block', marginBottom: '10px', letterSpacing: '1px' }}>{fighter.role}</span>

                    {/* Move boxes — 2x2 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '10px' }}>
                      {fighter.moves.slice(0, 4).map((move) => (
                        <div key={move.id} style={{ background: 'rgba(234,242,215,0.06)', border: '1px solid rgba(234,242,215,0.12)', borderRadius: '4px', padding: '4px 6px' }}>
                          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{move.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stat bars */}
                    <div className="flex flex-col gap-1">
                      {([['HP', fighter.stats.hp, 240], ['ATK', fighter.stats.atk, 95], ['DEF', fighter.stats.def, 85], ['SPD', fighter.stats.spd, 95]] as [string, number, number][]).map(([label, val, max]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '8px', opacity: 0.4, width: '22px', letterSpacing: '0.5px' }}>{label}</span>
                          <div style={{ flex: 1, height: 3, background: 'rgba(234,242,215,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: roleColor, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lead label */}
                {order === 1 && (
                  <div style={{ position: 'absolute', bottom: 6, left: 12 }}>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#D7ABC5' }}>LEAD</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom dock */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', borderTop: '1px solid rgba(234,242,215,0.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          <div className="flex gap-2">
            {Array.from({ length: maxTeamSize }, (_, i) => {
              const fighter = playerTeam[i];
              return (
                <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', border: fighter ? '2px solid #D7ABC5' : '1px dashed rgba(234,242,215,0.2)', background: fighter ? 'rgba(215,171,197,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {fighter && (
                    <img src={spritePath(fighter.id, 'front')} alt="" style={{ width: 32, height: 32, imageRendering: 'pixelated', objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              );
            })}
          </div>

          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4, color: '#EAF2D7' }}>
            {playerTeam.length} / {maxTeamSize}
          </span>

          {mode !== '1v1' && (
            <button onClick={randomTeam} style={{
              fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
              padding: '8px 18px', borderRadius: '75.641px', border: '1px solid rgba(234,242,215,0.2)', background: 'transparent', color: '#EAF2D7', cursor: 'pointer',
            }}>Random</button>
          )}

          <button onClick={handleConfirm} disabled={playerTeam.length === 0} style={{
            fontFamily: "'Kaio', sans-serif", fontSize: '14px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
            padding: '10px 28px', borderRadius: '75.641px', border: 'none', cursor: playerTeam.length > 0 ? 'pointer' : 'default',
            background: playerTeam.length > 0 ? '#D7ABC5' : 'rgba(234,242,215,0.1)',
            color: playerTeam.length > 0 ? '#000' : 'rgba(234,242,215,0.3)',
          }}>
            Fight →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelectScreen;
