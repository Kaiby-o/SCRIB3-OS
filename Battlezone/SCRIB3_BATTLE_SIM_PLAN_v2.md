# SCRIB3 Battle Simulator — Claude Code Build Plan
**Version:** 2.0 (v4 Balance Update) | **Status:** Ready for execution  
**Integration target:** SCRIB3-OS (`src/modules/battle/`)  
**Updated:** 2026-03-28

---

## 0. Brief & Vision

A Pokémon Gen 4 DS-style turn-based battle simulator where every SCRIB3 team member is a playable fighter with unique moves. Skinned entirely in SCRIB3 brand aesthetics. Playable from within SCRIB3-OS as a `/battle` route.

**Core experience loop:**
1. Player selects a team of up to 6 fighters from the 29-person roster
2. Opponent team is selected (AI or second player)
3. Turn-based battle plays out with animations, status effects, and lore-accurate moves
4. Win condition: all opponent fighters faint

**Key reference layout (Gen 4 DS):**
- Player's **back sprite** → bottom-left on raised platform
- Opponent's **front sprite** → top-right on raised platform
- Opponent nameplate (name / level / HP) → upper-left
- Player nameplate (name / level / HP / EXP bar) → lower-right
- Battle text box → spans full width at bottom
- Move selection → 2×2 or scrollable list overlaying text box area
- Party HP panel → overlays battle scene

---

## 1. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | React 19 + TypeScript | Matches SCRIB3-OS |
| Bundler | Vite | Matches SCRIB3-OS |
| State | Zustand | Battle state store |
| Styling | CSS Modules + CSS custom properties | SCRIB3 design tokens |
| Animation | Web Animations API only | No Framer/GSAP |
| Fonts | OwnersWide (display), Space Mono (UI/numbers) | OwnersWide already in OS |
| Persistence | Supabase (v2 optional) | Battle history, leaderboard |
| Routing | React Router v6 | `/battle`, `/battle/team-select`, `/battle/fight` |
| Sprites | Static PNG assets in `public/sprites/` | Back + front views per fighter |

---

## 2. Sprite Naming Convention

```
public/sprites/front/  firstname-front.png
public/sprites/back/   firstname-back.png

Special cases:
  kevin-a-front.png / kevin-a-back.png   (Kevin Arteaga)
  kevin-m-front.png / kevin-m-back.png   (Kevin Moran)

Full list of expected IDs (matches fighters.ts id field):
  jb, ross, arthur, ishan, ben, nick, sixtyne, elena, janelle,
  matt, haley, camila, sam, omar, madisen, taylor, jenny,
  hugh, kevin-a, kim, jake, luke, cynthia, stef, amanda,
  kevin-m, tolani, destini, ck
```

**Sprite sizing (Gen 4 DS):**
- Back sprite (player): rendered at 320×320px — `image-rendering: pixelated`
- Front sprite (opponent): rendered at 256×256px — `image-rendering: pixelated`

---

## 3. Project Structure

```
src/
  modules/
    battle/
      index.tsx
      data/
        fighters.ts          ← DROP IN FROM PACKAGE (already written)
        moves.ts
        statusEffects.ts
        battleConfig.ts
      store/
        battleStore.ts
        teamSelectStore.ts
      engine/
        BattleEngine.ts
        AIOpponent.ts
        CooldownTracker.ts
        StatusEngine.ts
      components/
        BattleScene/
        Sprites/
        Nameplates/
        BattleMenu/
        TextBox/
        TeamSelect/
        Screens/
      hooks/
        useBattle.ts
        useAnimations.ts
        useTypewriter.ts
      utils/
        damageCalc.ts
        rng.ts
        formatters.ts

public/
  sprites/
    back/     {id}-back.png
    front/    {id}-front.png
```

---

## 4. Design System — SCRIB3 Battle Skin

```css
:root {
  --battle-bg-dark:       #0A0A0A;
  --battle-bg-mid:        #111118;
  --battle-pink:          #D7ABC5;
  --battle-mint:          #EAF2D7;
  --battle-blue-grey:     #6E93C3;
  --battle-olive:         #7B7554;
  --hp-high:              #4CAF50;
  --hp-mid:               #F5C542;
  --hp-low:               #E53935;
  --hp-bg:                #1A1A24;
  --nameplate-bg:         rgba(10, 10, 10, 0.92);
  --nameplate-border:     #D7ABC5;
  --nameplate-text:       #F0ECF4;
  --textbox-bg:           rgba(12, 12, 18, 0.97);
  --textbox-border:       #D7ABC5;
  --textbox-text:         #F0ECF4;
  --move-special-border:  #D7ABC5;
  --move-basic-border:    #6E93C3;
  --move-defense-border:  #EAF2D7;
  --move-disabled:        #2A2A2A;
  --font-display:         'OwnersWide', sans-serif;
  --font-mono:            'Space Mono', monospace;
}
```

**Arena background:** dark navy-to-black gradient, faint CSS grid at 4% `--battle-pink` opacity. No natural environments — pure tech-brutalist aesthetic.

---

## 5. Data Model

### 5.1 Stat Tiers (in `battleConfig.ts`)

```typescript
export const ROLE_STAT_TIERS = {
  FOUNDER:   { hp: 240, atk: 85,  def: 80,  spd: 70  },
  VP:        { hp: 220, atk: 90,  def: 75,  spd: 75  },
  CCO:       { hp: 230, atk: 88,  def: 78,  spd: 73  },
  DIRECTOR:  { hp: 200, atk: 85,  def: 70,  spd: 80  },
  SENIOR:    { hp: 190, atk: 80,  def: 65,  spd: 85  },
  MANAGER:   { hp: 180, atk: 78,  def: 60,  spd: 88  },
  SPECIALIST:{ hp: 170, atk: 82,  def: 55,  spd: 90  },
  ADVISOR:   { hp: 195, atk: 88,  def: 58,  spd: 84  }, // CK custom
};

export const DAMAGE_VALUES = {
  none:         0,
  low:          { min: 8,  max: 14 },
  moderate:     { min: 16, max: 26 },
  moderate_high:{ min: 22, max: 34 },
  high:         { min: 28, max: 42 },
};

export const ACCURACY_BASE   = 90;
export const CRIT_CHANCE     = 6.25;
export const CRIT_MULTIPLIER = 1.5;
```

### 5.2 BattleFighter (extends Fighter from fighters.ts)

```typescript
export interface BattleFighter extends Fighter {
  currentHP: number;
  maxHP: number;
  activeStatuses: ActiveStatus[];
  moveCooldowns: Record<string, number>;
  isFainted: boolean;
  isActive: boolean;
  lastMove: Move | null;
  lastDefensiveMove: Move | null;       // for Tolani Loop
  turnsSurvived: number;                // for Cynthia Levelling Up
  chargingPatience: boolean;            // Nick Patience of a Fisherman
  slowBurnMultiplier: number | null;    // CK Slow Burn stored multiplier
  longGameStoredDamage: number;         // CK The Long Game
  evergreenStoredDamage: number;        // Luke Evergreen
  embargoUseCount: number;              // Matt Under Embargo consecutive use
}

export interface ActiveStatus {
  id: StatusID;
  turnsRemaining: number;
  sourceValue?: number;
}
```

---

## 6. Battle Engine — Core Logic

### 6.1 Battle State

```typescript
type BattlePhase =
  | 'INTRO' | 'PLAYER_TURN' | 'OPPONENT_TURN' | 'RESOLVING'
  | 'TEXT' | 'SWITCH_IN' | 'PARTY_MENU' | 'VICTORY' | 'DEFEAT' | 'FLED';
```

### 6.2 Damage Formula

```typescript
function calculateDamage(attacker, defender, move, rng): DamageResult {
  const baseRange = DAMAGE_VALUES[move.damage];
  if (!baseRange) return { damage: 0, isCrit: false };

  let damage = baseRange.min + Math.floor(rng() * (baseRange.max - baseRange.min + 1));

  // ATK/DEF modifiers
  damage = Math.floor(damage * (attacker.stats.atk / 80) * getStatMod(attacker, 'atk'));
  damage = Math.floor(damage / (defender.stats.def / 80) / getStatMod(defender, 'def'));

  // CK Slow Burn multiplier
  if (attacker.slowBurnMultiplier && move.category !== 'defensive') {
    damage = Math.floor(damage * attacker.slowBurnMultiplier);
    attacker.slowBurnMultiplier = null; // consume token
  }

  // Crit
  const isCrit = rng() * 100 < CRIT_CHANCE;
  if (isCrit) damage = Math.floor(damage * CRIT_MULTIPLIER);

  // Accuracy
  const acc = ACCURACY_BASE + getAccuracyMod(attacker, defender);
  if (rng() * 100 > acc) return { damage: 0, isCrit: false, missed: true };

  // bypassCounters (Off-Piste v4) — skip reflection checks in engine
  // bypassDefensiveBuffs (All Hands) — ignore defender's dmgReduction status

  return { damage: Math.max(1, damage), isCrit, missed: false };
}
```

### 6.3 Turn Resolution Order

```
1. Both sides select moves
2. Priority: defensive priority moves first; then speed order
3. Move 1 resolves:
   a. Check stun/in_embargo/sleep/silenced (skip if applicable)
   b. Accuracy check
   c. Damage calc + apply
   d. Status effects applied
   e. Narration to text queue
   f. Animate sprite
4. Faint check
5. Move 2 resolves (same flow)
6. Status ticks (DoT, turn counters)
7. Cooldowns decrement
8. Cynthia Levelling Up check (turnsSurvived % 5 === 0)
9. Advance turn
```

### 6.4 AI Tier 1

```
40% — use Special if not on cooldown and opponent HP > 50%
30% — use Basic attack (random of the two)
15% — use Defensive if own HP < 40% or negative status active
15% — random move

CK override: prioritise Creative Direction if available
```

---

## 7. Component Layout

```
┌─────────────────────────────────────────────────────┐
│  [Opponent Nameplate]          [Opponent Sprite]    │
│  Name / HP bar / Status                             │
│                                                     │
│  [Player Sprite]         [Player Nameplate]         │
│                          Name / HP / EXP / Status   │
├─────────────────────────────────────────────────────┤
│  [Text Box / Move Menu / Party Panel]               │
└─────────────────────────────────────────────────────┘
```

```css
.battleScene {
  display: grid;
  grid-template-rows: 62% 38%;
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  margin: 0 auto;
}
```

**HP Bar:** > 50% green → 25–50% yellow → < 25% red + pulse. CSS `transition: width 800ms ease-in-out`.

**Move List:** Vertical scrollable list of all 5 moves. Category badge (SPECIAL/BASIC/STATUS) colour-coded. Cooldown indicator `CD: N` when unavailable. Damage dots `●●●○`.

**Text Box:** Full-width, typewriter at 30ms/char. `▼` blink on complete. Spacebar/click/tap to advance.

---

## 8. Special Mechanics — Engine Implementation Reference

All fighter-specific logic for `BattleEngine.ts`. Implement exactly as specced.

### CK (Strategic Advisor)

**Creative Direction** (Special — `creative_direction`)
```typescript
// Roll one outcome with equal 0.25 weight
const outcomes = ['rebrand', 'campaign_drop', 'mood_board', 'the_pivot'];
const roll = outcomes[Math.floor(rng() * 4)];

switch(roll) {
  case 'rebrand':
    // Heal 15% maxHP, apply atk_up +15% for 2 turns
    // Guard: if HP > 90% maxHP, no heal (no overflow)
    break;
  case 'campaign_drop':
    // Treat as HIGH damage attack — goes through normal damage calc, can crit
    break;
  case 'mood_board':
    // Apply one random status from: ['confusion','slow','blind','burn'], each 2 turns
    break;
  case 'the_pivot':
    // Swap ALL active stat buffs and debuffs between player and opponent
    // e.g. if CK has burn and opponent has atk_up, they swap
    break;
}
```

**Slow Burn** (`slow_burn`)
```typescript
// On use: roll multiplier between 1.2 and 2.0
const multiplier = 1.2 + rng() * 0.8;
attacker.slowBurnMultiplier = multiplier;
// Apply slow_burn_token status (visible badge on nameplate)
// In damageCalc: if slowBurnMultiplier set + move is attack category, multiply damage then clear
```

**Off-Piste** (`off_piste`)
```typescript
// Flag on move: bypassCounters: true
// In BattleEngine.resolveMove, before reflection/counter checks:
if (move.effect.bypassCounters) {
  skipReflection = true;   // Stef Stitch has no effect
  skipBlowback = true;     // Janelle Hit Piece blowback has no effect
  skipMissRoll = true;     // Ross Wipeout miss chance has no effect
}
// Does NOT skip: dmgReduction, evadeNextMove (full evasion), in_embargo
```

**The Long Game** (`the_long_game`)
```typescript
// On use: set attacker.longGameStoredDamage = 0, applySelfStatus('long_game_stored')
// In damage receive: if long_game_stored active, store incomingDamage
// On attacker's NEXT turn start: deal longGameStoredDamage * 0.50 to opponent, clear stored
```

---

### Haley Stewart Torculas

**Calming Presence** (`calming_presence`) ← v4 nerfed
```typescript
// Apply sleep status to opponent for 2 turns (was 3)
// Each tick while opponent is sleeping:
//   opponentDamage = opponent.maxHP * 0.05   // 5% drain (was 8%)
//   opponent.currentHP -= opponentDamage
//   haley.currentHP += Math.floor(opponentDamage * 0.50)  // Haley gets 50% of drained (was 100%)
```

---

### Jake Embleton

**Going Viral** (`going_viral`) ← v4 nerfed
```typescript
// Linear scaling — NOT doubling
// Tick 1: base moderate damage
// Tick 2: base * 1.5
// Tick 3: base * 1.5
// No stacking: if going_viral already active when cast again, RESET timer, do not add new instance
if (opponent.activeStatuses.find(s => s.id === 'scope_creep' && s.sourceMove === 'going_viral')) {
  resetStatusTimer(opponent, 'going_viral_scope_creep');
} else {
  applyStatus(opponent, 'scope_creep', { duration: 3, compoundFactor: 1.5 });
}
```

---

### Matthew Brannon

**Under Embargo** (`under_embargo`) ← v4 nerfed
```typescript
// 1-turn lockout (was 2)
// Cooldown: 3 turns (was 2)
// Consecutive use rule:
if (attacker.embargoUseCount > 0 && lastRoundUsed === 'under_embargo') {
  // Apply press_scrutiny instead of in_embargo
  applyStatus(opponent, 'press_scrutiny', { duration: 2 });
  attacker.embargoUseCount = 0;
} else {
  applyStatus(opponent, 'in_embargo', { duration: 1 });
  attacker.embargoUseCount++;
}
```

**Off the Record** (`off_the_record`) ← v4 nerfed
```typescript
// 60% damage reduction for the turn (was full invincibility)
// NOT evadeNextMove — damage still lands, just reduced by 60%
attacker.damageReductionThisTurn = 0.60;
```

---

### Ross Booth

**Duck Dive** (`duck_dive`) ← v4 nerfed
```typescript
// Evades Basic and Status moves only
// Special category moves still connect
if (move.category === 'special') {
  skipEvasionCheck = true; // Special bypasses Duck Dive
}
```

**Wipeout** (`wipeout`) ← v4 nerfed
```typescript
// 65% chance (was 100%)
if (rng() < 0.65) {
  applyStatus(opponent, 'stun', { duration: 1 });
  narrativeOnHit = 'They lost their footing!';
} else {
  narrativeOnHit = 'They kept their balance!';
}
```

---

### Elena Zheng

**Managed Expectations** (`managed_expectations`) ← v4 nerfed
```typescript
// 35% proportional reduction for 2 turns (was flat 25 HP cap)
// In damageCalc when this status is active:
damage = Math.floor(damage * (1 - 0.35));
// No hard cap
```

---

### Ishan Bhaidani

**Closing Argument** (`closing_argument`) ← v4 replaces Strong Case
```typescript
// Moderate-high damage (22–34 range)
// Apply silenced status for 2 turns
// silenced: opponent CANNOT select or use Special move
// If opponent attempts Special while silenced: show "Locked out — no Special available!" 
//   and treat as missed turn
applyStatus(opponent, 'silenced', { duration: 2 });
```

---

### Stef Luthin

**Stitch** (`stitch`) ← v4 buffed
```typescript
// Requires lastOpponentMove to have dealt damage
const lastDamage = opponent.lastMoveDamageDealt ?? 0;
const reflectDamage = Math.floor(lastDamage * 0.45);  // was 0.30
const healAmount = Math.floor(reflectDamage * 0.10);   // new: Stef recovers 10% of reflected

opponent.currentHP -= reflectDamage;
attacker.currentHP = Math.min(attacker.currentHP + healAmount, attacker.maxHP);
```

---

### Victor Huynh

**AI Audit** (`ai_audit`) ← v4 buffed
```typescript
// Always deals HIGH damage (28–42 range) — not conditional on statuses
// Reveal opponent cooldowns to player UI (show CD counts on all opponent moves)
revealOpponentCooldowns(opponent);
// Double duration/value of all active statuses on opponent
opponent.activeStatuses.forEach(s => {
  s.turnsRemaining = Math.min(s.turnsRemaining * 2, 6);
  if (s.sourceValue) s.sourceValue *= 2;
});
```

---

### Amanda Eyer

**Brand Police** (`brand_police`) ← v4 buffed
```typescript
// Deals moderate damage (16–26) PLUS applies brand_violation debuff
// Both resolve — this is not a choice
dealDamage(attacker, opponent, 'moderate', rng);
applyStatus(opponent, 'brand_violation', { duration: 2, atkMod: -0.20 });
```

---

### Cynthia Gentry

**Levelling Up** (Passive — `levelling_up`) ← v4 replaces Brand Voice
```typescript
// Not a selectable move in combat (or greyed out as passive indicator)
// In BattleEngine, at end of each round:
if (cynthia.isActive) cynthia.turnsSurvived++;
if (cynthia.turnsSurvived > 0 && cynthia.turnsSurvived % 5 === 0) {
  cynthia.stats.atk = Math.floor(cynthia.stats.atk * 1.08);
  cynthia.stats.def = Math.floor(cynthia.stats.def * 1.08);
  pushNarration(`Cynthia is getting stronger! +8% ATK and DEF!`);
}
```

---

### Nick Mitchell

**Patience of a Fisherman** (`patience_of_a_fisherman`)
```typescript
// Skip attacker's action this turn
// Set chargingPatience = true on fighter
// In next turn's damage calc:
if (attacker.chargingPatience) {
  dmgMultiplier *= 1.50;
  attacker.chargingPatience = false;
}
```

---

### Arthur Stern

**Venture Capital** (`venture_capital`)
```typescript
// compound_debt: 5% maxHP per turn for 3 turns
// Does not stack — recasting resets timer
```

---

### Tolani Daniel

**Loop** (`loop`)
```typescript
// Does not consume the turn
// Re-apply attacker.lastDefensiveMove at 75% effectiveness
// Effectiveness reduction: damageReductionPercent *= 0.75, shieldHp *= 0.75
// If no lastDefensiveMove, move fails with narration "No defense to loop yet."
```

**Easing Curve** (`easing_curve`)
```typescript
// Turn 1: low damage (8–14)
// Set easing_curve_primed on attacker
// Following turn, at start of resolution: 
//   if easing_curve_primed active, deal doubled low damage (16–28) as bonus
//   clear easing_curve_primed
```

---

### Luke Bateman

**Evergreen** (`evergreen`)
```typescript
// Reduce incoming damage by 25%
// Store 10% of original incoming damage on attacker
// On attacker's next offensive action, add stored value as bonus damage
```

---

### Janelle

**Hit Piece** (`hit_piece`)
```typescript
// Apply hit_piece_blowback status to opponent for 2 turns
// While active: opponent's ATK is boosted (they deal more), but
//   at end of each turn they receive 10% of damage they dealt that turn
opponent.activeStatuses.push({ id: 'hit_piece_blowback', turnsRemaining: 2, sourceValue: 0.10 });
```

---

### Taylor Hadden

**Orlando Magic** (`orlando_magic`)
```typescript
// Random bonus status pool:
const pool: StatusID[] = ['confusion', 'slow', 'burn', 'blind', 'stun', 'paralysis'];
const randomStatus = pool[Math.floor(rng() * pool.length)];
applyStatus(opponent, randomStatus, { duration: 1 });
```

---

## 9. Animation Spec (Web Animations API)

All use `element.animate()`. All return Promises.

```typescript
// Idle
{ keyframes: [{ transform: 'translateY(0px)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0px)' }],
  options: { duration: 1800, iterations: Infinity, easing: 'ease-in-out' } }

// Attack lunge — player
{ keyframes: [{ transform: 'translateX(0px)' }, { transform: 'translateX(80px)' }, { transform: 'translateX(0px)' }],
  options: { duration: 400, easing: 'ease-out' } }

// Hit flash
{ keyframes: [
    { filter: 'brightness(1)', opacity: 1 }, { filter: 'brightness(3)', opacity: 0 },
    { filter: 'brightness(1)', opacity: 1 }, { filter: 'brightness(3)', opacity: 0 },
    { filter: 'brightness(1)', opacity: 1 }
  ], options: { duration: 300 } }

// Faint
{ keyframes: [{ transform: 'translateY(0px)', opacity: 1 }, { transform: 'translateY(60px)', opacity: 0 }],
  options: { duration: 700, fill: 'forwards', easing: 'ease-in' } }

// Screen flash (Special moves + CK campaign_drop outcome)
{ keyframes: [{ opacity: 0 }, { opacity: 0.6 }, { opacity: 0 }],
  options: { duration: 200 } }
```

**Status filters** (apply to `sprite.style.filter`):
```typescript
const STATUS_FILTERS = {
  burn:      'hue-rotate(20deg) saturate(2) brightness(1.1)',
  sleep:     'grayscale(0.7) brightness(0.7)',
  paralysis: 'hue-rotate(50deg) saturate(1.5)',
  confusion: 'hue-rotate(280deg) saturate(1.3)',
  silenced:  'grayscale(0.4) brightness(0.85)',
  in_embargo:'brightness(0.6) contrast(1.2)',
};
```

**Special animation notes:**
- CK Creative Direction → screen flash color varies by outcome: pink (rebrand), red (campaign_drop), purple (mood_board), white (the_pivot)
- CK Slow Burn → `???` badge visible on CK's nameplate until consumed
- Ishan Closing Argument → padlock icon overlay on opponent's Special move slot for duration
- Cynthia Levelling Up → brief gold glow on sprite every 5 turns

---

## 10. Build Phases — Claude Code Prompt Sequence

### Phase B0 — Scaffold & Routing

```
Create the battle module scaffold inside the existing SCRIB3-OS at 
src/modules/battle/.

Set up:
1. index.tsx — exports BattleModule with React Router sub-routes:
   /battle            → redirects to /battle/team-select
   /battle/team-select → <TeamSelectScreen />
   /battle/fight      → <BattleScreen /> (protected — redirect if no team set)

2. Create empty placeholder components for:
   TeamSelectScreen, BattleScreen, BattleScene, TextBox, 
   MoveList, PartyPanel, OpponentNameplate, PlayerNameplate,
   FighterSprite, HPBar, StatusBadge

3. Create battle.tokens.css with the full SCRIB3 battle design token set 
   from Section 4 of this document.

4. Create battleConfig.ts with:
   - ROLE_STAT_TIERS (from Section 5.1)
   - DAMAGE_VALUES including moderate_high tier
   - ACCURACY_BASE, CRIT_CHANCE, CRIT_MULTIPLIER
   - STATUS_DURATION_DEFAULTS

5. Create rng.ts with a seeded Mulberry32 RNG function.

6. Wire /battle route into the existing SCRIB3-OS router.

Do not implement logic yet — structure, types, and empty components only.
```

---

### Phase B1 — Data Layer

```
Implement the data layer for the SCRIB3 battle module.

1. Drop in the provided fighters.ts to src/modules/battle/data/fighters.ts.
   It contains all 29 fighters with full move sets, effects, and stat tiers.
   Verify all fighters are present. Do not modify any move data.

2. Create statusEffects.ts:
   - Full StatusID union type (all IDs used in fighters.ts)
   - StatusDefinition interface: { id, label, badgeText, filter, 
     tickEffect?, speedMod?, accuracyMod?, attackMod?, defenseMod? }
   - STATUS_DEFINITIONS record for all statuses
   - STATUS_BADGE_TEXT: short labels for UI (BRN, SLP, PAR, CNF, SLC etc.)

3. Create BattleFighter interface (src/modules/battle/data/battleTypes.ts):
   Extends Fighter with: currentHP, maxHP, activeStatuses[], moveCooldowns,
   isFainted, isActive, lastMove, lastDefensiveMove, turnsSurvived,
   chargingPatience, slowBurnMultiplier, longGameStoredDamage,
   evergreenStoredDamage, embargoUseCount

4. Create initBattleFighter(fighter: Fighter): BattleFighter function
   that assigns stats from ROLE_STAT_TIERS based on the fighter's stat tier,
   sets all cooldowns to 0, activeStatuses to [], all flags to defaults.

5. Write unit tests for initBattleFighter covering 3 fighters across 
   different stat tiers (Founder, Manager, Specialist).
```

---

### Phase B2 — Battle Engine

```
Implement the core battle engine at src/modules/battle/engine/.
Reference Section 8 of this document for ALL fighter-specific mechanics.

1. damageCalc.ts — calculateDamage(attacker, defender, move, rng): DamageResult
   - Full formula from Section 6.2
   - Handle: miss, crit, damage reduction, defensive buff bypass (All Hands)
   - Handle: bypassCounters flag (Off-Piste v4 — skips reflection checks only)
   - Handle: Elena Managed Expectations (35% proportional reduction, NOT flat cap)
   - Handle: CK Slow Burn multiplier (consume token on next attack)
   - Handle: Nick Patience of a Fisherman (×1.5 multiplier on charged turn)
   - Return: { damage, isCrit, missed, effectiveness }

2. StatusEngine.ts:
   - applyStatus(fighter, statusId, options): BattleFighter
   - tickStatuses(fighter): { updatedFighter, tickMessages: string[] }
   - clearStatus / clearOneDebuff / clearAllDebuffs
   - getEffectiveStats(fighter): { atk, def, spd, acc } with all mods applied
   - Special tick handlers:
     * compound_debt: 5% per tick
     * scandal/rumour: 8% per tick
     * paper_cut: 5% per tick
     * hit_piece_blowback: at end of turn, opponent takes 10% of dmg dealt
     * long_game_stored: on attacker next turn, deal 50% stored
     * levelling_up: passive — check turnsSurvived % 5 in BattleEngine, not here

3. CooldownTracker.ts:
   - decrementCooldowns(fighter): BattleFighter
   - isOnCooldown(fighter, moveId): boolean
   - setCooldown(fighter, moveId, turns): BattleFighter

4. BattleEngine.ts — turn resolver:
   - resolveMove(attacker, defender, move, rng): TurnResult
     Handles ALL special mechanics from Section 8
   - resolveRound(player, opponent, playerMove, opponentMove, rng): RoundResult
     Full turn order, both moves, status ticks, faint detection
   - At end of round: if Cynthia is active, increment turnsSurvived,
     apply Levelling Up buff every 5 turns
   - generateNarration(turnResult): string[]

5. AIOpponent.ts:
   - Tier 1: selectMove(fighter, opponent): Move
   - Implement 40/30/15/15 weighted selection from Section 6.4
   - CK override: always select Creative Direction if available + not on CD
```

---

### Phase B3 — Zustand Stores

```
Implement the two Zustand stores for the battle module.

1. teamSelectStore.ts:
   { roster: Fighter[], playerTeam: Fighter[], opponentTeam: Fighter[] }
   Actions: addToTeam, removeFromTeam, reorderTeam, 
            generateOpponentTeam('easy'|'normal'|'hard'), confirmTeams
   
   generateOpponentTeam:
   - easy: 3 random fighters
   - normal: 6 random fighters  
   - hard: counter-pick based on player team roles

2. battleStore.ts (full state from Section 6.1):
   Actions: initBattle, selectMove, advanceText, switchFighter,
            triggerFaint, flee (50% success)
   
   Wire BattleEngine.resolveRound into selectMove.
   All RNG seeded at battle init with Date.now().
   
   initBattle converts Fighter[] → BattleFighter[] via initBattleFighter().
```

---

### Phase B4 — Battle Scene UI

```
Build the BattleScene visual layer — purely presentational, reads from battleStore.

Gen 4 DS layout. SCRIB3 skin: dark arena, pink accents, 
Space Mono for numbers, OwnersWide for names.
Tech-brutalist aesthetic — no natural environments.

1. BattleScene.tsx + .module.css
   CSS Grid 62%/38% split. Arena background: dark gradient + CSS grid at 4% opacity.

2. Platform.tsx — elliptical shadow beneath each sprite.

3. FighterSprite.tsx
   - src from /public/sprites/{back|front}/{fighter.id}-front.png
     (back view for player, front view for opponent)
   - Note kevin-a and kevin-m naming exceptions
   - Falls back to pixel-art silhouette SVG (using roleColor) on 404
   - image-rendering: pixelated
   - Idle bob animation on PLAYER_TURN phase
   - Exports ref for Web Animations API

4. OpponentNameplate.tsx — top-left: name, level, HP bar, StatusBadge
   Authentic DS style: no HP numbers on opponent nameplate.

5. PlayerNameplate.tsx — bottom-right: name, level, HP bar WITH numbers,
   thin EXP bar, StatusBadge

6. HPBar.tsx — animated width 800ms, colour thresholds, "HP" label in Space Mono.

7. StatusBadge.tsx — pill badge: BRN/SLP/PAR/CNF/SLC/EMB etc.
   Add: SLC (silenced) badge for Ishan's Closing Argument effect.
   Add: ??? badge for CK's Slow Burn token active on CK's nameplate.
```

---

### Phase B5 — Battle Menu & Text Box

```
Build the interactive battle menu and text box components.

1. TextBox.tsx — typewriter 30ms/char, ▼ blink, spacebar/click to advance.
   useTypewriter hook with fast mode option (5ms).

2. BattleMenu.tsx — FIGHT | PARTY | RUN.

3. MoveList.tsx — vertical list of all 5 moves:
   - Category badge (SPECIAL/BASIC/STATUS) colour-coded per design tokens
   - Damage dots ●●●○
   - CD: N indicator if on cooldown
   - Special handling: if fighter is CK, show ??? on Slow Burn slot when token active
   - Greyed out + "SILENCED" label on Special slot if opponent is silenced
   - Greyed out if fighter has in_embargo or calendar_blocked status

4. PartyPanel.tsx — up to 6 slots, fainted slots greyed, active fighter highlighted.
   Block switching if fighter has contractual status.

5. useTypewriter hook and useAnimations hook stubs (full animations in B6).
```

---

### Phase B6 — Animations

```
Implement all Web Animations API battle animations.
All from Section 9 of this document. All return Promises.

useAnimations.ts hook:
  playAttackAnimation(side), playHitAnimation(side), 
  playFaintAnimation(side), playScreenFlash(color),
  playStatusAnimation(side, statusId), playIntroAnimation(),
  playEnterAnimation(side)

Special cases:
- CK Creative Direction: screen flash color by outcome 
  (pink/red/purple/white for rebrand/campaign_drop/mood_board/the_pivot)
- CK Slow Burn: show ??? badge on nameplate, remove on consumption
- Ishan Closing Argument: padlock icon overlay on opponent Special slot
- Cynthia Levelling Up: gold glow every 5 turns

Status persistent filters on sprite.style.filter per STATUS_FILTERS map in Section 9.
```

---

### Phase B7 — Team Selection Screen

```
Build the TeamSelectScreen — pre-battle fighter picker.

Layout:
- Header: "SELECT YOUR TEAM" in OwnersWide, pink
- Scrollable grid: all 29 FighterCards (4 columns)
- Bottom dock: 6 TeamSlots + Confirm

FighterCard.tsx:
- Fighter initials avatar (circular, role colour border)
- Name (OwnersWide), role text (Space Mono, muted)
- Role colour stripe on card edge
- Stat preview bars: HP / ATK / DEF / SPD
- Selected state: pink glow, order number 1–6 in top-right
- Slot 1 labelled "LEAD"

Controls:
- RANDOM TEAM button
- Difficulty selector: EASY | NORMAL | HARD
- Confirm disabled until at least 1 fighter selected

On Confirm: generateOpponentTeam(difficulty), navigate to /battle/fight.
```

---

### Phase B8 — End States & Polish

```
1. VictoryScreen.tsx — "VICTORY", stats, CTAs, CSS particle effect.
2. DefeatScreen.tsx — "DEFEATED", stats, CTAs.
3. FighterFaint.tsx — faint animation wrapper.

4. Polish:
   - Keyboard nav: 1–5 keys for move selection
   - Battle speed toggle: Normal / Fast
   - Sprite loading placeholder (role-coloured silhouette)
   - Sound effect placeholders (empty Audio() calls)
   - Mobile responsive: stacked layout at < 640px

5. SCRIB3-OS integration:
   - Add BATTLE to DeviceShell nav
   - Wire into existing OS background/shell

6. README.md for battle module:
   - Sprite naming convention (firstname-front.png, firstname-back.png,
     with kevin-a / kevin-m exceptions)
   - How to add new fighters
   - How to modify moves
   - Balance notes
```

---

## 11. Phase Execution Order

```
B0 → B1 → B2 → B3 → B4 → B5 → B6 → B7 → B8
```

After B3: battle logic fully testable in isolation.  
After B5: unanimated but playable battle works end-to-end.  
After B6: feels like a real game.

---

## 12. Known Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| CK Creative Direction "The Pivot" edge cases (no buffs to swap) | Medium | Guard: if no active buffs/debuffs on either side, reroll outcome once; if still the_pivot, treat as no-op + narration |
| Tolani Loop with no lastDefensiveMove | Medium | Guard: if null, narrate "No defense to loop yet." and skip |
| Cynthia Levelling Up passive in long fights becomes too strong | Low | Cap at 3 applications (max +24% ATK/DEF from passive) |
| Matt Under Embargo consecutive use tracking across rounds | Medium | Track embargoUseCount and lastEmbargoRound on BattleFighter; reset if non-consecutive |
| CK Slow Burn token persisting across fighter switch | Low | Clear slowBurnMultiplier on fighter switch event in battleStore |
| Stef Stitch with no last opponent attack (first turn) | Medium | Guard: if lastMoveDamageDealt === 0, deal low damage instead, narrate "Nothing to stitch yet." |
| CSS Module conflicts with SCRIB3-OS base styles | Medium | Prefix all battle classes with `battle-` |
| Web Animations API chaining race conditions | Medium | All animations return Promises; use async/await throughout |
| OwnersWide font not loading in standalone battle route | Low | Import font at module root level, not OS root only |

---

## 13. V2 Backlog

- Two-player mode
- Persistent battle history in Supabase
- Fighter leaderboard on OS dashboard
- Full AI Tier 2 (personality-aware)
- Per-move particle effect overlays
- Battle replay system
- Sound effects + battle music
- Type advantages by role
- Tournament bracket mode

---

*fighters.ts is provided in the package — drop directly into src/modules/battle/data/fighters.ts*  
*PDF reference: scrib3_battle_directory_v4.pdf*  
*SCRIB3-OS repo: Kaiby-o/SCRIB3-OS*
