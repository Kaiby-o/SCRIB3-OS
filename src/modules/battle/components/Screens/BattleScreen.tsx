// ===== Battle Screen =====

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleStore } from '../../store/battleStore';
import { useTeamSelectStore } from '../../store/teamSelectStore';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useAnimations, STATUS_FILTERS } from '../../hooks/useAnimations';
import { startBattleMusic, stopBattleMusic, fadeBattleMusic, updateMusicVolume, playMoveSound, playEventSound } from '../../hooks/useBattleAudio';
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
  const [muted, setMuted] = useState(false);

  // Init battle
  useEffect(() => {
    if (teamSelectStore.playerTeam.length === 0) { navigate('/battle/team-select'); return; }
    initBattle(teamSelectStore.playerTeam, teamSelectStore.opponentTeam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Background music — starts when fighters slide in (INTRO phase)
  // User already clicked "Fight →" on team select, so autoplay is unlocked
  useEffect(() => {
    if (phase === 'INTRO') {
      // Small delay to sync with enter animations
      const t = setTimeout(() => startBattleMusic(), 200);
      return () => clearTimeout(t);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { stopBattleMusic(); };
  }, []);

  // Mute toggle
  const handleMuteToggle = useCallback(() => {
    const newMuted = !muted;
    setMuted(newMuted);
    updateMusicVolume(newMuted);
  }, [muted]);

  // Fade out on end
  useEffect(() => {
    if (phase === 'VICTORY' || phase === 'DEFEAT' || phase === 'FLED') {
      fadeBattleMusic();
      if (phase === 'VICTORY') playEventSound('heal');
      if (phase === 'DEFEAT') playEventSound('faint');
    }
  }, [phase]);

  // Enter animations
  useEffect(() => {
    if (phase === 'INTRO') {
      playEnter('player');
      playEnter('opponent');
    }
  }, [phase, playEnter]);

  if (!activePlayer || !activeOpponent) {
    return <div style={{ minHeight: '100vh', background: '#EAF2D7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'Kaio', sans-serif", color: '#000', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px' }}>Initializing...</span>
    </div>;
  }

  const handleTextAdvance = () => {
    if (!isComplete) { skip(); return; }
    advanceText();
  };

  const handleMoveSelect = async (move: Move) => {
    setShowMoves(false);
    playMoveSound(move.id, move.category);
    if (move.category === 'defensive') {
      const el = playerRef.current;
      if (el) await el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 300 }).finished;
    } else {
      await playAttack('player');
      playEventSound('normalHit');
      await playHit('opponent');
    }
    selectMove(move);
  };

  const handleSwitchFighter = (idx: number) => {
    setShowParty(false);
    switchFighter(idx);
  };

  // Special moves need cooldown at start — check if move is special and round < 3
  const isSpecialLocked = (move: Move) => move.category === 'special' && roundNumber < 2;

  const playerFilter = activePlayer.activeStatuses.map((s) => STATUS_FILTERS[s.id]).filter(Boolean).join(' ') || 'none';
  const opponentFilter = activeOpponent.activeStatuses.map((s) => STATUS_FILTERS[s.id]).filter(Boolean).join(' ') || 'none';

  return (
    <div style={{ minHeight: '100vh', background: '#EAF2D7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Top controls */}
      <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 20, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={handleMuteToggle} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button onClick={() => setBattleSpeed(battleSpeed === 'normal' ? 'fast' : 'normal')}
          style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: '#000', background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '75.641px', padding: '4px 10px', cursor: 'pointer', opacity: 0.4 }}>
          {battleSpeed === 'fast' ? '▶▶' : '▶'}
        </button>
      </div>

      {/* Forfeit button */}
      <button onClick={() => { stopBattleMusic(); navigate('/battle'); }}
        style={{ position: 'absolute', top: 12, left: 16, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '75.641px', border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: '#000', cursor: 'pointer', opacity: 0.4, zIndex: 20 }}>
        Forfeit
      </button>

      {/* Battle Frame — landscape rectangle, fixed size */}
      <div ref={screenRef} className="battle-scene battle-arena" style={{ width: '80vh', height: '45vh', maxWidth: '95vw', maxHeight: '45vh', borderRadius: '10.258px', border: '1px solid rgba(0,0,0,0.1)', position: 'relative', display: 'flex', flexShrink: 0 }}>
        {/* Opponent nameplate — top left */}
        <div className="battle-nameplate" style={{ position: 'absolute', top: 16, left: 16, zIndex: 5 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#EAF2D7' }}>{activeOpponent.name}</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', opacity: 0.5, color: '#EAF2D7' }}>Lv{FIGHTER_LEVEL}</span>
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
              {activeOpponent.activeStatuses.map((s) => <span key={s.id} className="battle-status-badge">{statusBadgeText(s.id)}</span>)}
            </div>
          )}
        </div>

        {/* Opponent sprite — top right */}
        <div ref={opponentRef} style={{ position: 'absolute', top: '15%', right: '10%' }}>
          <img src={spritePath(activeOpponent.id, 'front')} alt={activeOpponent.name}
            style={{ width: '18vh', height: '18vh', imageRendering: 'pixelated', objectFit: 'contain', filter: opponentFilter }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>

        {/* Player sprite — bottom left, flush with bottom edge */}
        <div ref={playerRef} style={{ position: 'absolute', bottom: 0, left: '8%' }}>
          <img src={spritePath(activePlayer.id, 'back')} alt={activePlayer.name}
            style={{ width: '20vh', height: '20vh', imageRendering: 'pixelated', objectFit: 'contain', filter: playerFilter }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>

        {/* Player nameplate — bottom right */}
        <div className="battle-nameplate" style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 5 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#EAF2D7' }}>{activePlayer.name}</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', opacity: 0.5, color: '#EAF2D7' }}>Lv{FIGHTER_LEVEL}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="battle-hp-label">HP</span>
            <div className="battle-hp-bar-container" style={{ flex: 1 }}>
              <div className="battle-hp-bar-fill" data-level={hpLevel(activePlayer.currentHP, activePlayer.maxHP)}
                style={{ width: `${hpPercent(activePlayer.currentHP, activePlayer.maxHP)}%` }} />
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#EAF2D7' }}>{activePlayer.currentHP}/{activePlayer.maxHP}</span>
          </div>
          {activePlayer.activeStatuses.length > 0 && (
            <div className="flex gap-1" style={{ marginTop: '4px' }}>
              {activePlayer.activeStatuses.map((s) => <span key={s.id} className="battle-status-badge">{statusBadgeText(s.id)}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Everything below the battle frame — centered */}
      <div style={{ width: '80vh', maxWidth: '95vw', marginTop: '12px' }}>
        {/* Victory / Defeat */}
        {(phase === 'VICTORY' || phase === 'DEFEAT' || phase === 'FLED') && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '36px', textTransform: 'uppercase', letterSpacing: '4px', color: phase === 'VICTORY' ? '#27AE60' : phase === 'FLED' ? '#000' : '#E53935', marginBottom: '12px' }}>
              {phase === 'VICTORY' ? 'VICTORY' : phase === 'FLED' ? 'ESCAPED' : 'DEFEATED'}
            </h2>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.4, marginBottom: '16px' }}>Rounds: {roundNumber}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/battle')} className="battle-menu-btn">Battle Again</button>
              <button onClick={() => navigate('/dashboard')} className="battle-menu-btn">Dashboard</button>
            </div>
          </div>
        )}

        {/* Party menu */}
        {(phase === 'PARTY_MENU' || showParty) && phase !== 'VICTORY' && phase !== 'DEFEAT' && (
          <div style={{ padding: '12px 0' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '12px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px', textAlign: 'center' }}>Choose Fighter</span>
            <div className="flex gap-2 flex-wrap justify-center">
              {playerTeam.map((f, i) => (
                <button key={f.id} onClick={() => !f.isFainted && !f.isActive && handleSwitchFighter(i)}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', borderRadius: '75.641px', border: f.isActive ? '2px solid #D7ABC5' : f.isFainted ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(0,0,0,0.2)', background: f.isActive ? 'rgba(215,171,197,0.1)' : 'transparent', color: '#000', cursor: f.isFainted || f.isActive ? 'default' : 'pointer', opacity: f.isFainted ? 0.3 : 1 }}>
                  {f.name} {f.currentHP}/{f.maxHP} {f.isFainted ? '(FNT)' : ''}
                </button>
              ))}
            </div>
            {phase !== 'PARTY_MENU' && (
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button onClick={() => setShowParty(false)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#000', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* Move list */}
        {showMoves && phase === 'PLAYER_TURN' && (
          <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            {activePlayer.moves.map((move: Move) => {
              const onCD = isOnCooldown(activePlayer, move.id);
              const silenced = hasStatus(activePlayer, 'silenced') && move.category === 'special';
              const specLocked = isSpecialLocked(move);
              const disabled = onCD || silenced || specLocked;
              return (
                <button key={move.id} onClick={() => !disabled && handleMoveSelect(move)}
                  className="battle-move-item" data-category={move.category} data-disabled={disabled}
                  style={{ width: '100%', maxWidth: '400px' }}>
                  <span className="battle-move-category" data-cat={move.category}>{move.category}</span>
                  <span className="battle-move-name">{move.name}</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3, letterSpacing: '1px' }}>{damageDots(move.damage)}</span>
                  {onCD && <span className="battle-move-cooldown">CD:{activePlayer.moveCooldowns[move.id]}</span>}
                  {silenced && <span className="battle-move-cooldown">SILENCED</span>}
                  {specLocked && <span className="battle-move-cooldown">LOCKED</span>}
                </button>
              );
            })}
            <button onClick={() => setShowMoves(false)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#000', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, marginTop: '4px' }}>Back</button>
          </div>
        )}

        {/* Main text + menu */}
        {!showMoves && !showParty && phase !== 'VICTORY' && phase !== 'DEFEAT' && phase !== 'FLED' && phase !== 'PARTY_MENU' && (
          <>
            {currentText && (
              <div className="battle-textbox" onClick={handleTextAdvance}>
                {displayed}
                {isComplete && textQueue.length > 1 && <span className="battle-textbox-cursor"> ▼</span>}
              </div>
            )}

            {phase === 'PLAYER_TURN' && !currentText && (
              <div className="flex gap-3 justify-center" style={{ padding: '12px 0' }}>
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
