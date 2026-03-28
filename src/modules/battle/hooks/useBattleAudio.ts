// ===== Battle Audio System =====
// Background music + move sound effects from Pokemon sound library

const AUDIO_BASE = '/battle/audio/';
const SFX_BASE = '/modules/battle/audio/';

// Move-to-sound mapping — best-fit from available Pokemon SFX
const MOVE_SOUNDS: Record<string, string> = {
  // CK moves
  creative_direction: 'Metronome.mp3',
  slow_burn: 'Charge.mp3',
  off_piste: 'Feint Attack.mp3',
  the_long_game: 'Bide.mp3',
  debug: 'Scratch.mp3',

  // Ben moves
  brand_lockup: 'Slam.mp3',
  long_read: 'Psychic.mp3',
  redline: 'Slash.mp3',
  revision_round: 'Torment.mp3',
  design_system: 'Barrier.mp3',

  // Sixtyne moves
  executive_override: 'Hyper Beam.mp3',
  all_hands: 'Superpower.mp3',
  fire_drill: 'Fire Blast.mp3',
  calendar_block: 'Block.mp3',
  culture_shield: 'Protect.mp3',

  // Nick moves
  patience_of_a_fisherman: 'Focus Energy.mp3',
  strategic_pivot: 'Swords Dance.mp3',
  alignment_check: 'Confuse Ray.mp3',
  read_the_room: 'Detect.mp3',
  cold_open: 'Quick Attack.mp3',

  // Elena moves
  scope_management: 'Psycho Cut.mp3',
  managed_expectations: 'Light Screen.mp3',
  client_whisperer: 'Charm.mp3',
  damage_control: 'Recover.mp3',
  escalation: 'Dragon Rage.mp3',

  // Kevin Moran moves
  pixel_perfect: 'Focus Punch.mp3',
  kerning_trauma: 'Psycho Boost.mp3',
  brand_police: 'Punishment.mp3',
  colour_theory: 'Flash.mp3',
  grid_snap: 'Iron Defense.mp3',

  // Samantha moves
  narrative_arc: 'Shadow Ball.mp3',
  presence: 'Calm Mind.mp3',
  strategy_deck: 'Secret Power.mp3',
  brand_guardian: 'Safeguard.mp3',
  content_pillar: 'Ancient Power.mp3',

  // Omar moves
  bandwidth_crunch: 'Crunch.mp3',
  packet_loss: 'Discharge.mp3',
  firewall: 'Reflect.mp3',
  network_patch: 'Heal Bell.mp3',
  ping_flood: 'Rapid Spin.mp3',

  // Matt moves
  under_embargo: 'Embargo.mp3',
  press_release: 'Hyper Voice.mp3',
  off_the_record: 'Smokescreen.mp3',
  media_blitz: 'Swift.mp3',
  source_protection: 'Protect.mp3',

  // Jake moves
  going_viral: 'Outrage.mp3',
  morning_drop: 'Sunny Day.mp3',
  ratio: 'Counter.mp3',
  engagement_bait: 'Attract.mp3',
  doomscroll: 'Nightmare.mp3',

  // Tolani moves
  easing_curve: 'Agility.mp3',
  loop: 'Copycat.mp3',
  keyframe_smash: 'Mega Punch.mp3',
  render_queue: 'Bulk Up.mp3',
  motion_blur: 'Double Team.mp3',

  // Cynthia moves
  levelling_up: 'Growth.mp3',
  tone_shift: 'Nasty Plot.mp3',
  wordsmith: 'Fury Cutter.mp3',
  hot_take: 'Flamethrower.mp3',
  editorial_shield: 'Safeguard.mp3',

  // Haley moves
  calming_presence: 'Sing.mp3',
  open_door_policy: 'Wish.mp3',
  onboarding: 'Helping Hand.mp3',
  handbook: 'Harden.mp3',
  exit_interview: 'Perish Song.mp3',

  // Arthur moves
  venture_capital: 'Pay Day.mp3',
  cold_wallet: 'Ice Beam.mp3',
  asset_lock: 'Iron Defense.mp3',
  liquidation: 'Earthquake.mp3',
  term_sheet: 'Slash.mp3',

  // Ross moves
  wipeout: 'Surf.mp3',
  duck_dive: 'Dive.mp3',
  closing_set: 'Close Combat.mp3',
  offshore: 'Aqua Jet.mp3',
  paddle_out: 'Endure.mp3',

  // Ishan moves
  closing_argument: 'Psychic.mp3',
  smart_contract: 'Lock On.mp3',
  gas_fee: 'Toxic.mp3',
  consensus_mechanism: 'Gravity.mp3',
  decentralise: 'Explosion.mp3',

  // JB moves
  founders_vision: 'Roar of Time.mp3',
  market_maker: 'Pay Day.mp3',
  keynote: 'Hyper Voice.mp3',
  pivot: 'Teleport.mp3',
  war_chest: 'Stockpile.mp3',

  // Janelle moves
  hit_piece: 'Shadow Sneak.mp3',
  rumour_mill: 'Ominous Wind.mp3',
  press_conference: 'Uproar.mp3',
  blackout: 'Dark Void.mp3',
  spin_doctor: 'Rapid Spin.mp3',

  // Jenny moves
  cone_of_shame: 'Headbutt.mp3',
  broadcast: 'Screech.mp3',
  sound_bite: 'Bite.mp3',
  live_cross: 'Thunder Shock.mp3',
  teleprompter: 'Amnesia.mp3',

  // Taylor moves
  orlando_magic: 'Metronome.mp3',
  client_dinner: 'Sweet Kiss.mp3',
  schmooze: 'Charm.mp3',
  happy_hour: 'Slack Off.mp3',
  team_outing: 'Helping Hand.mp3',

  // Stef moves
  stitch: 'Mirror Coat.mp3',
  fact_check: 'Extrasensory.mp3',
  deep_dive: 'Dive.mp3',
  copy_paste: 'Mimic.mp3',
  red_pen: 'Slash.mp3',

  // Luke moves
  evergreen: 'Ingrain.mp3',
  recycle: 'Recycle.mp3',
  content_farm: 'Leech Seed.mp3',
  hashtag: 'Signal Beam.mp3',
  caption_this: 'Taunt.mp3',

  // Amanda moves
  colour_splash: 'Luster Purge.mp3',
  portfolio_review: 'Judgment.mp3',
  mood_board_toss: 'Fling.mp3',
  art_direction: 'Flash Cannon.mp3',
  retouch: 'Refresh.mp3',

  // Camila moves
  invoice_storm: 'Pay Day.mp3',
  calendar_tetris: 'Block.mp3',
  paper_trail: 'Razor Leaf.mp3',
  ops_shield: 'Protect.mp3',
  filing_cabinet: 'Iron Defense.mp3',

  // Hugh moves
  hot_mic: 'Screech.mp3',
  podcast_plug: 'Uproar.mp3',
  sound_check: 'Supersonic.mp3',
  dead_air: 'Perish Song.mp3',
  ad_read: 'Pay Day.mp3',

  // Kim moves
  dubai_deal: 'Draco Meteor.mp3',
  gold_standard: 'Flash Cannon.mp3',
  desert_storm: 'Sandstorm.mp3',
  oasis: 'Moonlight.mp3',
  camel_kick: 'High Jump Kick.mp3',

  // Kevin Arteaga moves
  media_pitch: 'Swift.mp3',
  follow_up: 'Quick Attack.mp3',
  press_kit: 'Present.mp3',
  coverage_report: 'Future Sight.mp3',
  talking_points: 'Psych Up.mp3',

  // Madisen moves
  scandal_sheet: 'Shadow Ball.mp3',
  whisper_campaign: 'Ominous Wind.mp3',
  breaking_news: 'Thunderbolt.mp3',
  exclusive: 'Lock On.mp3',
  retraction: 'Recover.mp3',

  // Destini moves
  headline_grab: 'Snatch.mp3',
  spin_cycle: 'Rapid Spin.mp3',
  press_junket: 'Uproar.mp3',
  no_comment: 'Protect.mp3',
  leak: 'Toxic Spikes.mp3',
};

// Fallback sounds by category
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  special: ['Hyper Beam.mp3', 'Psychic.mp3', 'Thunderbolt.mp3', 'Flamethrower.mp3', 'Ice Beam.mp3', 'Shadow Ball.mp3'],
  basic: ['Tackle.mp3', 'Slash.mp3', 'Bite.mp3', 'Scratch.mp3', 'Pound.mp3', 'Mega Punch.mp3', 'Body Slam.mp3'],
  defensive: ['Protect.mp3', 'Barrier.mp3', 'Light Screen.mp3', 'Reflect.mp3', 'Safeguard.mp3', 'Iron Defense.mp3'],
};

// Status effect sounds
const STATUS_SOUNDS: Record<string, string> = {
  burn: 'Status Burned.mp3',
  sleep: 'Status Sleep.mp3',
  paralysis: 'Status Paralyzed.mp3',
  confusion: 'Status Confused.mp3',
  poison: 'Status Poisoned.mp3',
};

// Battle event sounds
export const EVENT_SOUNDS = {
  faint: 'In-Battle Faint No Health.mp3',
  heal: 'In-Battle Heal HP Restore.mp3',
  lowHp: 'In-Battle Health Low.mp3',
  heldItem: 'In-Battle Held Item Activate.mp3',
  switchOut: 'In-Battle Recall Switch Pokeball.mp3',
  flee: 'In-Battle Switch Flee Run.mp3',
  statUp: 'Stat Rise Up.mp3',
  statDown: 'Stat Fall Down.mp3',
  superEffective: 'Hit Super Effective.mp3',
  notEffective: 'Hit Weak Not Very Effective.mp3',
  normalHit: 'Hit Normal Damage.mp3',
};

let globalMuted = false;
let globalVolume = 0.4;

export function setGlobalMute(muted: boolean) { globalMuted = muted; }
export function setGlobalVolume(vol: number) { globalVolume = vol; }

export function playSound(filename: string, volume?: number): HTMLAudioElement | null {
  if (globalMuted) return null;
  try {
    // Try SFX base first (src/modules/battle/audio/), fall back to alternatives
    const audio = new Audio(SFX_BASE + filename);
    audio.volume = volume ?? globalVolume * 0.6; // SFX slightly quieter than music
    audio.play().catch(() => {});
    return audio;
  } catch { return null; }
}

export function playMoveSound(moveId: string, category: string): void {
  const specific = MOVE_SOUNDS[moveId];
  if (specific) { playSound(specific); return; }

  // Fallback to category
  const fallbacks = CATEGORY_FALLBACKS[category] ?? CATEGORY_FALLBACKS.basic;
  const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  playSound(pick);
}

export function playStatusSound(statusId: string): void {
  const sound = STATUS_SOUNDS[statusId];
  if (sound) playSound(sound);
}

export function playEventSound(event: keyof typeof EVENT_SOUNDS): void {
  playSound(EVENT_SOUNDS[event]);
}

// Background music
let bgMusic: HTMLAudioElement | null = null;
let bgLoop: HTMLAudioElement | null = null;

export function startBattleMusic(): void {
  stopBattleMusic();
  try {
    bgMusic = new Audio(AUDIO_BASE + 'pkmn.mp3');
    bgMusic.volume = globalMuted ? 0 : globalVolume;
    bgMusic.play().catch(() => {
      // Try wav fallback
      bgMusic = new Audio(AUDIO_BASE + 'pkmn.wav');
      bgMusic!.volume = globalMuted ? 0 : globalVolume;
      bgMusic!.play().catch(() => {});
    });
    bgMusic.onended = () => {
      bgLoop = new Audio(AUDIO_BASE + 'pkmnrpt.mp3');
      bgLoop.volume = globalMuted ? 0 : globalVolume;
      bgLoop.loop = true;
      bgLoop.play().catch(() => {
        bgLoop = new Audio(AUDIO_BASE + 'pkmnrpt.wav');
        bgLoop!.volume = globalMuted ? 0 : globalVolume;
        bgLoop!.loop = true;
        bgLoop!.play().catch(() => {});
      });
    };
  } catch { /* no audio */ }
}

export function stopBattleMusic(): void {
  bgMusic?.pause(); bgMusic = null;
  bgLoop?.pause(); bgLoop = null;
}

export function fadeBattleMusic(): void {
  const audio = bgLoop ?? bgMusic;
  if (!audio) return;
  const fade = setInterval(() => {
    if (audio.volume > 0.05) audio.volume = Math.max(0, audio.volume - 0.05);
    else { audio.pause(); clearInterval(fade); }
  }, 100);
}

export function updateMusicVolume(muted: boolean): void {
  globalMuted = muted;
  const vol = muted ? 0 : globalVolume;
  if (bgMusic) bgMusic.volume = vol;
  if (bgLoop) bgLoop.volume = vol;
}
