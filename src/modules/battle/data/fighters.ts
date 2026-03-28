// ─────────────────────────────────────────────────────────────────────────────
// fighters.ts  ·  SCRIB3 Battle Simulator  ·  v4.0 (Balance Update)
// Drop into: src/modules/battle/data/fighters.ts
// ─────────────────────────────────────────────────────────────────────────────

// ── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

export type MoveCategory = 'special' | 'basic' | 'defensive';
export type DamageLevel  = 'none' | 'low' | 'moderate' | 'moderate_high' | 'high';
export type RoleColor    = 'founder' | 'creative' | 'strategy' | 'pr' | 'social' | 'ops' | 'digital';

export type StatusID =
  | 'burn'
  | 'bleed'
  | 'sleep'
  | 'paralysis'
  | 'confusion'
  | 'blind'
  | 'slow'
  | 'stun'
  | 'silenced'            // cannot use Special move
  | 'compound_debt'       // 5% HP/turn × 3 (Arthur)
  | 'scandal'             // 8%/turn × 2 (Madisen)
  | 'rumour'              // 8%/turn × 3 (Janelle)
  | 'probation'           // -20% ATK × 3 turns (Haley)
  | 'exposed'             // next defensive 50% less effective (Nick)
  | 'press_scrutiny'      // -DEF × 2 turns (Matt)
  | 'revision'            // must repeat last move (Ben)
  | 'humiliation'         // -DEF × 2 turns (Jenny)
  | 'network_congestion'  // -20% SPD × 2 turns (Omar)
  | 'brand_violation'     // -ATK × 2 turns (Amanda)
  | 'overwhelmed'         // -25% SPD × 2 turns (Camila)
  | 'demoralised'         // -15% ATK (Kevin M)
  | 'community_notes'     // -25% next attack (Jake)
  | 'contractual'         // cannot flee/switch × 2 turns (Ishan)
  | 'system_error'        // random debuff each turn × 2 (Victor)
  | 'paper_cut'           // 5%/turn × 3 (Cynthia)
  | 'discoverability'     // defensive 20% less effective (Luke)
  | 'archive_scrutiny'    // -DEF (Hugh)
  | 'kerning_trauma'      // slow (Amanda)
  | 'reputational'        // -DEF × 2 (Samantha)
  | 'disorientated'       // 1 turn accuracy drop (Taylor)
  | 'calendar_blocked'    // cannot act, passive damage (Camila special)
  | 'in_embargo'          // locked out all moves 1 turn (Matt special)
  | 'slow_burn_token'     // CK's charged multiplier ×1.2–2.0
  | 'long_game_stored'    // CK storing damage to return next turn
  | 'evergreen_stored'    // Luke storing 10% damage to return
  | 'easing_curve_primed' // Tolani doubling hit next turn
  | 'morning_drop_primed' // Jake stacking +15%/turn
  | 'presence_flag'       // Samantha 5%/turn × 3
  | 'scope_creep'         // Elena compounding +10%/turn × 3
  | 'hit_piece_blowback'  // opponent gets 10% of dmg they deal × 2 (Janelle)
  | 'open_door_shield'    // Haley shield absorbing next 20 HP
  | 'levelling_up'        // Cynthia passive — tracked by turn count
  | 'atk_up'              // generic ATK buff
  | 'def_up';             // generic DEF buff

export interface MoveEffect {
  // Status to apply to opponent
  applyStatus?: StatusID;
  statusDuration?: number;           // turns
  statusValue?: number;              // e.g. % for DoT, % for stat change

  // Status to apply to self
  applySelfStatus?: StatusID;
  selfStatusDuration?: number;
  selfStatusValue?: number;

  // Stat changes
  opponentAtkMod?: number;           // e.g. -0.20 = -20% ATK
  opponentDefMod?: number;
  opponentSpdMod?: number;
  opponentAccMod?: number;           // accuracy change

  // Healing / self recovery
  selfHealPercent?: number;          // % of max HP

  // Special flags
  bypassCounters?: boolean;          // Off-Piste: ignores reflection/redirect
  bypassDefensiveBuffs?: boolean;    // All Hands: ignores stat buff reductions
  evadeNextMove?: boolean;           // full evasion this turn
  evadeBasicStatus?: boolean;        // Duck Dive (v4): evades Basic/Status only
  evadeChance?: number;              // Read the Room: % dodge boost
  delayOpponentMove?: number;        // turns delayed
  cooldown?: number;                 // overrides move-level cooldown (legacy)
  triggerChance?: number;            // 0–1, probability for proc effects

  // Drain / transfer
  drainPercent?: number;             // Haley: % drained from opponent per tick
  drainReturnPercent?: number;       // Haley: % of drained amount returned to self

  // Reflect / counter
  reflectPercent?: number;           // Stitch: % of last hit reflected back
  reflectHealPercent?: number;       // Stitch (v4): % of reflected dmg healed

  // Charge / token
  chargeMultiplierMin?: number;      // Slow Burn min multiplier
  chargeMultiplierMax?: number;      // Slow Burn max multiplier

  // Block / absorb
  damageReductionPercent?: number;   // e.g. 0.35 = 35% reduction
  shieldHp?: number;                 // flat HP shield (Open Door Policy)
  incomingDamageCap?: number;        // REMOVED v4 — Elena now uses % reduction

  // Return damage
  returnDamagePercent?: number;      // Long Game / Evergreen: return X% next turn

  // Scope Creep / compounding
  compoundPercent?: number;          // +N% per subsequent turn
  compoundTurns?: number;

  // Creative Direction specific
  creativeDirectionOutcomes?: CreativeDirectionOutcome[];

  // Cooldown reveal (Victor AI Audit v4)
  revealCooldowns?: boolean;

  // Ishan silenced
  silenceSpecialTurns?: number;

  // Matt Under Embargo consecutive-use flag
  embargoConsecutiveConvert?: boolean;

  // Misc
  clearOwnDebuffs?: boolean;
  clearOneDebuff?: boolean;
  clearOwnStatuses?: boolean;
  resetOwnSpeed?: boolean;
  immuneToDoT?: boolean;             // Cold Wallet
  immuneToDebuffs?: boolean;         // Asset Lock
  immuneToInfoExtract?: boolean;     // Source Protection
}

export interface CreativeDirectionOutcome {
  id: 'rebrand' | 'campaign_drop' | 'mood_board' | 'the_pivot';
  weight: number; // 0.25 each
  description: string;
}

export interface Move {
  id: string;
  name: string;
  description: string;
  category: MoveCategory;
  damage: DamageLevel;
  cooldown: number;           // turns before reuse; 0 = no cooldown
  effect: MoveEffect;
  narrativeOnUse?: string;    // text box message override
  narrativeOnHit?: string;
}

export interface FighterStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface Fighter {
  id: string;                 // matches sprite filename prefix
  name: string;
  role: string;
  email: string;
  timezone: string;
  roleColor: RoleColor;
  stats: FighterStats;
  moves: Move[];              // index 0 = Special, 1–2 = Basic, 3–4 = Defensive
}

// ── STAT TIERS ───────────────────────────────────────────────────────────────

const STATS: Record<string, FighterStats> = {
  FOUNDER:   { hp: 240, atk: 85,  def: 80,  spd: 70  },
  VP:        { hp: 220, atk: 90,  def: 75,  spd: 75  },
  CCO:       { hp: 230, atk: 88,  def: 78,  spd: 73  },
  DIRECTOR:  { hp: 200, atk: 85,  def: 70,  spd: 80  },
  SENIOR:    { hp: 190, atk: 80,  def: 65,  spd: 85  },
  MANAGER:   { hp: 180, atk: 78,  def: 60,  spd: 88  },
  SPECIALIST:{ hp: 170, atk: 82,  def: 55,  spd: 90  },
  // CK custom — high variance, below-average def
  ADVISOR:   { hp: 195, atk: 88,  def: 58,  spd: 84  },
};

// ── FIGHTERS ─────────────────────────────────────────────────────────────────

export const fighters: Fighter[] = [

  // ── 01 JB ──────────────────────────────────────────────────────────────────
  {
    id: 'jb',
    name: 'JB',
    role: 'Head Chef & Dishwasher',
    email: 'JB@scrib3.co',
    timezone: 'America/Cancun',
    roleColor: 'founder',
    stats: STATS.FOUNDER,
    moves: [
      {
        id: 'cone_of_shame',
        name: 'Cone of Shame',
        description: 'JB unleashes a volley of heavy traffic cones with the full force of executive frustration. High damage, speed reduction.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentSpdMod: -0.30 },
      },
      {
        id: 'mise_en_place',
        name: 'Mise en Place',
        description: 'JB hurls a fully prepped chef\'s tray — chopped ingredients, sharp implements, hot oil — in a single arc. Moderate damage, chance to apply burn for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'burn', statusDuration: 2, triggerChance: 0.40 },
      },
      {
        id: 'dish_of_the_day',
        name: 'Dish of the Day',
        description: 'JB slams a scalding serving dish directly into the opponent\'s face. Moderate damage, blinding effect for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'blind', statusDuration: 1 },
      },
      {
        id: 'founders_prerogative',
        name: 'Founder\'s Prerogative',
        description: 'JB invokes executive authority and simply refuses to take full damage. Reduces all incoming damage by 40% for 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { applySelfStatus: 'def_up', selfStatusDuration: 2, damageReductionPercent: 0.40 },
      },
      {
        id: 'clean_plate_club',
        name: 'Clean Plate Club',
        description: 'JB resets the board. Clears all negative status effects and recovers a small amount of health.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { clearOwnDebuffs: true, selfHealPercent: 0.10 },
      },
    ],
  },

  // ── 02 ROSS ────────────────────────────────────────────────────────────────
  {
    id: 'ross',
    name: 'Ross Booth',
    role: 'Co-Founder',
    email: 'ross@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'founder',
    stats: STATS.FOUNDER,
    moves: [
      {
        id: 'surf',
        name: 'Surf',
        description: 'Ross catches a massive wave and rides it directly into his opponent at full speed. High damage, attack reduction.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentAtkMod: -0.20 },
      },
      {
        id: 'hang_ten',
        name: 'Hang Ten',
        description: 'Ross clips the opponent at the ankles sending them tumbling. Moderate damage, knockback reduces opponent speed.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentSpdMod: -0.20, statusDuration: 2 },
      },
      {
        id: 'wipeout',
        // v4 NERF: 65% chance, was guaranteed
        name: 'Wipeout',
        description: 'Ross triggers a brutal wipeout beneath the opponent. Moderate damage. 65% chance the opponent misses their next attack.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'stun', statusDuration: 1, triggerChance: 0.65 },
        narrativeOnHit: 'The wipeout caught them — they\'re off balance!',
      },
      {
        id: 'duck_dive',
        // v4 NERF: evades Basic/Status only — Special moves still connect
        name: 'Duck Dive',
        description: 'Ross dives cleanly beneath the incoming attack. Evades one Basic or Status move entirely. Special moves still connect. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeBasicStatus: true },
      },
      {
        id: 'read_the_room',
        name: 'Read the Room',
        description: 'Ross scans the horizon and anticipates the set. Increases dodge chance by 30% for 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { evadeChance: 0.30, selfStatusDuration: 2 },
      },
    ],
  },

  // ── 03 ARTHUR ──────────────────────────────────────────────────────────────
  {
    id: 'arthur',
    name: 'Arthur Stern',
    role: 'Co-Founder',
    email: 'arthur@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'founder',
    stats: STATS.FOUNDER,
    moves: [
      {
        id: 'next_steps',
        name: 'Next Steps',
        description: 'Arthur identifies the single most critical structural weakness and drops a full flight of concrete steps onto the opponent. High damage, speed reduction.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentSpdMod: -0.25, statusDuration: 2 },
      },
      {
        id: 'pitch_deck',
        name: 'Pitch Deck',
        description: 'Arthur launches a high-velocity barrage of slide decks. Moderate damage, causes confusion as they try to follow the narrative arc.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'confusion', statusDuration: 1 },
      },
      {
        id: 'venture_capital',
        name: 'Venture Capital',
        description: 'Arthur floods the opponent with resources and pressure simultaneously. Moderate damage, applies compound debt dealing 5% damage per turn for 3 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 2,
        effect: { applyStatus: 'compound_debt', statusDuration: 3, statusValue: 0.05 },
      },
      {
        id: 'runway_extension',
        name: 'Runway Extension',
        description: 'Arthur buys himself critical time. All negative status effects on him are delayed by 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { applySelfStatus: 'def_up', selfStatusDuration: 2 }, // Engine: delays own status ticks
      },
      {
        id: 'pivot',
        name: 'Pivot',
        description: 'Arthur completely reframes the battle. Resets his own stats to baseline and removes all active debuffs.',
        category: 'defensive',
        damage: 'none',
        cooldown: 5,
        effect: { clearOwnDebuffs: true, clearOwnStatuses: true, resetOwnSpeed: true },
      },
    ],
  },

  // ── 04 ISHAN ───────────────────────────────────────────────────────────────
  {
    id: 'ishan',
    name: 'Ishan Bhaidani',
    role: 'Co-Founder',
    email: 'ishan@scrib3.co',
    timezone: 'America/Chicago',
    roleColor: 'founder',
    stats: STATS.FOUNDER,
    moves: [
      {
        id: 'closing_argument',
        // v4: REPLACES Strong Case
        name: 'Closing Argument',
        description: 'Ishan delivers the final, irrefutable point — measured, devastating, and perfectly timed. Moderate-high damage. Opponent\'s Special move is silenced for 2 turns.',
        category: 'special',
        damage: 'moderate_high',
        cooldown: 3,
        effect: { applyStatus: 'silenced', statusDuration: 2, silenceSpecialTurns: 2 },
        narrativeOnHit: 'The opponent has no response. Their Special is locked!',
      },
      {
        id: 'houston_we_have_a_problem',
        name: 'Houston, We Have a Problem',
        description: 'Ishan identifies a critical flaw in the opponent\'s approach. Moderate damage, reduces opponent\'s defense by 20%.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentDefMod: -0.20, statusDuration: 2 },
      },
      {
        id: 'texas_handshake',
        // v4 BUFF: upgraded to High damage
        name: 'Texas Handshake',
        description: 'Ishan forces a closing blow the opponent cannot refuse. High damage. Applies a contractual obligation status preventing fleeing or switching for 2 turns.',
        category: 'basic',
        damage: 'high',
        cooldown: 2,
        effect: { applyStatus: 'contractual', statusDuration: 2 },
      },
      {
        id: 'non_disclosure',
        name: 'Non-Disclosure',
        description: 'Ishan seals all information about his next move. Opponent cannot predict or counter it. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { immuneToInfoExtract: true }, // Engine: next move bypasses Fog of War / accuracy penalties
      },
      {
        id: 'due_diligence',
        name: 'Due Diligence',
        description: 'Ishan audits the incoming damage before it lands. Reduces the next hit by 35%.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.35 },
      },
    ],
  },

  // ── 05 BEN ─────────────────────────────────────────────────────────────────
  {
    id: 'ben',
    name: 'Ben Lydiat',
    role: 'VP of Creative',
    email: 'Ben.lydiat@scrib3.co',
    timezone: 'Europe/London',
    roleColor: 'creative',
    stats: STATS.VP,
    moves: [
      {
        id: 'overkill',
        name: 'Overkill',
        description: 'Ben arrives with towering stacks of paper. The opponent is crushed under the sheer volume of output. High damage, reduced attack.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentAtkMod: -0.20, statusDuration: 2 },
      },
      {
        id: 'mood_board',
        name: 'Mood Board',
        description: 'Ben pelts the opponent with 47 visual references, none of which individually land, but all of which sting. Moderate damage, accuracy drops 15% for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentAccMod: -0.15, statusDuration: 2 },
      },
      {
        id: 'red_pen',
        name: 'Red Pen',
        description: 'Ben marks up the opponent with brutal editorial precision. Moderate damage, applies revision status — opponent must repeat their last move before using a new one.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 2,
        effect: { applyStatus: 'revision', statusDuration: 2 },
      },
      {
        id: 'version_control',
        name: 'Version Control',
        description: 'Ben rolls back to a previous, undamaged state. Heals 20% of max health. Cooldown: 4 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { selfHealPercent: 0.20 },
      },
      {
        id: 'brief_blocker',
        name: 'Brief Blocker',
        description: 'Ben interposes a dense creative brief between himself and the incoming attack. Reduces damage by 30% for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.30 },
      },
    ],
  },

  // ── 06 NICK ────────────────────────────────────────────────────────────────
  {
    id: 'nick',
    name: 'Nick Mitchell',
    role: 'VP of Strategy',
    email: 'nick@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'strategy',
    stats: STATS.VP,
    moves: [
      {
        id: 'catch_of_the_day',
        name: 'Catch of the Day',
        description: 'Nick hooks the opponent clean through, then slaps them repeatedly with a large, cold fish. High damage, reduced speed.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentSpdMod: -0.25, statusDuration: 2 },
      },
      {
        id: 'competitive_analysis',
        name: 'Competitive Analysis',
        description: 'Nick dissects every move and counters with quiet precision. Moderate damage, exposed status — opponent\'s next defensive move is 50% less effective.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'exposed', statusDuration: 1 },
      },
      {
        id: 'tight_lines',
        name: 'Tight Lines',
        description: 'Nick hooks the opponent and reels them in close. Moderate damage, prevents retreating or distance-based moves for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'contractual', statusDuration: 1 },
      },
      {
        id: 'patience_of_a_fisherman',
        name: 'Patience of a Fisherman',
        description: 'Nick waits. Nothing happens this turn. His next attack deals 50% increased damage.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        // Engine: sets chargingPatience = true; next attack resolves with ×1.5 dmgMultiplier
        effect: { applySelfStatus: 'atk_up', selfStatusDuration: 1, selfStatusValue: 0.50 },
        narrativeOnUse: 'Nick waits patiently... Something is coming.',
      },
      {
        id: 'fog_of_war',
        name: 'Fog of War',
        description: 'Nick shrouds his intentions in strategic ambiguity. Opponent\'s accuracy drops 25% for 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { opponentAccMod: -0.25, statusDuration: 2 },
      },
    ],
  },

  // ── 07 SIXTYNE ─────────────────────────────────────────────────────────────
  {
    id: 'sixtyne',
    name: 'Sixtyne',
    role: 'Chief Creative Officer',
    email: 'sixtyne@scrib3.co',
    timezone: 'Europe/Brussels',
    roleColor: 'creative',
    stats: STATS.CCO,
    moves: [
      {
        id: 'french_press',
        name: 'French Press',
        description: 'Sixtyne places the opponent inside a full-sized French press and presses the plunger with measured, deliberate force. High damage, opponent unable to move for up to 2 turns.',
        category: 'special',
        damage: 'high',
        cooldown: 4,
        effect: { applyStatus: 'in_embargo', statusDuration: 2 },
        narrativeOnHit: 'The opponent is completely immobilised!',
      },
      {
        id: 'art_direction',
        name: 'Art Direction',
        description: 'Sixtyne dictates the entire visual language of the battle. Moderate damage, forces the opponent into an unfamiliar style — speed reduced for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentSpdMod: -0.25, statusDuration: 2 },
      },
      {
        id: 'croissant_flake',
        name: 'Croissant Flake',
        description: 'Sixtyne launches a perfectly laminated, dangerously sharp croissant like a disc. Moderate damage, chance to apply bleed for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'bleed', statusDuration: 2, statusValue: 0.06, triggerChance: 0.45 },
      },
      {
        id: 'revision_round',
        name: 'Revision Round',
        description: 'Sixtyne redirects the incoming attack back into development. Attack is delayed by 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { delayOpponentMove: 1 },
      },
      {
        id: 'bon_vivant',
        name: 'Bon Vivant',
        description: 'Sixtyne radiates effortless composure. Reduces all incoming damage by 25% for 2 turns and grants small health regen.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { damageReductionPercent: 0.25, selfStatusDuration: 2, selfHealPercent: 0.05 },
      },
    ],
  },

  // ── 08 ELENA ───────────────────────────────────────────────────────────────
  {
    id: 'elena',
    name: 'Elena Zheng',
    role: 'VP of Accounts',
    email: 'elena@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'strategy',
    stats: STATS.VP,
    moves: [
      {
        id: 'major_psychology',
        name: 'Major Psychology',
        description: 'Elena delivers a devastating psychic blast that reorders the opponent\'s thinking entirely. High damage, deep confusion.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { applyStatus: 'confusion', statusDuration: 2 },
      },
      {
        id: 'account_review',
        name: 'Account Review',
        description: 'Elena tables a mid-battle performance review at the worst possible moment. Moderate damage, reduces opponent\'s attack and speed.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentAtkMod: -0.15, opponentSpdMod: -0.15, statusDuration: 2 },
      },
      {
        id: 'scope_creep',
        name: 'Scope Creep',
        description: 'Elena quietly expands her attack far beyond what was agreed. Moderate damage, compounds by 10% each turn for 3 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 2,
        effect: { applyStatus: 'scope_creep', statusDuration: 3, compoundPercent: 0.10, compoundTurns: 3 },
      },
      {
        id: 'managed_expectations',
        // v4 NERF: 35% proportional reduction, was flat 25 HP cap
        name: 'Managed Expectations',
        description: 'Elena sets clear limits on what she\'s willing to absorb. Reduces all incoming damage by 35% for 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { damageReductionPercent: 0.35, selfStatusDuration: 2 },
      },
      {
        id: 'strategic_patience',
        name: 'Strategic Patience',
        description: 'Elena holds and recovers. Heals 15% HP over 2 turns and clears one active debuff.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { selfHealPercent: 0.15, clearOneDebuff: true },
      },
    ],
  },

  // ── 09 JANELLE ─────────────────────────────────────────────────────────────
  {
    id: 'janelle',
    name: 'Janelle',
    role: 'VP of PR',
    email: 'janelle@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'pr',
    stats: STATS.VP,
    moves: [
      {
        id: 'hit_piece',
        name: 'Hit Piece',
        description: 'Janelle publishes the most vicious piece about the opponent imaginable. High damage. Opponent\'s attack heightened but they receive 10% of damage they inflict back for 2 turns.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { applyStatus: 'hit_piece_blowback', statusDuration: 2, statusValue: 0.10 },
        narrativeOnHit: 'The piece is live! They\'re stronger but it\'s costing them!',
      },
      {
        id: 'deep_throat',
        name: 'Deep Throat',
        description: 'Janelle passes damaging information to a trusted journalist. Moderate damage, applies a rumour status — 8% damage per turn for 3 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'rumour', statusDuration: 3, statusValue: 0.08 },
      },
      {
        id: 'the_ram',
        name: 'The Ram',
        description: 'Janelle channels pure Rams energy and charges head-on with zero hesitation. High damage, knockback.',
        category: 'basic',
        damage: 'high',
        cooldown: 2,
        effect: { opponentSpdMod: -0.15 },
      },
      {
        id: 'no_comment',
        name: 'No Comment',
        description: 'Janelle refuses to engage with any incoming attack. Evades one move entirely. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
      {
        id: 'spin_cycle',
        name: 'Spin Cycle',
        description: 'Janelle reframes all recent damage as a positive development. Converts 20% of damage received this turn into health.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        // Engine: on damage received this turn, heal 20% of that value
        effect: { returnDamagePercent: 0.20, applySelfStatus: 'def_up', selfStatusDuration: 1 },
      },
    ],
  },

  // ── 10 MATTHEW BRANNON ─────────────────────────────────────────────────────
  {
    id: 'matt',
    name: 'Matthew Brannon',
    role: 'VP PR',
    email: 'matthew.brannon@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'pr',
    stats: STATS.VP,
    moves: [
      {
        id: 'under_embargo',
        // v4 NERF: 1 turn lockout (was 2), CD 3 (was 2), 2nd consecutive use = press_scrutiny
        name: 'Under Embargo',
        description: 'Matt issues a full embargo on the opponent\'s ability to act. Locked out of all moves for 1 turn. A second consecutive use applies press scrutiny instead of a repeat lockout. Cooldown: 3 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'in_embargo', statusDuration: 1, embargoConsecutiveConvert: true },
        narrativeOnHit: 'The opponent is under embargo — they can\'t act!',
      },
      {
        id: 'exclusive',
        name: 'Exclusive',
        description: 'Matt offers a damaging exclusive story to the most dangerous journalist in the room. Moderate damage, press scrutiny reduces opponent\'s defense for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'press_scrutiny', statusDuration: 2, opponentDefMod: -0.20 },
      },
      {
        id: 'wire_release',
        name: 'Wire Release',
        description: 'Matt blasts devastating allegations timed perfectly at market open. Moderate damage, confusion for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'confusion', statusDuration: 1 },
      },
      {
        id: 'off_the_record',
        // v4 NERF: 60% damage reduction (was full invincibility)
        name: 'Off the Record',
        description: 'Matt goes completely dark. All incoming damage this turn is reduced by 60%. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { damageReductionPercent: 0.60 },
      },
      {
        id: 'holding_statement',
        name: 'Holding Statement',
        description: 'Matt absorbs the attack with a carefully crafted non-answer. Reduces incoming damage by 35% and buys 1 turn to reposition.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.35 },
      },
    ],
  },

  // ── 11 HALEY ───────────────────────────────────────────────────────────────
  {
    id: 'haley',
    name: 'Haley Stewart Torculas',
    role: 'Head of People & Operations',
    email: 'haley@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'ops',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'calming_presence',
        // v4 NERF: 2 turns sleep (was 3), 5% drain (was 8%), 50% return (was 100%)
        name: 'Calming Presence',
        description: 'Haley radiates such genuine warmth that the opponent simply stops. While they\'re asleep, she quietly drains their health. Opponent sleeps 2 turns, drained 5% HP per turn. Haley recovers 50% of the drained amount.',
        category: 'special',
        damage: 'none',
        cooldown: 4,
        effect: {
          applyStatus: 'sleep',
          statusDuration: 2,
          drainPercent: 0.05,
          drainReturnPercent: 0.50,
        },
        narrativeOnHit: 'The opponent drifts off... Haley is recovering!',
      },
      {
        id: 'performance_improvement_plan',
        name: 'Performance Improvement Plan',
        description: 'Haley places the opponent on a formal PIP. Moderate damage, probationary status reduces attack by 20% for 3 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'probation', statusDuration: 3, opponentAtkMod: -0.20 },
      },
      {
        id: 'culture_amp_shock',
        name: 'Culture Amp Shock',
        description: '360-degree feedback blast from every direction. Moderate damage, confusion for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'confusion', statusDuration: 1 },
      },
      {
        id: 'open_door_policy',
        name: 'Open Door Policy',
        description: 'Haley redirects the opponent\'s aggression into a productive conversation. Incoming damage becomes a shield absorbing the next 20 HP.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { applyStatus: 'open_door_shield', shieldHp: 20 },
      },
      {
        id: 'wellness_check',
        name: 'Wellness Check',
        description: 'Haley activates full wellbeing protocols. Heals 25% max HP and removes all stress-related debuffs.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { selfHealPercent: 0.25, clearOwnDebuffs: true },
      },
    ],
  },

  // ── 12 CAMILA ──────────────────────────────────────────────────────────────
  {
    id: 'camila',
    name: 'Camila',
    role: 'Operations',
    email: 'camila@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'ops',
    stats: STATS.MANAGER,
    moves: [
      {
        id: 'calendar_blocked',
        name: 'Calendar Blocked',
        description: 'Camila fills every slot in the opponent\'s schedule with back-to-back mandatory meetings. Opponent cannot act for 2 turns, takes passive damage each turn.',
        category: 'special',
        damage: 'low',
        cooldown: 4,
        effect: { applyStatus: 'calendar_blocked', statusDuration: 2, statusValue: 0.06 },
        narrativeOnHit: 'The opponent\'s schedule is full — they can\'t move!',
      },
      {
        id: 'action_item',
        name: 'Action Item',
        description: 'Camila assigns the opponent a crushing list of action items mid-battle. Moderate damage, overwhelmed status reduces speed by 25% for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'overwhelmed', statusDuration: 2, opponentSpdMod: -0.25 },
      },
      {
        id: 'all_hands',
        name: 'All Hands',
        description: 'Camila rallies the entire org in a single coordinated strike. Moderate damage from every direction, bypasses all defensive stat buffs.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 2,
        effect: { bypassDefensiveBuffs: true },
      },
      {
        id: 'agenda_item',
        name: 'Agenda Item',
        description: 'Camila tables the incoming attack for the next meeting. Delays it by 1 turn. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { delayOpponentMove: 1 },
      },
      {
        id: 'notion_page',
        name: 'Notion Page',
        description: 'Camila documents the opponent\'s every move in exhaustive detail. Reduces the next attack\'s damage by 40%.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.40 },
      },
    ],
  },

  // ── 13 SAMANTHA ────────────────────────────────────────────────────────────
  {
    id: 'sam',
    name: 'Samantha Kelly',
    role: 'Creative Planner',
    email: 'samantha@scrib3.co',
    timezone: 'America/Denver',
    roleColor: 'creative',
    stats: STATS.MANAGER,
    moves: [
      {
        id: 'guerrilla_campaign',
        name: 'Guerrilla Campaign',
        description: 'Sam launches a full brand activation into the opponent\'s territory. Moderate damage compounding each turn for 3 turns as the campaign spreads.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'scope_creep', statusDuration: 3, compoundPercent: 0.10, compoundTurns: 3 },
      },
      {
        id: 'brand_activation',
        name: 'Brand Activation',
        description: 'Sam deploys an on-the-ground activation. Moderate damage, plants a presence flag dealing 5% passive damage per turn for 3 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'presence_flag', statusDuration: 3, statusValue: 0.05 },
      },
      {
        id: 'substack_drop',
        name: 'Substack Drop',
        description: 'Sam publishes a deep-dive newsletter at the worst possible moment. Moderate damage, reputational damage status reduces defense for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'reputational', statusDuration: 2, opponentDefMod: -0.15 },
      },
      {
        id: 'mood_board_shield',
        name: 'Mood Board Shield',
        description: 'Sam assembles an impenetrable wall of reference imagery. Reduces incoming damage by 30% for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.30 },
      },
      {
        id: 'rebrand',
        name: 'Rebrand',
        description: 'Sam sheds her current identity and emerges completely refreshed. Removes all debuffs and resets speed to base.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { clearOwnDebuffs: true, resetOwnSpeed: true },
      },
    ],
  },

  // ── 14 OMAR ────────────────────────────────────────────────────────────────
  {
    id: 'omar',
    name: 'Omar Anwar',
    role: 'Account Lead',
    email: 'omar.anwar@scrib3.co',
    timezone: 'Europe/London',
    roleColor: 'strategy',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'devconnect_debrief',
        name: 'Devconnect Debrief',
        description: 'Omar traps the opponent in a compulsory unrecorded 45-minute presentation. The opponent cannot leave. High damage, severe confusion for 2 turns. No saving throw.',
        category: 'special',
        damage: 'high',
        cooldown: 4,
        effect: { applyStatus: 'confusion', statusDuration: 2 },
        narrativeOnHit: 'The opponent is trapped in the presentation. No escape!',
      },
      {
        id: 'blockchain_blitz',
        name: 'Blockchain Blitz',
        description: 'Omar floods the opponent with rapid on-chain activity. Moderate damage, network congestion reduces speed by 20% for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'network_congestion', statusDuration: 2, opponentSpdMod: -0.20 },
      },
      {
        id: 'kol_drop',
        name: 'KOL Drop',
        description: 'Omar activates a network of key opinion leaders from multiple angles. Moderate damage across multiple hits, each with a chance to apply confusion.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'confusion', statusDuration: 1, triggerChance: 0.35 },
      },
      {
        id: 'cold_wallet',
        name: 'Cold Wallet',
        description: 'Omar moves all critical assets completely off-chain. Immune to damage-over-time effects for 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { immuneToDoT: true, selfStatusDuration: 2 },
      },
      {
        id: 'rug_pull_warning',
        name: 'Rug Pull Warning',
        description: 'Omar reads the most aggressive move before it happens and steps aside. Reduces incoming damage by 40% for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.40 },
      },
    ],
  },

  // ── 15 MADISEN ─────────────────────────────────────────────────────────────
  {
    id: 'madisen',
    name: 'Madisen Kopfer',
    role: 'Senior PR Manager',
    email: 'madisen@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'pr',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'crisis_comms',
        name: 'Crisis Comms',
        description: 'Madisen activates a full crisis communications protocol as a weapon. High damage, opponent\'s attack reduced for 2 turns.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentAtkMod: -0.25, statusDuration: 2 },
      },
      {
        id: 'leaked_memo',
        name: 'Leaked Memo',
        description: 'Madisen leaks a damning internal document at precisely the right moment. Moderate damage, scandal status compounding 8% per turn for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'scandal', statusDuration: 2, statusValue: 0.08 },
      },
      {
        id: 'drop_the_story',
        name: 'Drop the Story',
        description: 'Madisen times the publication perfectly for maximum exposure. Moderate damage, opponent stunned for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 2,
        effect: { applyStatus: 'stun', statusDuration: 1 },
      },
      {
        id: 'source_protection',
        name: 'Source Protection',
        description: 'Madisen guards her position absolutely. Immune to information-extraction moves for 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { immuneToInfoExtract: true, selfStatusDuration: 2 },
      },
      {
        id: 'holding_pattern',
        name: 'Holding Pattern',
        description: 'Madisen delays the attack\'s full impact with precision media management. Reduces incoming damage by 35%.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.35 },
      },
    ],
  },

  // ── 16 TAYLOR ──────────────────────────────────────────────────────────────
  {
    id: 'taylor',
    name: 'Taylor Hadden',
    role: 'PR Director',
    email: 'taylor@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'pr',
    stats: STATS.DIRECTOR,
    moves: [
      {
        id: 'media_blitz',
        name: 'Media Blitz',
        description: 'Taylor unleashes a coordinated wave of journalists from every direction at once. High damage, defense reduction. Opponent too overwhelmed to counter-attack this turn.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentDefMod: -0.25, statusDuration: 2, applyStatus: 'stun', triggerChance: 0.70 },
      },
      {
        id: 'hurricane_season',
        name: 'Hurricane Season',
        description: 'Taylor summons full Florida weather energy. Moderate damage, disoriented status for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'disorientated', statusDuration: 1 },
      },
      {
        id: 'orlando_magic',
        name: 'Orlando Magic',
        description: 'Taylor pulls off something nobody saw coming. Moderate damage plus a randomised bonus effect selected fresh each use.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        // Engine: on use, randomly select one status from the pool below
        effect: { applyStatus: 'confusion', statusDuration: 1, triggerChance: 1.0 }, // placeholder — engine randomises the status
      },
      {
        id: 'theme_park_queue',
        name: 'Theme Park Queue',
        description: 'Taylor redirects the opponent into an endless holding pattern. Delays their next attack by 1 turn. Cooldown: 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 2,
        effect: { delayOpponentMove: 1 },
      },
      {
        id: 'sunshine_state',
        name: 'Sunshine State',
        description: 'Taylor absorbs incoming damage with relentless Florida optimism. Reduces damage by 25% and recovers 10% HP.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.25, selfHealPercent: 0.10 },
      },
    ],
  },

  // ── 17 JENNY ───────────────────────────────────────────────────────────────
  {
    id: 'jenny',
    name: 'Jenny',
    role: 'EVP, Broadcast',
    email: 'jenny@scrib3.co',
    timezone: 'America/Chicago',
    roleColor: 'pr',
    stats: STATS.DIRECTOR,
    moves: [
      {
        id: 'airtime',
        name: 'Airtime',
        description: 'Jenny books the opponent on a live broadcast where they spectacularly embarrass themselves. Moderate damage, opponent\'s attack reduced by 30% for 3 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { opponentAtkMod: -0.30, statusDuration: 3 },
      },
      {
        id: 'breaking_news',
        name: 'Breaking News',
        description: 'Jenny interrupts the battle with a live breaking news alert. Moderate damage, panic for 1 turn — accuracy drops and opponent acts erratically.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'confusion', statusDuration: 1, opponentAccMod: -0.20 },
      },
      {
        id: 'live_feed',
        name: 'Live Feed',
        description: 'Jenny broadcasts the opponent\'s worst moment in real time. Moderate damage, public humiliation reduces defense for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'humiliation', statusDuration: 2, opponentDefMod: -0.20 },
      },
      {
        id: 'dead_air',
        name: 'Dead Air',
        description: 'Jenny cuts the broadcast signal entirely. Opponent\'s communication-based or area-effect moves fail for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { immuneToInfoExtract: true },
      },
      {
        id: 'commercial_break',
        name: 'Commercial Break',
        description: 'Jenny steps offscreen. Evades all attacks for 1 turn. Cooldown: 4 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { evadeNextMove: true },
      },
    ],
  },

  // ── 18 HUGH ────────────────────────────────────────────────────────────────
  {
    id: 'hugh',
    name: 'Hugh',
    role: 'Media Team',
    email: 'hugh@scrib3.co',
    timezone: 'America/Los_Angeles',
    roleColor: 'social',
    stats: STATS.SPECIALIST,
    moves: [
      {
        id: 'three_hour_pod',
        name: 'Three-Hour Pod',
        description: 'Hugh invites the opponent onto a podcast with no defined end time, no agenda, no editor. Damage compounds each turn for 3 turns as they realise they can\'t leave. Speed-based moves unavailable while trapped.',
        category: 'special',
        damage: 'moderate',
        cooldown: 4,
        effect: { applyStatus: 'calendar_blocked', statusDuration: 3, compoundPercent: 0.10, compoundTurns: 3 },
      },
      {
        id: 'long_form_ambush',
        name: 'Long-Form Ambush',
        description: 'Hugh ambushes the opponent with an unstructured 2-hour deep dive they cannot escape. Moderate compounding damage each turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { compoundPercent: 0.10, compoundTurns: 2 },
      },
      {
        id: 'clip_pull',
        name: 'Clip Pull',
        description: 'Hugh surfaces a years-old damaging clip and amplifies it. Moderate damage, archive scrutiny reduces defense.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'archive_scrutiny', statusDuration: 2, opponentDefMod: -0.15 },
      },
      {
        id: 'subscriber_gate',
        name: 'Subscriber Gate',
        description: 'Hugh retreats behind a paywall. Immune to all attacks for 1 turn. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
      {
        id: 'pre_roll',
        name: 'Pre-Roll',
        description: 'Hugh inserts a lengthy sponsor read before the opponent\'s attack. Delays it by 1 turn and reduces its damage by 20%.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { delayOpponentMove: 1, damageReductionPercent: 0.20 },
      },
    ],
  },

  // ── 19 KEVIN ARTEAGA ───────────────────────────────────────────────────────
  {
    id: 'kevin-a',
    name: 'Kevin Arteaga',
    role: 'PR Manager',
    email: 'kevin.arteaga@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'pr',
    stats: STATS.MANAGER,
    moves: [
      {
        id: 'south_beach_spin',
        name: 'South Beach Spin',
        description: 'Kevin hits with a combination of relentless Miami energy and a narrative so well-crafted they\'re not sure what happened. Moderate damage, opponent\'s accuracy drops for 2 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'blind', statusDuration: 2, opponentAccMod: -0.20 },
      },
      {
        id: 'heat_wave',
        name: 'Heat Wave',
        description: 'Kevin brings sustained Miami heat. Moderate damage over 2 turns, applies a burn status.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'burn', statusDuration: 2 },
      },
      {
        id: 'vice_city_blitz',
        name: 'Vice City Blitz',
        description: 'Kevin launches a flash offensive so fast and flashy the opponent can\'t get a read. Moderate damage, accuracy drops for 1 turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentAccMod: -0.20, statusDuration: 1 },
      },
      {
        id: 'ocean_drive',
        name: 'Ocean Drive',
        description: 'Kevin retreats to the boulevard and regroups. Heals 15% HP, removes one debuff.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { selfHealPercent: 0.15, clearOneDebuff: true },
      },
      {
        id: 'cool_down',
        name: 'Cool Down',
        description: 'Kevin plays it completely ice cold. Reduces incoming damage by 30%.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.30 },
      },
    ],
  },

  // ── 20 KIM ─────────────────────────────────────────────────────────────────
  {
    id: 'kim',
    name: 'Kim',
    role: 'Senior PR Manager',
    email: 'kimberley@scrib3.co',
    timezone: 'America/Manaus',
    roleColor: 'pr',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'press_blackout',
        name: 'Press Blackout',
        description: 'Kim quietly kills every piece of the opponent\'s positive coverage. Moderate damage, opponent\'s attack silenced for 2 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'silenced', statusDuration: 2 },
        narrativeOnHit: 'Total silence. Their attack has been cut off.',
      },
      {
        id: 'embargo_breach',
        name: 'Embargo Breach',
        description: 'Kim times a strategic leak perfectly. Moderate damage, prevents defensive moves next turn.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'exposed', statusDuration: 1 },
      },
      {
        id: 'coverage_kill',
        name: 'Coverage Kill',
        description: 'Kim systematically strips the opponent of their positive press. Moderate damage, removes all defensive buffs currently active.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 2,
        effect: { clearOwnStatuses: false }, // Engine: clear opponent's active defensive buffs
      },
      {
        id: 'dark_mode',
        name: 'Dark Mode',
        description: 'Kim goes completely off-grid. Opponent cannot target her for 1 turn. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
      {
        id: 'nda_drop',
        name: 'NDA Drop',
        description: 'Kim silences any attempt to describe what she\'s doing. Reduces incoming damage by 30%.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.30 },
      },
    ],
  },

  // ── 21 JAKE ────────────────────────────────────────────────────────────────
  {
    id: 'jake',
    name: 'Jake Embleton',
    role: 'Social Media Manager',
    email: 'jake@scrib3.co',
    timezone: 'Asia/Chongqing',
    roleColor: 'social',
    stats: STATS.MANAGER,
    moves: [
      {
        id: 'going_viral',
        // v4 NERF: linear ×1.5 scaling (was ×2 doubling), no stacking — recasting resets timer
        name: 'Going Viral',
        description: 'Jake posts at 5am when nobody is watching, and by noon it\'s everywhere. Moderate initial damage, increasing by 50% each subsequent turn for 3 turns. Cannot stack — recasting while active resets the timer.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: {
          applyStatus: 'scope_creep',
          statusDuration: 3,
          compoundPercent: 0.50,  // ×1.5 each tick (not doubling)
          compoundTurns: 3,
        },
        narrativeOnHit: 'It\'s starting to spread...',
      },
      {
        id: 'morning_drop',
        name: 'Morning Drop',
        description: 'Jake posts early, before the opponent is even awake. Moderate damage, increases by 15% each turn for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { compoundPercent: 0.15, compoundTurns: 2 },
      },
      {
        id: 'ratiod',
        name: 'Ratio\'d',
        description: 'Jake executes a devastating ratio on the opponent\'s last move. Moderate damage, community notes status — opponent\'s next attack weakened by 25%.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'community_notes', statusDuration: 1, statusValue: 0.25 },
      },
      {
        id: 'mute',
        name: 'Mute',
        description: 'Jake mutes the opponent. Their next ability has no effect. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { applyStatus: 'in_embargo', statusDuration: 1 },
      },
      {
        id: 'private_account',
        name: 'Private Account',
        description: 'Jake goes dark. Evades one incoming attack entirely. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
    ],
  },

  // ── 22 LUKE ────────────────────────────────────────────────────────────────
  {
    id: 'luke',
    name: 'Luke Bateman',
    role: 'Senior Content Strategist',
    email: 'luke@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'social',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'long_read',
        name: 'Long Read',
        description: 'Luke drops a 10,000-word content strategy document, fully footnoted, directly onto the opponent. High damage, reduced speed.',
        category: 'special',
        damage: 'high',
        cooldown: 3,
        effect: { opponentSpdMod: -0.30, statusDuration: 2 },
      },
      {
        id: 'seo_bomb',
        name: 'SEO Bomb',
        description: 'Luke floods the opponent\'s search results. Moderate damage, discoverability penalty — defensive moves 20% less effective.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'discoverability', statusDuration: 2 },
      },
      {
        id: 'pillar_page',
        name: 'Pillar Page',
        description: 'Luke deploys a vast, exhaustive content cluster. Moderate-high damage, speed reduction.',
        category: 'basic',
        damage: 'moderate_high',
        cooldown: 0,
        effect: { opponentSpdMod: -0.20, statusDuration: 2 },
      },
      {
        id: 'evergreen',
        name: 'Evergreen',
        description: 'Luke converts incoming damage into durable, permanent value. Reduces damage by 25% and stores 10% as a delayed counter-strike.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.25, returnDamagePercent: 0.10, applySelfStatus: 'evergreen_stored' },
      },
      {
        id: 'content_calendar',
        name: 'Content Calendar',
        description: 'Luke anticipated this attack three weeks ago and scheduled around it. Delays incoming damage by 1 turn. Cooldown: 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 2,
        effect: { delayOpponentMove: 1 },
      },
    ],
  },

  // ── 23 CYNTHIA ─────────────────────────────────────────────────────────────
  {
    id: 'cynthia',
    name: 'Cynthia Gentry',
    role: 'Creative Copywriter',
    email: 'cynthia@scrib3.co',
    timezone: 'America/Chicago',
    roleColor: 'creative',
    stats: STATS.SPECIALIST,
    moves: [
      {
        id: 'the_hook',
        name: 'The Hook',
        description: 'Cynthia\'s opening line is so irresistible the opponent stops dead in their tracks. Moderate damage, stunned 1 turn, defense drops.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'stun', statusDuration: 1, opponentDefMod: -0.15, statusValue: 1 },
      },
      {
        id: 'sharp_copy',
        name: 'Sharp Copy',
        description: 'Cynthia deploys a line so precise it cuts before the opponent realizes they\'ve been hit. Moderate damage, paper cut status 5% per turn for 3 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'paper_cut', statusDuration: 3, statusValue: 0.05 },
      },
      {
        id: 'headline',
        name: 'Headline',
        description: 'Cynthia drops a devastating headline that reframes the entire battle. Moderate damage, defense reduced.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentDefMod: -0.15, statusDuration: 2 },
      },
      {
        id: 'fine_print',
        name: 'Fine Print',
        description: 'Cynthia buries a critical nullifying clause in the fine print. Cancels the opponent\'s next attack entirely. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { applyStatus: 'in_embargo', statusDuration: 1 },
      },
      {
        id: 'levelling_up',
        // v4 CHANGE: replaces Brand Voice — passive growth mechanic
        name: 'Levelling Up (Passive)',
        description: 'For every 5 turns Cynthia survives, her ATK and DEF increase by 8%. No action required. The longer she stays in, the more dangerous she becomes.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        // Engine: track turnsSurvived on this fighter; every 5 turns apply +8% ATK/DEF passively
        effect: { applySelfStatus: 'levelling_up', selfStatusDuration: 999 },
      },
    ],
  },

  // ── 24 STEFANIE ────────────────────────────────────────────────────────────
  {
    id: 'stef',
    name: 'Stefanie',
    role: 'Social Media Manager',
    email: 'stefanie@scrib3.co',
    timezone: 'America/Chicago',
    roleColor: 'social',
    stats: STATS.MANAGER,
    moves: [
      {
        id: 'tiktok_takedown',
        name: 'TikTok Takedown',
        description: 'Stef posts a ruthlessly edited vertical clip exposing the opponent\'s single worst moment. Defense erodes by 10% each turn for 3 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { opponentDefMod: -0.10, statusDuration: 3, compoundPercent: -0.10, compoundTurns: 3 },
      },
      {
        id: 'native_content',
        name: 'Native Content',
        description: 'Stef posts something that feels completely organic but hits harder than it looks. Moderate damage, bypasses 20% of the opponent\'s defenses.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { damageReductionPercent: -0.20 }, // Engine: penetrates 20% of opponent's damage reduction
      },
      {
        id: 'stitch',
        // v4 BUFF: 45% reflect (was 30%), + 10% HP recovery on reflected amount
        name: 'Stitch',
        description: 'Stef stitches the opponent\'s own last move and turns it against them. Reflects 45% of the opponent\'s last attack back as bonus damage. Stef also recovers 10% of the reflected amount as HP.',
        category: 'basic',
        damage: 'none',
        cooldown: 2,
        effect: {
          reflectPercent: 0.45,
          reflectHealPercent: 0.10,
        },
        narrativeOnHit: 'Stitch! The opponent\'s own move comes back at them!',
      },
      {
        id: 'close_friends',
        name: 'Close Friends',
        description: 'Stef restricts her content to a select audience. All area-effect moves land at only 50% power for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.50 }, // Engine: applies to area/multi-hit moves only
      },
      {
        id: 'story_disappears',
        name: 'Story Disappears',
        description: 'Stef\'s last action vanishes after 24 hours with no trace. Removes one negative status effect. Cooldown: 2 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 2,
        effect: { clearOneDebuff: true },
      },
    ],
  },

  // ── 25 AMANDA ──────────────────────────────────────────────────────────────
  {
    id: 'amanda',
    name: 'Amanda Eyer',
    role: 'Senior Brand Designer',
    email: 'amanda@scrib3.co',
    timezone: 'America/Bahia',
    roleColor: 'creative',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'brand_police',
        // v4 BUFF: now deals moderate damage in addition to the ATK debuff
        name: 'Brand Police',
        description: 'Amanda identifies every off-brand element and corrects it with extreme prejudice. Moderate damage plus a sharp enforcement strike. Applies brand violation reducing opponent\'s attack for 2 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'brand_violation', statusDuration: 2, opponentAtkMod: -0.20 },
      },
      {
        id: 'colour_palette_clash',
        name: 'Colour Palette Clash',
        description: 'Amanda deploys a violently off-brand colour scheme. Moderate damage, visual confusion reduces accuracy by 20% for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'confusion', statusDuration: 2, opponentAccMod: -0.20 },
      },
      {
        id: 'typography_strike',
        name: 'Typography Strike',
        description: 'Amanda weaponises a sans-serif so aggressively kerned it inflicts genuine pain. Moderate damage, kerning trauma slows the opponent.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'kerning_trauma', statusDuration: 2, opponentSpdMod: -0.20 },
      },
      {
        id: 'grid_system',
        name: 'Grid System',
        description: 'Amanda constructs an impenetrable design grid. Reduces incoming damage by 35% for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.35 },
      },
      {
        id: 'white_space',
        name: 'White Space',
        description: 'Amanda creates pure visual breathing room, impossible to target cleanly. Evades one attack. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
    ],
  },

  // ── 26 KEVIN MORAN ─────────────────────────────────────────────────────────
  {
    id: 'kevin-m',
    name: 'Kevin Moran',
    role: 'Brand Design Lead',
    email: 'kevin.moran@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'creative',
    stats: STATS.SENIOR,
    moves: [
      {
        id: 'pixel_perfect',
        name: 'Pixel Perfect',
        description: 'Kevin buries the opponent under 47 design comments, each one specific, each one valid. The opponent is paralysed. Moderate damage, paralysis and speed reduction.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { applyStatus: 'paralysis', statusDuration: 2, opponentSpdMod: -0.25 },
      },
      {
        id: 'mockup_drop',
        name: 'Mockup Drop',
        description: 'Kevin delivers a near-photorealistic mockup of the opponent\'s defeat before it happens. Moderate damage, demoralisation debuff — attack drops 15%.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'demoralised', statusDuration: 2, opponentAtkMod: -0.15 },
      },
      {
        id: 'print_bleed',
        name: 'Print Bleed',
        description: 'Kevin ensures his attack extends 3mm beyond all safe zones. Moderate damage plus bleed, 8% per turn for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'bleed', statusDuration: 2, statusValue: 0.08 },
      },
      {
        id: 'safe_zone',
        name: 'Safe Zone',
        description: 'Kevin retreats into his print margins. Reduces incoming damage by 30% for 1 turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.30 },
      },
      {
        id: 'asset_lock',
        name: 'Asset Lock',
        description: 'Kevin locks all critical resources behind proper folder structure. Immune to disarm or debuff moves for 1 turn. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { immuneToDebuffs: true },
      },
    ],
  },

  // ── 27 TOLANI ──────────────────────────────────────────────────────────────
  {
    id: 'tolani',
    name: 'Tolani Daniel',
    role: 'Motion Designer',
    email: 'daniel@scrib3.co',
    timezone: 'Africa/Algiers',
    roleColor: 'creative',
    stats: STATS.SPECIALIST,
    moves: [
      {
        id: 'motion_blur',
        name: 'Motion Blur',
        description: 'Tolani corrupts the opponent\'s movement at the frame level. Moderate damage, opponent\'s speed reduced to near zero for 2 turns.',
        category: 'special',
        damage: 'moderate',
        cooldown: 3,
        effect: { opponentSpdMod: -0.80, statusDuration: 2 },
      },
      {
        id: 'frame_drop',
        name: 'Frame Drop',
        description: 'Tolani corrupts the opponent\'s movement, dropping their frame rate to a genuinely unplayable level. Moderate damage, speed -35% for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { opponentSpdMod: -0.35, statusDuration: 2 },
      },
      {
        id: 'easing_curve',
        name: 'Easing Curve',
        description: 'Tolani applies a brutal ease-in — starts slow, hits catastrophically hard on the second beat. Low damage on impact, doubles on the follow-through next turn.',
        category: 'basic',
        damage: 'low',
        cooldown: 0,
        effect: { applySelfStatus: 'easing_curve_primed', selfStatusDuration: 1 },
        narrativeOnUse: 'Tolani eases in... the follow-through is coming.',
      },
      {
        id: 'hold_frame',
        name: 'Hold Frame',
        description: 'Tolani freezes the frame entirely. All incoming damage paused for 1 turn. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
      {
        id: 'loop',
        name: 'Loop',
        description: 'Tolani loops his last defensive action at 75% effectiveness without consuming a turn.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        // Engine: re-apply lastDefensiveMove at 75% of its original values; does not consume the turn
        effect: { applySelfStatus: 'def_up', selfStatusDuration: 1, selfStatusValue: 0.75 },
        narrativeOnUse: 'Tolani loops the last defense at 75%...',
      },
    ],
  },

  // ── 28 DESTINI ─────────────────────────────────────────────────────────────
  {
    id: 'destini',
    name: 'Destini',
    role: 'PR / Media Relations',
    email: 'destini@scrib3.co',
    timezone: 'America/New_York',
    roleColor: 'pr',
    stats: STATS.MANAGER,
    moves: [
      {
        id: 'midnight_drop',
        name: 'Midnight Drop',
        description: 'Destini coordinates a full ecosystem media launch for Midnight at the worst possible moment for the opponent. Moderate-high damage, plants a presence flag dealing 5% passive damage per turn for 3 turns as coverage spreads.',
        category: 'special',
        damage: 'moderate_high',
        cooldown: 3,
        effect: { applyStatus: 'presence_flag', statusDuration: 3, statusValue: 0.05 },
        narrativeOnHit: 'The Midnight coverage is everywhere — it keeps spreading!',
      },
      {
        id: 'cold_pitch',
        name: 'Cold Pitch',
        description: 'Destini reaches out cold to the most dangerous journalist at precisely the right time. Moderate damage, opponent\'s defense reduced for 2 turns as the story gains traction.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'press_scrutiny', statusDuration: 2, opponentDefMod: -0.20 },
      },
      {
        id: 'story_plant',
        name: 'Story Plant',
        description: 'Destini quietly seeds a damaging narrative before the opponent even knows it\'s happening. Moderate damage, applies a slow-burn rumour dealing 5% per turn for 2 turns.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { applyStatus: 'rumour', statusDuration: 2, statusValue: 0.05 },
      },
      {
        id: 'no_statement',
        name: 'No Statement',
        description: 'Destini refuses to confirm or deny anything. Evades one incoming attack entirely. Cooldown: 3 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 3,
        effect: { evadeNextMove: true },
      },
      {
        id: 'media_training',
        name: 'Media Training',
        description: 'Destini has been trained for exactly this question. Absorbs the hit with composure. Reduces incoming damage by 25% and recovers 8% HP.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: { damageReductionPercent: 0.25, selfHealPercent: 0.08 },
      },
    ],
  },

  // ── 29 CK ──────────────────────────────────────────────────────────────────
  {
    id: 'ck',
    name: 'CK',
    role: 'Strategic Advisor',
    email: 'CK@scrib3.co',
    timezone: 'America/Chicago',
    roleColor: 'strategy',
    stats: STATS.ADVISOR,
    moves: [
      {
        id: 'creative_direction',
        // v4 REDESIGN: replaces Wild Card
        name: 'Creative Direction',
        description: 'CK\'s move is unpredictable — but not unfair. One of four outcomes resolves at random: Rebrand (heal+ATK buff), Campaign Drop (high damage), Mood Board (random status), or The Pivot (swap all buffs/debuffs between fighters). Cooldown: 3 turns.',
        category: 'special',
        damage: 'none',   // damage determined by outcome
        cooldown: 3,
        effect: {
          creativeDirectionOutcomes: [
            {
              id: 'rebrand',
              weight: 0.25,
              description: 'CK heals 15% HP and gains +15% ATK for 2 turns.',
            },
            {
              id: 'campaign_drop',
              weight: 0.25,
              description: 'CK deals high damage. Can crit.',
            },
            {
              id: 'mood_board',
              weight: 0.25,
              description: 'Applies one random status to opponent: confusion, slow, blind, or burn.',
            },
            {
              id: 'the_pivot',
              weight: 0.25,
              description: 'All active stat buffs and debuffs swap between both fighters.',
            },
          ],
        },
        narrativeOnUse: 'CK reaches into the unknown...',
      },
      {
        id: 'slow_burn',
        // v4 REDESIGN: replaces Unknown Variable. Cap ×2.0, telegraphed
        name: 'Slow Burn',
        description: 'CK introduces a factor nobody accounted for. Low damage. Charges a multiplier token (×1.2–×2.0) that applies to CK\'s next attack. Both players can see the token is active — they just don\'t know the value.',
        category: 'basic',
        damage: 'low',
        cooldown: 2,
        effect: {
          applySelfStatus: 'slow_burn_token',
          selfStatusDuration: 999, // persists until consumed
          chargeMultiplierMin: 1.2,
          chargeMultiplierMax: 2.0,
        },
        narrativeOnUse: 'CK charges something... a multiplier token is active.',
      },
      {
        id: 'off_piste',
        // v4 REDESIGN: bypasses counters/reflection only (not damage reduction or full invincibility)
        name: 'Off-Piste',
        description: 'CK takes the battle somewhere nobody anticipated. Moderate damage. This move cannot be reflected, redirected, or countered — Stitch, Hit Piece blowback, and Wipeout have no effect. Damage reduction and invincibility still apply.',
        category: 'basic',
        damage: 'moderate',
        cooldown: 0,
        effect: { bypassCounters: true },
      },
      {
        id: 'plausible_deniability',
        name: 'Plausible Deniability',
        description: 'CK wasn\'t there. Incoming attack misses entirely. Cooldown: 4 turns.',
        category: 'defensive',
        damage: 'none',
        cooldown: 4,
        effect: { evadeNextMove: true },
      },
      {
        id: 'the_long_game',
        name: 'The Long Game',
        description: 'CK absorbs this turn\'s damage at full force, then returns exactly 50% of it to the opponent next turn. Patience is the move. The harder you hit CK, the harder it comes back.',
        category: 'defensive',
        damage: 'none',
        cooldown: 0,
        effect: {
          applySelfStatus: 'long_game_stored',
          selfStatusDuration: 1,
          returnDamagePercent: 0.50,
        },
        narrativeOnUse: 'CK absorbs the hit... something is being stored.',
      },
    ],
  },

];

// ── LOOKUP HELPERS ────────────────────────────────────────────────────────────

export const getFighterById = (id: string): Fighter | undefined =>
  fighters.find(f => f.id === id);

export const getFightersByRole = (role: RoleColor): Fighter[] =>
  fighters.filter(f => f.roleColor === role);

export const getMoveById = (fighter: Fighter, moveId: string): Move | undefined =>
  fighter.moves.find(m => m.id === moveId);

export const getSpecialMove = (fighter: Fighter): Move =>
  fighter.moves.find(m => m.category === 'special')!;

export const getBasicMoves = (fighter: Fighter): Move[] =>
  fighter.moves.filter(m => m.category === 'basic');

export const getDefensiveMoves = (fighter: Fighter): Move[] =>
  fighter.moves.filter(m => m.category === 'defensive');

export default fighters;
