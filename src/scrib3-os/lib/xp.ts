// ===== XP System =====
// Plan v4 — XP Events, Levels, and configuration
// Max level deliberately undefined at launch (cap at 999 for MVP)

export interface XPLevel {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  badge: string;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1, name: 'Builder', minXp: 0, maxXp: 99, badge: '🧱' },
  { level: 2, name: 'Creator', minXp: 100, maxXp: 299, badge: '✏️' },
  { level: 3, name: 'Strategist', minXp: 300, maxXp: 599, badge: '⚡' },
  { level: 4, name: 'Veteran', minXp: 600, maxXp: 999, badge: '🔥' },
  { level: 5, name: 'Legend', minXp: 1000, maxXp: Infinity, badge: '⭐' },
];

export function getLevel(xp: number): XPLevel {
  return XP_LEVELS.find((l) => xp >= l.minXp && xp <= l.maxXp) ?? XP_LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const level = getLevel(xp);
  if (level.maxXp === Infinity) return 100;
  const range = level.maxXp - level.minXp + 1;
  const progress = xp - level.minXp;
  return Math.min(Math.round((progress / range) * 100), 100);
}

export interface XPEvent {
  type: string;
  label: string;
  xp: number;
}

export const XP_EVENTS: XPEvent[] = [
  { type: 'task_complete', label: 'Complete a Linear task', xp: 5 },
  { type: 'task_priority', label: 'Complete a priority task', xp: 10 },
  { type: 'bandwidth_submit', label: 'Submit bandwidth estimate on time', xp: 5 },
  { type: 'agenda_submit', label: 'Submit pre-call agenda on time', xp: 5 },
  { type: 'oneone_complete', label: 'Complete a 1:1 call', xp: 10 },
  { type: 'goal_smart', label: 'Complete a SMART goal', xp: 25 },
  { type: 'goal_stretch', label: 'Achieve a Stretch goal', xp: 50 },
  { type: 'poe_received', label: 'Receive Proof of Excellence', xp: 20 },
  { type: 'feedback_praise', label: 'Receive Instant Feedback: Praise', xp: 10 },
  { type: 'client_recognition', label: 'Client recognition (logged in POE)', xp: 30 },
  { type: 'slack_recognition', label: 'Recognition emoji in #scrib3-core', xp: 5 },
  { type: 'feedback_give', label: 'Give Instant Feedback to peer', xp: 5 },
  { type: 'op_rating', label: 'Complete Operating Principles self-rating', xp: 15 },
  { type: 'poe_self', label: 'Log a Proof of Excellence (self)', xp: 10 },
  { type: 'challenge_win', label: 'Win a Team Challenge', xp: 100 },
  { type: 'onboarding', label: 'New team member onboarding completed', xp: 50 },
];

// Quick links for the floating widget (Plan v4 — confirmed from Figma node 2019:10529)
export interface QuickLink {
  label: string;
  icon: string;
  route: string;
}

export const QUICK_LINKS: QuickLink[] = [
  { label: 'Chat', icon: '💬', route: '/dashboard' },
  { label: 'Calendar', icon: '📅', route: '/dashboard' },
  { label: 'Office', icon: '👁', route: '/device' },
  { label: 'Dapps', icon: '🏆', route: '/tools' },
  { label: 'Bandwidth', icon: '🚩', route: '/bandwidth' },
  { label: 'Tasks', icon: '📄', route: '/projects' },
  { label: 'Feedback', icon: '↩️', route: '/dashboard' },
  { label: 'Prof Dev', icon: '👑', route: '/dashboard' },
];
