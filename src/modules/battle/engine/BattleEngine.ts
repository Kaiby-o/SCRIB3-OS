// ===== Battle Engine — Turn Resolver =====

import type { BattleFighter, Move, TurnResult, RoundResult, StatusID } from '../data/battleTypes';
import { calculateDamage } from '../utils/damageCalc';
import { applyStatus, clearStatus, hasStatus, isIncapacitated, tickStatuses, getEffectiveStats } from './StatusEngine';
import { setCooldown, decrementCooldowns } from './CooldownTracker';
import { randPick, randInt } from '../utils/rng';

export function resolveMove(
  attacker: BattleFighter,
  defender: BattleFighter,
  move: Move,
  rng: () => number,
): TurnResult {
  const messages: string[] = [];
  if (move.narrativeOnUse) {
    messages.push(move.narrativeOnUse.replace('{name}', attacker.name).replace('{opponent}', defender.name));
  } else {
    messages.push(`${attacker.name} used ${move.name}!`);
  }

  // Check incapacitation
  const incap = isIncapacitated(attacker);
  if (incap.blocked) {
    messages.push(incap.reason);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Silenced check — can't use special
  if (hasStatus(attacker, 'silenced') && move.category === 'special') {
    messages.push(`${attacker.name} is silenced — Special move blocked!`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Set cooldown
  if (move.cooldown > 0) setCooldown(attacker, move.id, move.cooldown);

  // Track last move
  attacker.lastMove = move;
  if (move.category === 'defensive') attacker.lastDefensiveMove = move;

  // --- Handle special mechanics by move ID ---
  const moveId = move.id;

  // Nick Patience of a Fisherman
  if (moveId === 'patience_of_a_fisherman') {
    attacker.chargingPatience = true;
    messages.push(`${attacker.name} is biding their time...`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // CK Slow Burn
  if (moveId ==='slow_burn') {
    const multiplier = 1.2 + rng() * 0.8;
    attacker.slowBurnMultiplier = multiplier;
    applyStatus(attacker, 'slow_burn_token', { duration: 99 });
    messages.push(`${attacker.name} is building up... (${multiplier.toFixed(1)}x next attack)`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // CK The Long Game
  if (moveId ==='the_long_game') {
    attacker.longGameStoredDamage = 0;
    applyStatus(attacker, 'long_game_stored', { duration: 2 });
    messages.push(`${attacker.name} is playing the long game...`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // CK Creative Direction
  if (moveId ==='creative_direction') {
    return resolveCKCreativeDirection(attacker, defender, rng, messages, move);
  }

  // Ishan Closing Argument
  if (moveId ==='closing_argument') {
    const dmgResult = calculateDamage(attacker, defender, move, rng);
    if (!dmgResult.missed) {
      defender.currentHP = Math.max(0, defender.currentHP - dmgResult.damage);
      applyStatus(defender, 'silenced', { duration: 2 });
      messages.push(`${defender.name} took ${dmgResult.damage} damage and is silenced!`);
    } else {
      messages.push(`${attacker.name}'s argument missed!`);
    }
    defender.isFainted = defender.currentHP <= 0;
    return { attacker, defender, move, damage: dmgResult.damage, isCrit: dmgResult.isCrit, missed: dmgResult.missed, messages, defenderFainted: defender.isFainted };
  }

  // Matt Under Embargo
  if (moveId ==='under_embargo') {
    if (attacker.embargoUseCount > 0) {
      applyStatus(defender, 'press_scrutiny', { duration: 2 });
      messages.push(`Consecutive embargo! Press scrutiny applied instead.`);
      attacker.embargoUseCount = 0;
    } else {
      applyStatus(defender, 'in_embargo', { duration: 1 });
      messages.push(`${defender.name} is under embargo for 1 turn!`);
      attacker.embargoUseCount++;
    }
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Matt Off the Record
  if (moveId ==='off_the_record') {
    attacker.damageReductionThisTurn = 0.60;
    messages.push(`${attacker.name} goes off the record — 60% damage reduction this turn!`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Ross Duck Dive
  if (moveId ==='duck_dive') {
    applyStatus(attacker, 'dmg_reduction', { duration: 1, sourceValue: 1.0 }); // Full evasion for basic/status
    messages.push(`${attacker.name} ducks and dives!`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Ross Wipeout
  if (moveId ==='wipeout') {
    const dmgResult = calculateDamage(attacker, defender, move, rng);
    if (!dmgResult.missed) {
      defender.currentHP = Math.max(0, defender.currentHP - dmgResult.damage);
      if (rng() < 0.65) {
        applyStatus(defender, 'stun', { duration: 1 });
        messages.push(`${defender.name} lost their footing!`);
      } else {
        messages.push(`${defender.name} kept their balance!`);
      }
    }
    defender.isFainted = defender.currentHP <= 0;
    return { attacker, defender, move, damage: dmgResult.damage, isCrit: dmgResult.isCrit, missed: dmgResult.missed, messages, defenderFainted: defender.isFainted };
  }

  // Stef Stitch
  if (moveId ==='stitch') {
    const lastDamage = defender.lastMoveDamageDealt ?? 0;
    if (lastDamage === 0) {
      const fallback = randInt(rng, 8, 14);
      defender.currentHP = Math.max(0, defender.currentHP - fallback);
      messages.push(`Nothing to stitch yet. ${attacker.name} dealt ${fallback} damage instead.`);
    } else {
      const reflect = Math.floor(lastDamage * 0.45);
      const heal = Math.floor(reflect * 0.10);
      defender.currentHP = Math.max(0, defender.currentHP - reflect);
      attacker.currentHP = Math.min(attacker.currentHP + heal, attacker.maxHP);
      messages.push(`${attacker.name} stitched ${reflect} damage back! Recovered ${heal} HP.`);
    }
    defender.isFainted = defender.currentHP <= 0;
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: defender.isFainted };
  }

  // Tolani Loop
  if (moveId ==='loop') {
    if (!attacker.lastDefensiveMove) {
      messages.push(`No defense to loop yet.`);
    } else {
      messages.push(`${attacker.name} loops ${attacker.lastDefensiveMove.name} at 75% effectiveness!`);
      // Re-apply at 75%
    }
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Haley Calming Presence
  if (moveId ==='calming_presence') {
    applyStatus(defender, 'sleep', { duration: 2 });
    messages.push(`${defender.name} fell asleep!`);
    return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
  }

  // Taylor Orlando Magic
  if (moveId ==='orlando_magic') {
    const pool = ['confusion', 'slow', 'burn', 'blind', 'stun', 'paralysis'] as const;
    const randomStatus = randPick(rng, [...pool]);
    applyStatus(defender, randomStatus, { duration: 1 });
    const dmgResult = calculateDamage(attacker, defender, move, rng);
    if (!dmgResult.missed) {
      defender.currentHP = Math.max(0, defender.currentHP - dmgResult.damage);
      messages.push(`${defender.name} took ${dmgResult.damage} damage and got ${randomStatus}!`);
    }
    defender.isFainted = defender.currentHP <= 0;
    return { attacker, defender, move, damage: dmgResult.damage, isCrit: dmgResult.isCrit, missed: dmgResult.missed, messages, defenderFainted: defender.isFainted };
  }

  // --- Default move resolution ---
  // Self-heal
  if (move.effect?.selfHealPercent) {
    const heal = Math.floor(attacker.maxHP * move.effect.selfHealPercent);
    attacker.currentHP = Math.min(attacker.currentHP + heal, attacker.maxHP);
    messages.push(`${attacker.name} recovered ${heal} HP!`);
  }

  // Self-status
  if (move.effect?.applySelfStatus) {
    applyStatus(attacker, move.effect.applySelfStatus as StatusID, { duration: move.effect.selfStatusDuration ?? 2 });
  }

  // Damage reduction
  if (move.effect?.damageReductionPercent) {
    applyStatus(attacker, 'dmg_reduction' as StatusID, { duration: 1, sourceValue: move.effect.damageReductionPercent });
  }

  // Damage
  const dmgResult = calculateDamage(attacker, defender, move, rng);
  let totalDamage = dmgResult.damage;

  if (dmgResult.missed) {
    messages.push(`${attacker.name}'s attack missed!`);
  } else if (totalDamage > 0) {
    // Apply damage reduction from defender's turn
    if (defender.damageReductionThisTurn > 0) {
      totalDamage = Math.floor(totalDamage * (1 - defender.damageReductionThisTurn));
      defender.damageReductionThisTurn = 0;
    }

    defender.currentHP = Math.max(0, defender.currentHP - totalDamage);
    attacker.lastMoveDamageDealt = totalDamage;

    // Store for Long Game
    if (hasStatus(defender, 'long_game_stored')) {
      defender.longGameStoredDamage += totalDamage;
    }

    let hitMsg = move.narrativeOnHit?.replace('{name}', attacker.name).replace('{opponent}', defender.name) ?? `${defender.name} took ${totalDamage} damage!`;
    if (dmgResult.isCrit) hitMsg += ' Critical hit!';
    messages.push(hitMsg);
  }

  // Apply status to defender
  if (move.effect?.applyStatus && !dmgResult.missed) {
    applyStatus(defender, move.effect.applyStatus as StatusID, { duration: move.effect.statusDuration ?? 2, sourceValue: move.effect.statusValue, sourceMove: move.id });
    messages.push(`${defender.name} is now ${String(move.effect.applyStatus).replace(/_/g, ' ')}!`);
  }

  // Consume Slow Burn token
  if (attacker.slowBurnMultiplier && move.category !== 'defensive') {
    attacker.slowBurnMultiplier = null;
    clearStatus(attacker, 'slow_burn_token');
  }

  // Consume Patience charge
  if (attacker.chargingPatience) {
    attacker.chargingPatience = false;
  }

  defender.isFainted = defender.currentHP <= 0;
  if (defender.isFainted) messages.push(`${defender.name} fainted!`);

  return { attacker, defender, move, damage: totalDamage, isCrit: dmgResult.isCrit, missed: dmgResult.missed, messages, defenderFainted: defender.isFainted };
}

function resolveCKCreativeDirection(attacker: BattleFighter, defender: BattleFighter, rng: () => number, messages: string[], move: Move): TurnResult {
  const outcomes = ['rebrand', 'campaign_drop', 'mood_board', 'the_pivot'] as const;
  const roll = randPick(rng, [...outcomes]);

  switch (roll) {
    case 'rebrand': {
      const hpPct = attacker.currentHP / attacker.maxHP;
      if (hpPct < 0.9) {
        const heal = Math.floor(attacker.maxHP * 0.15);
        attacker.currentHP = Math.min(attacker.currentHP + heal, attacker.maxHP);
        messages.push(`Rebrand! ${attacker.name} recovered ${heal} HP!`);
      }
      applyStatus(attacker, 'atk_up', { duration: 2 });
      messages.push(`${attacker.name}'s attack rose!`);
      return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
    }
    case 'campaign_drop': {
      const dmgResult = calculateDamage(attacker, defender, { ...move, damage: 'high' }, rng);
      if (!dmgResult.missed) {
        defender.currentHP = Math.max(0, defender.currentHP - dmgResult.damage);
        messages.push(`Campaign Drop! ${defender.name} took ${dmgResult.damage} damage!`);
      }
      defender.isFainted = defender.currentHP <= 0;
      return { attacker, defender, move, damage: dmgResult.damage, isCrit: dmgResult.isCrit, missed: dmgResult.missed, messages, defenderFainted: defender.isFainted };
    }
    case 'mood_board': {
      const statusPool = ['confusion', 'slow', 'blind', 'burn'] as const;
      const picked = randPick(rng, [...statusPool]);
      applyStatus(defender, picked, { duration: 2 });
      messages.push(`Mood Board! ${defender.name} got ${picked}!`);
      return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
    }
    case 'the_pivot': {
      // Swap all stat buffs/debuffs
      const attackerStatuses = attacker.activeStatuses.filter((s) => ['atk_up', 'def_up', 'spd_up', 'atk_down', 'def_down', 'spd_down', 'burn', 'confusion', 'slow', 'blind'].includes(s.id));
      const defenderStatuses = defender.activeStatuses.filter((s) => ['atk_up', 'def_up', 'spd_up', 'atk_down', 'def_down', 'spd_down', 'burn', 'confusion', 'slow', 'blind'].includes(s.id));

      if (attackerStatuses.length === 0 && defenderStatuses.length === 0) {
        messages.push(`The Pivot! But nothing to swap...`);
      } else {
        // Remove swappable from both
        attacker.activeStatuses = attacker.activeStatuses.filter((s) => !attackerStatuses.find((a) => a.id === s.id));
        defender.activeStatuses = defender.activeStatuses.filter((s) => !defenderStatuses.find((d) => d.id === s.id));
        // Swap
        attacker.activeStatuses.push(...defenderStatuses);
        defender.activeStatuses.push(...attackerStatuses);
        messages.push(`The Pivot! All stat effects swapped!`);
      }
      return { attacker, defender, move, damage: 0, isCrit: false, missed: false, messages, defenderFainted: false };
    }
  }
}

export function resolveRound(
  player: BattleFighter,
  opponent: BattleFighter,
  playerMove: Move,
  opponentMove: Move,
  rng: () => number,
  roundNumber: number,
): RoundResult {
  const playerStats = getEffectiveStats(player);
  const opponentStats = getEffectiveStats(opponent);

  // Speed order — defensive priority moves go first
  const playerPriority = playerMove.category === 'defensive' ? 1 : 0;
  const opponentPriority = opponentMove.category === 'defensive' ? 1 : 0;

  let first: 'player' | 'opponent';
  if (playerPriority !== opponentPriority) {
    first = playerPriority > opponentPriority ? 'player' : 'opponent';
  } else {
    first = playerStats.spd >= opponentStats.spd ? 'player' : 'opponent';
  }

  // Resolve first move
  let playerResult: TurnResult;
  let opponentResult: TurnResult | null = null;

  if (first === 'player') {
    playerResult = resolveMove(player, opponent, playerMove, rng);
    if (!opponent.isFainted) {
      opponentResult = resolveMove(opponent, player, opponentMove, rng);
    }
  } else {
    opponentResult = resolveMove(opponent, player, opponentMove, rng);
    if (!player.isFainted) {
      playerResult = resolveMove(player, opponent, playerMove, rng);
    } else {
      playerResult = { attacker: player, defender: opponent, move: playerMove, damage: 0, isCrit: false, missed: false, messages: [], defenderFainted: false };
    }
  }

  // Status ticks
  const statusMessages: string[] = [];
  if (!player.isFainted) {
    const pt = tickStatuses(player);
    statusMessages.push(...pt.tickMessages);
  }
  if (!opponent.isFainted) {
    const ot = tickStatuses(opponent);
    statusMessages.push(...ot.tickMessages);
  }

  // Cooldown decrements
  decrementCooldowns(player);
  decrementCooldowns(opponent);

  // Reset per-turn values
  player.damageReductionThisTurn = 0;
  opponent.damageReductionThisTurn = 0;

  // Cynthia Levelling Up passive
  if (player.isActive && player.id === 'cynthia') {
    player.turnsSurvived++;
    if (player.turnsSurvived > 0 && player.turnsSurvived % 5 === 0 && player.turnsSurvived <= 15) {
      player.stats.atk = Math.floor(player.stats.atk * 1.08);
      player.stats.def = Math.floor(player.stats.def * 1.08);
      statusMessages.push(`Cynthia is getting stronger! +8% ATK and DEF!`);
    }
  }
  if (opponent.isActive && opponent.id === 'cynthia') {
    opponent.turnsSurvived++;
    if (opponent.turnsSurvived > 0 && opponent.turnsSurvived % 5 === 0 && opponent.turnsSurvived <= 15) {
      opponent.stats.atk = Math.floor(opponent.stats.atk * 1.08);
      opponent.stats.def = Math.floor(opponent.stats.def * 1.08);
      statusMessages.push(`Cynthia is getting stronger! +8% ATK and DEF!`);
    }
  }

  // Long Game stored damage release
  if (hasStatus(player, 'long_game_stored') && player.longGameStoredDamage > 0) {
    const release = Math.floor(player.longGameStoredDamage * 0.50);
    opponent.currentHP = Math.max(0, opponent.currentHP - release);
    statusMessages.push(`The Long Game pays off! ${release} damage released!`);
    player.longGameStoredDamage = 0;
    clearStatus(player, 'long_game_stored');
  }

  // Evergreen stored bonus
  if (player.evergreenStoredDamage > 0 && playerMove.category !== 'defensive') {
    statusMessages.push(`Evergreen bonus: +${player.evergreenStoredDamage} damage!`);
    player.evergreenStoredDamage = 0;
  }

  return { playerResult, opponentResult, statusMessages, roundNumber };
}
