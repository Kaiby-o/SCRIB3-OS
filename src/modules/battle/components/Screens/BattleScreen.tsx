// ===== Battle Screen =====
// Gen 4 DS-style turn-based battle

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleStore } from '../../store/battleStore';
import { useTeamSelectStore } from '../../store/teamSelectStore';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useAnimations, STATUS_FILTERS } from '../../hooks/useAnimations';
import { hpPercent, hpLevel, damageDots, spritePath, statusBadgeText } from '../../utils/formatters';
import { isOnCooldown } from '../../engine/CooldownTracker';
import { hasStatus } from '../../engine/StatusEngine';
import { FIGHTER_LEVEL } from '../../data/battleConfig';
import type { Move } from '../../data/battleTypes';

const BattleScreen: React.FC = () => {
  const navigate = useNavigate();
  const teamSelectStore = useTeamSelectStore();
  const {
    phase, activePlayer, activeOpponent, playerTeam,
    currentText, textQueue, roundNumber, battleSpeed,
    initBattle, selectMove, advanceText, switchFighter, flee, setBattleSpeed,
  } = useBattleStore();
  const { playerRef, opponentRef, screenRef, playAttack, playHit, playEnter } = useAnimations();
  const { displayed, isComplete, skip } = useTypewriter(currentText, battleSpeed === 'fast' ? 5 : 30);
  const [showMoves, setShowMoves] = useState(false);
  const [showParty, setShowParty] = useState(false);

  // Init battle on mount
  useEffect(() => {
    if (teamSelectStore.playerTeam.length === 0) { navigate('/battle/team-select'); return; }
    initBattle(teamSelectStore.playerTeam, teamSelectStore.opponentTeam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Play enter animations on phase change
  useEffect(() => {
    if (phase === 'INTRO') {
      playEnter('player');
      playEnter('opponent');
    }
  }, [phase, playEnter]);

  if (!activePlayer || !activeOpponent) {
    return <div style={{ minHeight: '100vh', background: 'var(--battle-bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--battle-pink)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Initializing battle...</span>
    </div>;
  }

  const handleTextAdvance = () => {
    if (!isComplete) { skip(); return; }
    advanceText();
  };

  const handleMoveSelect = async (move: Move) => {
    setShowMoves(false);
    // Play attack animation
    await playAttack('player');
    await playHit('opponent');
    selectMove(move);
  };

  const handleSwitchFighter = (idx: number) => {
    setShowParty(false);
    switchFighter(idx);
  };

  // Get active status filter for sprites
  const playerFilter = activePlayer.activeStatuses.map((s) => STATUS_FILTERS[s.id]).filter(Boolean).join(' ') || 'none';
  const opponentFilter = activeOpponent.activeStatuses.map((s) => STATUS_FILTERS[s.id]).filter(Boolean).join(' ') || 'none';

  return (
    <div ref={screenRef} style={{ minHeight: '100vh', background: 'var(--battle-bg-dark)', display: 'flex', flexDirection: 'column' }}>
      {/* Speed toggle */}
      <div style={{ position: 'absolute', top: 8, right: 16, zIndex: 20 }}>
        <button onClick={() => setBattleSpeed(battleSpeed === 'normal' ? 'fast' : 'normal')}
          style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '9px', color: 'var(--battle-pink)', background: 'none', border: '1px solid rgba(215,171,197,0.2)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', opacity: 0.5 }}>
          {battleSpeed === 'fast' ? '▶▶ FAST' : '▶ NORMAL'}
        </button>
      </div>

      {/* Battle Scene */}
      <div className="battle-scene battle-arena" style={{ flex: 1 }}>
        {/* Top half — arena */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px 40px' }}>
          {/* Opponent nameplate — top left */}
          <div className="battle-nameplate" style={{ position: 'absolute', top: 24, left: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <span className="battle-nameplate-name">{activeOpponent.name}</span>
              <span className="battle-nameplate-level">Lv{FIGHTER_LEVEL}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="battle-hp-label">HP</span>
              <div className="battle-hp-bar-container" style={{ flex: 1 }}>
                <div className="battle-hp-bar-fill" data-level={hpLevel(activeOpponent.currentHP, activeOpponent.maxHP)}
                  style={{ width: `${hpPercent(activeOpponent.currentHP, activeOpponent.maxHP)}%` }} />
              </div>
            </div>
            {activeOpponent.activeStatuses.length > 0 && (
              <div className="flex gap-1" style={{ marginTop: '4px' }}>
                {activeOpponent.activeStatuses.map((s) => (
                  <span key={s.id} className="battle-status-badge">{statusBadgeText(s.id)}</span>
                ))}
              </div>
            )}
          </div>

          {/* Opponent sprite — top right */}
          <div ref={opponentRef} style={{ marginLeft: 'auto', marginTop: '60px' }}>
            <img src={spritePath(activeOpponent.id, 'front')} alt={activeOpponent.name}
              className="battle-sprite battle-sprite-front"
              style={{ filter: opponentFilter }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="battle-platform" style={{ margin: '-12px auto 0' }} />
          </div>
        </div>

        {/* Bottom half — player + UI */}
        <div style={{ position: 'relative', display: 'flex', padding: '0 40px' }}>
          {/* Player sprite — bottom left */}
          <div ref={playerRef} style={{ marginTop: '-40px' }}>
            <img src={spritePath(activePlayer.id, 'back')} alt={activePlayer.name}
              className="battle-sprite battle-sprite-back"
              style={{ filter: playerFilter }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="battle-platform" style={{ margin: '-12px auto 0' }} />
          </div>

          {/* Player nameplate — bottom right */}
          <div className="battle-nameplate" style={{ position: 'absolute', bottom: 100, right: 40 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <span className="battle-nameplate-name">{activePlayer.name}</span>
              <span className="battle-nameplate-level">Lv{FIGHTER_LEVEL}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="battle-hp-label">HP</span>
              <div className="battle-hp-bar-container" style={{ flex: 1 }}>
                <div className="battle-hp-bar-fill" data-level={hpLevel(activePlayer.currentHP, activePlayer.maxHP)}
                  style={{ width: `${hpPercent(activePlayer.currentHP, activePlayer.maxHP)}%` }} />
              </div>
              <span className="battle-hp-numbers">{activePlayer.currentHP}/{activePlayer.maxHP}</span>
            </div>
            <div className="battle-exp-bar"><div className="battle-exp-bar-fill" style={{ width: '35%' }} /></div>
            {activePlayer.activeStatuses.length > 0 && (
              <div className="flex gap-1" style={{ marginTop: '4px' }}>
                {activePlayer.activeStatuses.map((s) => (
                  <span key={s.id} className="battle-status-badge">{statusBadgeText(s.id)}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Box / Menu */}
      <div style={{ background: 'var(--textbox-bg)', borderTop: '1px solid var(--textbox-border)' }}>
        {/* Victory / Defeat */}
        {(phase === 'VICTORY' || phase === 'DEFEAT' || phase === 'FLED') && (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <h2 className="battle-result-title" style={{ color: phase === 'VICTORY' ? 'var(--hp-high)' : phase === 'FLED' ? 'var(--battle-mint)' : 'var(--hp-low)', marginBottom: '16px' }}>
              {phase === 'VICTORY' ? 'VICTORY' : phase === 'FLED' ? 'ESCAPED' : 'DEFEATED'}
            </h2>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--battle-mint)', opacity: 0.6, marginBottom: '16px' }}>Rounds: {roundNumber}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/battle')} className="battle-menu-btn">Battle Again</button>
              <button onClick={() => navigate('/dashboard')} className="battle-menu-btn">Dashboard</button>
            </div>
          </div>
        )}

        {/* Party menu */}
        {(phase === 'PARTY_MENU' || showParty) && phase !== 'VICTORY' && phase !== 'DEFEAT' && (
          <div style={{ padding: '16px 24px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Choose Fighter</span>
            <div className="flex gap-2 flex-wrap">
              {playerTeam.map((f, i) => (
                <button key={f.id} onClick={() => !f.isFainted && !f.isActive && handleSwitchFighter(i)}
                  className="battle-party-slot" data-active={f.isActive} data-fainted={f.isFainted}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', textTransform: 'uppercase' }}>{f.name}</span>
                  <span className="battle-hp-numbers" style={{ fontSize: '10px' }}>{f.currentHP}/{f.maxHP}</span>
                  {f.isFainted && <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '9px', color: 'var(--hp-low)' }}>FNT</span>}
                </button>
              ))}
            </div>
            {phase !== 'PARTY_MENU' && (
              <button onClick={() => setShowParty(false)} style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--battle-pink)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px' }}>Cancel</button>
            )}
          </div>
        )}

        {/* Move list */}
        {showMoves && phase === 'PLAYER_TURN' && (
          <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activePlayer.moves.map((move) => {
              const onCD = isOnCooldown(activePlayer, move.id);
              const silenced = hasStatus(activePlayer, 'silenced') && move.category === 'special';
              const disabled = onCD || silenced;
              return (
                <button key={move.id} onClick={() => !disabled && handleMoveSelect(move)}
                  className="battle-move-item" data-category={move.category} data-disabled={disabled}>
                  <span className="battle-move-category" data-cat={move.category}>{move.category}</span>
                  <span className="battle-move-name">{move.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', opacity: 0.4, letterSpacing: '1px' }}>{damageDots(move.damage)}</span>
                  {onCD && <span className="battle-move-cooldown">CD:{activePlayer.moveCooldowns[move.id]}</span>}
                  {silenced && <span className="battle-move-cooldown">SILENCED</span>}
                </button>
              );
            })}
            <button onClick={() => setShowMoves(false)} style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--battle-pink)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', alignSelf: 'flex-start' }}>Back</button>
          </div>
        )}

        {/* Main text + menu */}
        {!showMoves && !showParty && phase !== 'VICTORY' && phase !== 'DEFEAT' && phase !== 'FLED' && phase !== 'PARTY_MENU' && (
          <>
            {/* Text display */}
            {currentText && (
              <div className="battle-textbox" onClick={handleTextAdvance}>
                {displayed}
                {isComplete && textQueue.length > 1 && <span className="battle-textbox-cursor"> ▼</span>}
              </div>
            )}

            {/* Battle menu — FIGHT / PARTY / RUN */}
            {phase === 'PLAYER_TURN' && !currentText && (
              <div className="battle-menu">
                <button className="battle-menu-btn" data-primary="true" onClick={() => setShowMoves(true)}>Fight</button>
                <button className="battle-menu-btn" onClick={() => setShowParty(true)}>Party</button>
                <button className="battle-menu-btn" onClick={() => flee()}>Run</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BattleScreen;
