// ===== Team Selection Screen =====

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamSelectStore } from '../../store/teamSelectStore';
import { ROLE_STAT_TIERS } from '../../data/battleConfig';
import { spritePath } from '../../utils/formatters';

// Placeholder roster — will be replaced when fighters.ts is available
const PLACEHOLDER_ROSTER = [
  { id: 'ben', name: 'Ben Lydiat', title: 'VP of Creative', role: 'admin', statTier: 'VP', roleColor: '#D7ABC5', moves: [] },
  { id: 'sixtyne', name: 'Sixtyne Perez', title: 'CCO', role: 'csuite', statTier: 'CCO', roleColor: '#6E93C3', moves: [] },
  { id: 'nick', name: 'Nick Mitchell', title: 'CSO', role: 'csuite', statTier: 'VP', roleColor: '#6E93C3', moves: [] },
  { id: 'kevin-m', name: 'Kevin Moran', title: 'Brand Designer', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'elena', name: 'Elena Zheng', title: 'VP of Accounts', role: 'team', statTier: 'VP', roleColor: '#E67E22', moves: [] },
  { id: 'sam', name: 'Samantha Kelly', title: 'Brand Strategy', role: 'team', statTier: 'SENIOR', roleColor: '#D7ABC5', moves: [] },
  { id: 'ck', name: 'CK', title: 'Advisor / Dev', role: 'csuite', statTier: 'ADVISOR', roleColor: '#27AE60', moves: [] },
  { id: 'tolani', name: 'Tolani Daniel', title: 'Motion Designer', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'omar', name: 'Omar Anwar', title: 'Account Lead', role: 'team', statTier: 'MANAGER', roleColor: '#E67E22', moves: [] },
  { id: 'matt', name: 'Matthew Brannon', title: 'PR Lead', role: 'team', statTier: 'SENIOR', roleColor: '#6E93C3', moves: [] },
  { id: 'jb', name: 'JB', title: 'CEO', role: 'csuite', statTier: 'FOUNDER', roleColor: '#EAF2D7', moves: [] },
  { id: 'ross', name: 'Ross Booth', title: 'Co-Founder', role: 'csuite', statTier: 'FOUNDER', roleColor: '#EAF2D7', moves: [] },
  { id: 'arthur', name: 'Arthur Stern', title: 'COO', role: 'csuite', statTier: 'FOUNDER', roleColor: '#EAF2D7', moves: [] },
  { id: 'ishan', name: 'Ishan', title: 'Co-Founder', role: 'csuite', statTier: 'FOUNDER', roleColor: '#EAF2D7', moves: [] },
  { id: 'jake', name: 'Jake Embleton', title: 'Content / Social', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'cynthia', name: 'Cynthia Gentry', title: 'Copywriter', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'haley', name: 'Haley Stewart Torculas', title: 'People & Ops', role: 'team', statTier: 'MANAGER', roleColor: '#7B7554', moves: [] },
  { id: 'camila', name: 'Camila', title: 'Operations', role: 'team', statTier: 'MANAGER', roleColor: '#7B7554', moves: [] },
  { id: 'janelle', name: 'Janelle', title: 'VP of PR', role: 'team', statTier: 'DIRECTOR', roleColor: '#6E93C3', moves: [] },
  { id: 'jenny', name: 'Jenny', title: 'PR / Broadcast', role: 'team', statTier: 'SPECIALIST', roleColor: '#6E93C3', moves: [] },
  { id: 'destini', name: 'Destini', title: 'PR', role: 'team', statTier: 'SPECIALIST', roleColor: '#6E93C3', moves: [] },
  { id: 'hugh', name: 'Hugh', title: 'PR / Podcasts', role: 'team', statTier: 'SPECIALIST', roleColor: '#6E93C3', moves: [] },
  { id: 'kevin-a', name: 'Kevin Arteaga', title: 'PR Account Manager', role: 'team', statTier: 'MANAGER', roleColor: '#6E93C3', moves: [] },
  { id: 'stef', name: 'Stef Luthin', title: 'Content', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'luke', name: 'Luke', title: 'Content / Social', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'amanda', name: 'Amanda Eyer', title: 'Creative', role: 'team', statTier: 'SPECIALIST', roleColor: '#D7ABC5', moves: [] },
  { id: 'taylor', name: 'Taylor Hadden', title: 'PR Account Manager', role: 'team', statTier: 'MANAGER', roleColor: '#6E93C3', moves: [] },
  { id: 'madisen', name: 'Madisen', title: 'PR Account Manager', role: 'team', statTier: 'MANAGER', roleColor: '#6E93C3', moves: [] },
  { id: 'kim', name: 'Kim', title: 'Senior PR Account Manager', role: 'team', statTier: 'SENIOR', roleColor: '#6E93C3', moves: [] },
];

const TeamSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { roster, playerTeam, difficulty, setRoster, addToTeam, removeFromTeam, setDifficulty, randomTeam, generateOpponentTeam } = useTeamSelectStore();

  useEffect(() => {
    if (roster.length === 0) {
      // Try to import fighters.ts, fall back to placeholder
      try {
        // Dynamic import will work once fighters.ts is pushed
        import('../../data/fighters').then((mod) => {
          if (mod.FIGHTERS?.length) setRoster(mod.FIGHTERS);
          else setRoster(PLACEHOLDER_ROSTER as never[]);
        }).catch(() => setRoster(PLACEHOLDER_ROSTER as never[]));
      } catch {
        setRoster(PLACEHOLDER_ROSTER as never[]);
      }
    }
  }, [roster.length, setRoster]);

  const handleConfirm = () => {
    if (playerTeam.length === 0) return;
    generateOpponentTeam();
    navigate('/battle/fight');
  };

  const maxTeamSize = 6;
  const isSelected = (id: string) => playerTeam.some((f) => f.id === id);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--battle-bg-dark)', color: 'var(--battle-mint)', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/battle')} style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--battle-pink)', background: 'none', border: 'none', cursor: 'pointer' }}>
            &larr; Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--battle-pink)' }}>
            Select Your Team
          </h1>
          <div className="flex gap-2">
            {(['easy', 'normal', 'hard'] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px',
                padding: '4px 12px', borderRadius: '4px', cursor: 'pointer',
                border: difficulty === d ? '1px solid var(--battle-pink)' : '1px solid rgba(215,171,197,0.2)',
                background: difficulty === d ? 'rgba(215,171,197,0.1)' : 'transparent',
                color: difficulty === d ? 'var(--battle-pink)' : 'var(--battle-mint)',
              }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Fighter grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {roster.map((fighter) => {
            const selected = isSelected(fighter.id);
            const order = playerTeam.findIndex((f) => f.id === fighter.id) + 1;
            const stats = ROLE_STAT_TIERS[fighter.statTier] ?? ROLE_STAT_TIERS.SPECIALIST;

            return (
              <div key={fighter.id}
                onClick={() => selected ? removeFromTeam(fighter.id) : (playerTeam.length < maxTeamSize && addToTeam(fighter))}
                className="battle-fighter-card" data-selected={selected}
                style={{ position: 'relative' }}>
                {/* Selection order badge */}
                {selected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--battle-pink)', color: 'var(--battle-bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', fontWeight: 800 }}>
                    {order}
                  </div>
                )}

                {/* Sprite preview */}
                <div style={{ width: 64, height: 64, margin: '0 auto 8px', borderRadius: '50%', background: `${fighter.roleColor}20`, border: `2px solid ${fighter.roleColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={spritePath(fighter.id, 'front')} alt={fighter.name}
                    style={{ width: 56, height: 56, imageRendering: 'pixelated', objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: fighter.roleColor, position: 'absolute' }}>
                    {fighter.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </span>
                </div>

                {/* Name */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', display: 'block', color: 'var(--battle-mint)' }}>{fighter.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '9px', opacity: 0.4 }}>{fighter.title}</span>
                </div>

                {/* Stat bars */}
                <div className="flex flex-col gap-1">
                  {[['HP', stats.hp, 240], ['ATK', stats.atk, 95], ['DEF', stats.def, 85], ['SPD', stats.spd, 95]].map(([label, val, max]) => (
                    <div key={label as string} className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '8px', opacity: 0.4, width: '24px' }}>{label}</span>
                      <div style={{ flex: 1, height: 3, background: 'var(--hp-bg)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${((val as number) / (max as number)) * 100}%`, height: '100%', background: fighter.roleColor, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lead label */}
                {order === 1 && (
                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--battle-pink)' }}>LEAD</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom dock */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--battle-bg-mid)', borderTop: '1px solid rgba(215,171,197,0.15)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          {/* Team slots */}
          <div className="flex gap-2">
            {Array.from({ length: maxTeamSize }, (_, i) => {
              const fighter = playerTeam[i];
              return (
                <div key={i} style={{ width: 44, height: 44, borderRadius: '50%', border: fighter ? `2px solid ${fighter.roleColor}` : '1px dashed rgba(215,171,197,0.2)', background: fighter ? `${fighter.roleColor}15` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {fighter && (
                    <img src={spritePath(fighter.id, 'front')} alt="" style={{ width: 36, height: 36, imageRendering: 'pixelated', objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              );
            })}
          </div>

          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', opacity: 0.4 }}>
            {playerTeam.length} / {maxTeamSize}
          </span>

          <button onClick={randomTeam} style={{
            fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(215,171,197,0.3)', background: 'transparent', color: 'var(--battle-mint)', cursor: 'pointer',
          }}>Random</button>

          <button onClick={handleConfirm} disabled={playerTeam.length === 0} style={{
            fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
            padding: '12px 32px', borderRadius: '8px', border: 'none', cursor: playerTeam.length > 0 ? 'pointer' : 'default',
            background: playerTeam.length > 0 ? 'var(--battle-pink)' : 'var(--move-disabled)',
            color: playerTeam.length > 0 ? 'var(--battle-bg-dark)' : 'rgba(255,255,255,0.3)',
          }}>
            Fight →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelectScreen;
