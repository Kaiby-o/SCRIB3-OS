# SKILL-GAMIFICATION.md — Gamification Systems for Project Management
**Expertise Level:** Expert  
**Context:** XP systems, operator levels, achievement badges, notification theatrics  
**Tone target:** Engaging, earned, utilitarian — not juvenile, not casino-like

---

## 1. Design Philosophy

Gamification in a PM context fails when it feels like a mobile game layered on top of a tool. It succeeds when it:

1. **Reflects real work** — XP maps directly to actions that matter (delivery, quality, consistency)
2. **Rewards mastery, not activity** — Logging in 100 times should not outrank delivering one excellent project
3. **Is visible but not intrusive** — Progress shows; it doesn't announce itself constantly
4. **Has hierarchy** — Levels and badges mean something because they require sustained performance
5. **Fits the aesthetic** — In SCRIB3-OS, gamification is rendered as hardware instrumentation, not cartoon rewards

The metaphor: **operator capability readout.** Your XP bar is a field instrument gauge, not a video game progress bar.

---

## 2. XP System

### 2.1 Event Definitions & Weights

```typescript
type XPEvent = {
  event_type: string;
  xp: number;
  cooldown_hours?: number; // prevent farming
  daily_cap?: number;      // max per day from this source
};

const XP_EVENTS: Record<string, XPEvent> = {
  TASK_COMPLETE_ON_TIME:    { event_type: 'task_complete_on_time',    xp: 50 },
  TASK_COMPLETE_EARLY:      { event_type: 'task_complete_early',      xp: 75 },
  TASK_COMPLETE_LATE:       { event_type: 'task_complete_late',       xp: 10 },
  FILE_UPLOAD_ON_TIME:      { event_type: 'file_upload_on_time',      xp: 30 },
  APPROVAL_FIRST_PASS:      { event_type: 'approval_first_pass',      xp: 40 },
  APPROVAL_AFTER_REVISION:  { event_type: 'approval_after_revision',  xp: 15 },
  DAILY_LOGIN:              { event_type: 'daily_login',              xp: 5,  cooldown_hours: 20, daily_cap: 5 },
  STREAK_7_DAY_BONUS:       { event_type: 'streak_7_day_bonus',       xp: 25, cooldown_hours: 168 },
};
```

### 2.2 Awarding XP (Supabase Edge Function)

```typescript
// supabase/functions/award-xp/index.ts
import { createClient } from '@supabase/supabase-js';

export async function awardXP(
  userId: string, 
  event: keyof typeof XP_EVENTS,
  refId?: string
) {
  const supabase = createClient(/* ... */);
  const config = XP_EVENTS[event];
  
  // Check cooldown
  if (config.cooldown_hours) {
    const { data: recent } = await supabase
      .from('xp_log')
      .select('created_at')
      .eq('user_id', userId)
      .eq('event_type', config.event_type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (recent) {
      const hoursSince = (Date.now() - new Date(recent.created_at).getTime()) / 3600000;
      if (hoursSince < config.cooldown_hours) return { awarded: false, reason: 'cooldown' };
    }
  }
  
  // Log event
  await supabase.from('xp_log').insert({
    user_id: userId,
    event_type: config.event_type,
    xp_amount: config.xp,
    ref_id: refId,
  });
  
  // Update user total + check level up
  const { data: user } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single();
  
  const newXP = (user?.xp ?? 0) + config.xp;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > (user?.level ?? 1);
  
  await supabase
    .from('users')
    .update({ xp: newXP, level: newLevel })
    .eq('id', userId);
  
  // Broadcast via Supabase realtime for UI update
  await supabase.channel(`user-${userId}`).send({
    type: 'broadcast',
    event: 'xp_awarded',
    payload: { xp: config.xp, total: newXP, level: newLevel, leveled_up: leveledUp }
  });
  
  return { awarded: true, xp: config.xp, total: newXP, leveled_up: leveledUp };
}
```

### 2.3 Level Calculation

```typescript
const LEVELS = [
  { level: 1, title: 'RECRUIT',    threshold: 0 },
  { level: 2, title: 'OPERATOR',   threshold: 200 },
  { level: 3, title: 'SPECIALIST', threshold: 600 },
  { level: 4, title: 'FIELD AGENT',threshold: 1400 },
  { level: 5, title: 'COMMAND',    threshold: 3000 },
  { level: 6, title: 'DIRECTOR',   threshold: 6000 },
  { level: 7, title: 'ARCHITECT',  threshold: 12000 },
];

function calculateLevel(xp: number): number {
  return LEVELS.filter(l => xp >= l.threshold).pop()?.level ?? 1;
}

function getLevelConfig(level: number) {
  return LEVELS.find(l => l.level === level);
}

function getXPToNextLevel(xp: number): { current: number; required: number; percentage: number } {
  const currentLevel = calculateLevel(xp);
  const current = LEVELS.find(l => l.level === currentLevel);
  const next = LEVELS.find(l => l.level === currentLevel + 1);
  if (!next) return { current: xp - (current?.threshold ?? 0), required: 0, percentage: 100 };
  
  const progress = xp - (current?.threshold ?? 0);
  const required = next.threshold - (current?.threshold ?? 0);
  return { current: progress, required, percentage: Math.floor((progress / required) * 100) };
}
```

---

## 3. Achievement Badge System

### 3.1 Badge Definitions

```typescript
type Badge = {
  id: string;
  label: string;
  description: string;
  check: (stats: OperatorStats) => boolean;
};

type OperatorStats = {
  tasks_complete_on_time: number;
  tasks_complete_early: number;
  first_pass_approvals_streak: number;
  login_streak: number;
  files_on_time: number;
  late_tasks: number;
  total_tasks: number;
};

const BADGES: Badge[] = [
  {
    id: 'FIRST_BLOOD',
    label: 'FIRST BLOOD',
    description: 'First task completed',
    check: (s) => s.total_tasks >= 1,
  },
  {
    id: 'EARLY_BIRD',
    label: 'EARLY BIRD',
    description: '5 tasks completed before deadline',
    check: (s) => s.tasks_complete_early >= 5,
  },
  {
    id: 'CLEAN_PASS',
    label: 'CLEAN PASS',
    description: '3 first-pass approvals in a row',
    check: (s) => s.first_pass_approvals_streak >= 3,
  },
  {
    id: 'STREAK_UNIT',
    label: 'STREAK UNIT',
    description: '14-day login streak',
    check: (s) => s.login_streak >= 14,
  },
  {
    id: 'DELIVERY_LOCKED',
    label: 'DELIVERY LOCKED',
    description: '10 files delivered on time',
    check: (s) => s.files_on_time >= 10,
  },
  {
    id: 'GHOST_MODE',
    label: 'GHOST MODE',
    description: '5 tasks completed — zero late flags',
    check: (s) => s.total_tasks >= 5 && s.late_tasks === 0,
  },
  {
    id: 'COMMS_CLEAR',
    label: 'COMMS CLEAR',
    description: 'First approval workflow completed',
    check: (s) => s.first_pass_approvals_streak >= 1,
  },
];
```

### 3.2 Badge Check (Server-Side, Post-XP-Award)

```typescript
async function checkAndAwardBadges(userId: string) {
  const stats = await getOperatorStats(userId);
  const { data: existing } = await supabase
    .from('achievements')
    .select('badge_id')
    .eq('user_id', userId);
  
  const existingIds = new Set(existing?.map(a => a.badge_id));
  
  for (const badge of BADGES) {
    if (!existingIds.has(badge.id) && badge.check(stats)) {
      await supabase.from('achievements').insert({
        user_id: userId,
        badge_id: badge.id,
      });
      // Broadcast badge unlock
      await supabase.channel(`user-${userId}`).send({
        type: 'broadcast',
        event: 'badge_unlocked',
        payload: { badge }
      });
    }
  }
}
```

---

## 4. XP Bar Component

```tsx
// XPBar.tsx
import { motion } from 'framer-motion';

interface XPBarProps {
  current: number;    // XP within current level
  required: number;   // XP needed for next level
  percentage: number; // 0–100
  animateFrom?: number; // previous percentage (for delta animation)
}

export function XPBar({ current, required, percentage, animateFrom = 0 }: XPBarProps) {
  return (
    <div className="xp-bar-container">
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: `${animateFrom}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0, 0, 1] }}
        />
        {/* Tick marks every 10% */}
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="xp-tick" style={{ left: `${(i + 1) * 10}%` }} />
        ))}
      </div>
      <div className="xp-readout">
        <span className="xp-current">{current}</span>
        <span className="xp-separator">/</span>
        <span className="xp-required">{required}</span>
        <span className="xp-unit">XP</span>
      </div>
    </div>
  );
}
```

```css
.xp-bar-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--crt-green);
}

.xp-bar-track {
  position: relative;
  height: 6px;
  background: rgba(57, 255, 20, 0.1);
  border: 1px solid rgba(57, 255, 20, 0.3);
  overflow: visible;
}

.xp-bar-fill {
  height: 100%;
  background: var(--crt-green);
  box-shadow: 0 0 6px var(--crt-green), 0 0 12px rgba(57, 255, 20, 0.4);
  position: relative;
}

/* Animated glow pulse on fill */
.xp-bar-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: -2px;
  width: 3px;
  height: calc(100% + 4px);
  background: white;
  opacity: 0.6;
  animation: xp-lead 2s ease-in-out infinite;
}

@keyframes xp-lead {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.2; }
}

.xp-tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(57, 255, 20, 0.2);
}

.xp-readout {
  display: flex;
  gap: 2px;
  opacity: 0.7;
}
```

---

## 5. XP Award Notification (Theatrics)

### 5.1 XP Delta Pop

When XP is awarded, a floating delta number appears and floats up:

```tsx
// XPDelta.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function XPDelta({ amount }: { amount: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="xp-delta"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -40, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

```css
.xp-delta {
  position: absolute;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--crt-green);
  text-shadow: 0 0 8px var(--crt-green);
  letter-spacing: 0.08em;
  pointer-events: none;
  z-index: 100;
}
```

### 5.2 Level-Up Sequence

Full orchestrated sequence on level-up event:

```typescript
async function playLevelUpSequence(newLevel: number, newTitle: string) {
  const screen = document.querySelector('.crt-screen');
  
  // Step 1: Screen flicker
  screen?.classList.add('crt-flicker-burst');
  await sleep(300);
  screen?.classList.remove('crt-flicker-burst');
  
  // Step 2: Signal noise flash
  const noiseEl = document.createElement('div');
  noiseEl.className = 'crt-noise-burst';
  screen?.appendChild(noiseEl);
  await sleep(200);
  noiseEl.remove();
  
  // Step 3: Typewriter reveal in overlay
  showLevelUpOverlay();
  await typewriteLines(overlayTerminal, [
    `> OPERATOR PROFILE UPDATE`,
    `> LEVEL ${newLevel} ACHIEVED`,
    `> DESIGNATION: ${newTitle}`,
    `> ACCESSING NEW CLEARANCES...`,
    `> DONE.`,
  ]);
  
  // Step 4: Badge slam (if badge also unlocked)
  await sleep(400);
  hideLevelUpOverlay();
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
```

### 5.3 Badge Unlock Animation

```css
@keyframes badge-slam {
  0%   { transform: translateY(-60px) scale(0.8); opacity: 0; }
  60%  { transform: translateY(4px) scale(1.05); opacity: 1; }
  80%  { transform: translateY(-2px) scale(0.98); }
  100% { transform: translateY(0) scale(1); }
}

.badge-icon.unlocking {
  animation: badge-slam 0.5s cubic-bezier(0.25, 0, 0, 1) forwards;
}
```

---

## 6. Leaderboard Component

```tsx
// Leaderboard.tsx
export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span>RANK</span>
        <span>OPERATOR</span>
        <span>LVL</span>
        <span>XP</span>
      </div>
      {entries.map((entry, i) => (
        <motion.div
          key={entry.user_id}
          className={`leaderboard-row ${i === 0 ? 'rank-1' : ''}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, ease: [0.25, 0, 0, 1] }}
        >
          <span className="rank">{String(i + 1).padStart(2, '0')}</span>
          <span className="name">{entry.username}</span>
          <span className="level">{entry.level}</span>
          <XPTickUp value={entry.xp} />
        </motion.div>
      ))}
    </div>
  );
}
```

### XP Tick-Up Counter

```tsx
// Counts up from 0 to value on mount
function XPTickUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.floor(eased * value));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  
  return <span className="xp-value">{display.toLocaleString()}</span>;
}
```

---

## 7. Leaderboard Unlock Gate

```typescript
// Check unlock condition: 3+ TEAM operators with activity in last 30 days
async function isLeaderboardUnlocked(orgId: string): Promise<boolean> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  
  const { count } = await supabase
    .from('xp_log')
    .select('user_id', { count: 'exact', head: true })
    .eq('org_id', orgId) // assuming xp_log has org_id join
    .gte('created_at', thirtyDaysAgo);
  
  return (count ?? 0) >= 3;
}
```

---

## 8. CSS Design — Hardware Aesthetic

```css
/* Badge icon rendering — looks like a physical medal/patch */
.badge-icon {
  width: 48px;
  height: 48px;
  border: 2px solid var(--hw-chrome);
  border-radius: 4px;
  background: var(--hw-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    0 2px 4px rgba(0,0,0,0.3);
}

.badge-icon.earned {
  border-color: var(--crt-green);
  box-shadow:
    inset 0 1px 0 rgba(57,255,20,0.1),
    0 0 8px rgba(57,255,20,0.3),
    0 2px 4px rgba(0,0,0,0.3);
}

.badge-icon.locked {
  opacity: 0.3;
  filter: grayscale(1);
}

/* Level badge pill */
.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid var(--hw-chrome);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--crt-green);
  text-shadow: 0 0 4px var(--crt-green);
  background: rgba(57, 255, 20, 0.05);
}

/* Leaderboard row */
.leaderboard-row {
  display: grid;
  grid-template-columns: 32px 1fr 40px 80px;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
  color: var(--crt-green);
}

.leaderboard-row.rank-1 {
  color: var(--crt-amber);
  text-shadow: 0 0 4px var(--crt-amber);
  border-left: 2px solid var(--crt-amber);
}
```

---

## 9. Anti-Patterns to Avoid

| Pattern | Why it fails | Alternative |
|---|---|---|
| XP for every click | Feels hollow, devalues currency | Only award for meaningful completion events |
| Celebration on every action | Notification fatigue | Reserve full theatrics for level-up + rare badges |
| Countdown timers for bonus XP | Feels manipulative | Streak bonus is passive — if you log in, you get it |
| Random loot / mystery boxes | Not appropriate for professional context | All rewards are deterministic and earned |
| Points leaderboard without context | Creates unhealthy competition | Show level title, not just raw number |
| Resetting progress | Demoralising | All-time XP always preserved; weekly view is additive |

---
*SKILL-GAMIFICATION.md — End*
