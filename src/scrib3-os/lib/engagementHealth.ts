// ===== Engagement Health Types & Mock Data =====
// Matches Plan v4 §3D — Engagement Health Calculator
// Health tiers from Notion $CRIB3: 🔴 Loss → 🟠 Break Even → 🟡 Acceptable → 🟢 Healthy → ⭐ Great

export type HealthTier = 'loss' | 'break-even' | 'acceptable' | 'healthy' | 'great';

export interface HealthTierConfig {
  key: HealthTier;
  label: string;
  emoji: string;
  color: string;
  minMargin: number; // inclusive
  maxMargin: number; // exclusive (Infinity for top tier)
}

export const HEALTH_TIERS: HealthTierConfig[] = [
  { key: 'loss',         label: 'Loss',        emoji: '🔴', color: '#E74C3C', minMargin: -Infinity, maxMargin: 0 },
  { key: 'break-even',   label: 'Break Even',  emoji: '🟠', color: '#E67E22', minMargin: 0,         maxMargin: 20 },
  { key: 'acceptable',   label: 'Acceptable',  emoji: '🟡', color: '#F1C40F', minMargin: 20,        maxMargin: 30 },
  { key: 'healthy',      label: 'Healthy',     emoji: '🟢', color: '#27AE60', minMargin: 30,        maxMargin: 40 },
  { key: 'great',        label: 'Great',       emoji: '⭐', color: '#D7ABC5', minMargin: 40,        maxMargin: Infinity },
];

export function getHealthTier(marginPct: number): HealthTierConfig {
  return HEALTH_TIERS.find(
    (t) => marginPct >= t.minMargin && marginPct < t.maxMargin,
  ) ?? HEALTH_TIERS[0];
}

export interface MonthlyBreakdown {
  month: string;        // e.g. "Jan 2026"
  budgeted: number;     // monthly remit
  teamCosts: number;
  vendorCosts: number;
  expenses: number;
  totalCost: number;    // team + vendor + expenses
  difference: number;   // budgeted - totalCost
  marginPct: number;
  cumulativeBudget: number;
  cumulativeSpend: number;
  cumulativeDifference: number;
}

export interface EngagementHealth {
  id: string;
  clientName: string;
  clientSlug: string;
  accountLead: string;
  // Contract
  startDate: string;
  contractEnd: string;
  contractEndType: 'auto-renew-mtm' | 'fixed';
  // Financials
  monthlyRemit: number;
  targetMarginPct: number;
  safetyBufferPct: number;
  overheadPct: number;
  workingDaysPerMonth: number;
  // Computed top-level
  avgDailyRate: number;
  floorAmount: number;
  // Monthly data
  months: MonthlyBreakdown[];
  // Current health
  currentMarginPct: number;
  currentHealth: HealthTier;
  totalBudgeted: number;
  totalSpend: number;
  totalSurplus: number;
}

/* ------------------------------------------------------------------ */
/*  Helper: compute monthly data                                       */
/* ------------------------------------------------------------------ */

function computeMonths(
  monthlyRemit: number,
  _targetMarginPct: number,
  _safetyBufferPct: number,
  _overheadPct: number,
  monthData: { month: string; teamCosts: number; vendorCosts: number; expenses: number }[],
): MonthlyBreakdown[] {
  let cumulativeBudget = 0;
  let cumulativeSpend = 0;

  return monthData.map((m) => {
    const budgeted = monthlyRemit;
    const totalCost = m.teamCosts + m.vendorCosts + m.expenses;
    const difference = budgeted - totalCost;
    const marginPct = budgeted > 0 ? ((budgeted - totalCost) / budgeted) * 100 : 0;

    cumulativeBudget += budgeted;
    cumulativeSpend += totalCost;

    return {
      month: m.month,
      budgeted,
      teamCosts: m.teamCosts,
      vendorCosts: m.vendorCosts,
      expenses: m.expenses,
      totalCost,
      difference,
      marginPct,
      cumulativeBudget,
      cumulativeSpend,
      cumulativeDifference: cumulativeBudget - cumulativeSpend,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Mock data — 6 priority clients from Plan v4 §3A                    */
/* ------------------------------------------------------------------ */

function buildEngagement(
  id: string,
  clientName: string,
  clientSlug: string,
  accountLead: string,
  startDate: string,
  contractEnd: string,
  contractEndType: 'auto-renew-mtm' | 'fixed',
  monthlyRemit: number,
  targetMarginPct: number,
  safetyBufferPct: number,
  overheadPct: number,
  workingDaysPerMonth: number,
  monthData: { month: string; teamCosts: number; vendorCosts: number; expenses: number }[],
): EngagementHealth {
  const months = computeMonths(monthlyRemit, targetMarginPct, safetyBufferPct, overheadPct, monthData);
  const totalBudgeted = months.reduce((a, m) => a + m.budgeted, 0);
  const totalSpend = months.reduce((a, m) => a + m.totalCost, 0);
  const totalSurplus = totalBudgeted - totalSpend;
  const currentMarginPct = totalBudgeted > 0 ? (totalSurplus / totalBudgeted) * 100 : 0;
  const floorAmount = monthlyRemit * (safetyBufferPct / 100);
  const avgDailyRate = monthlyRemit / workingDaysPerMonth;

  return {
    id,
    clientName,
    clientSlug,
    accountLead,
    startDate,
    contractEnd,
    contractEndType,
    monthlyRemit,
    targetMarginPct,
    safetyBufferPct,
    overheadPct,
    workingDaysPerMonth,
    avgDailyRate,
    floorAmount,
    months,
    currentMarginPct,
    currentHealth: getHealthTier(currentMarginPct).key,
    totalBudgeted,
    totalSpend,
    totalSurplus,
  };
}

export const mockEngagements: EngagementHealth[] = [
  buildEngagement(
    'eng-cardano', 'Cardano', 'cardano', 'Elena Zheng',
    '2025-06-01', '2026-06-01', 'auto-renew-mtm',
    45000, 35, 10, 15, 22,
    [
      { month: 'Oct 2025', teamCosts: 18500, vendorCosts: 4200, expenses: 1800 },
      { month: 'Nov 2025', teamCosts: 19200, vendorCosts: 3800, expenses: 2100 },
      { month: 'Dec 2025', teamCosts: 17800, vendorCosts: 5100, expenses: 1500 },
      { month: 'Jan 2026', teamCosts: 20100, vendorCosts: 4500, expenses: 2200 },
      { month: 'Feb 2026', teamCosts: 19800, vendorCosts: 3900, expenses: 1900 },
      { month: 'Mar 2026', teamCosts: 21200, vendorCosts: 4800, expenses: 2400 },
    ],
  ),
  buildEngagement(
    'eng-franklin', 'Franklin Templeton', 'franklin-templeton', 'Elena Zheng',
    '2025-09-01', '2026-09-01', 'fixed',
    60000, 35, 10, 15, 22,
    [
      { month: 'Oct 2025', teamCosts: 22000, vendorCosts: 8500, expenses: 3200 },
      { month: 'Nov 2025', teamCosts: 24500, vendorCosts: 7200, expenses: 2800 },
      { month: 'Dec 2025', teamCosts: 21800, vendorCosts: 9000, expenses: 3500 },
      { month: 'Jan 2026', teamCosts: 25200, vendorCosts: 8100, expenses: 2600 },
      { month: 'Feb 2026', teamCosts: 23400, vendorCosts: 7800, expenses: 3100 },
      { month: 'Mar 2026', teamCosts: 26100, vendorCosts: 8900, expenses: 3400 },
    ],
  ),
  buildEngagement(
    'eng-rootstock', 'Rootstock', 'rootstock', 'Omar Anwar',
    '2025-07-01', '2026-07-01', 'auto-renew-mtm',
    35000, 30, 10, 15, 22,
    [
      { month: 'Oct 2025', teamCosts: 14200, vendorCosts: 3500, expenses: 1200 },
      { month: 'Nov 2025', teamCosts: 15100, vendorCosts: 2800, expenses: 1500 },
      { month: 'Dec 2025', teamCosts: 13800, vendorCosts: 4200, expenses: 1100 },
      { month: 'Jan 2026', teamCosts: 16200, vendorCosts: 3100, expenses: 1800 },
      { month: 'Feb 2026', teamCosts: 14800, vendorCosts: 3600, expenses: 1400 },
      { month: 'Mar 2026', teamCosts: 15500, vendorCosts: 3800, expenses: 1600 },
    ],
  ),
  buildEngagement(
    'eng-rome', 'Rome Protocol', 'rome-protocol', 'Elena Zheng',
    '2025-11-01', '2026-05-01', 'fixed',
    25000, 35, 10, 15, 22,
    [
      { month: 'Dec 2025', teamCosts: 10200, vendorCosts: 2500, expenses: 800 },
      { month: 'Jan 2026', teamCosts: 11500, vendorCosts: 2800, expenses: 1100 },
      { month: 'Feb 2026', teamCosts: 10800, vendorCosts: 3200, expenses: 900 },
      { month: 'Mar 2026', teamCosts: 12100, vendorCosts: 2600, expenses: 1200 },
    ],
  ),
  buildEngagement(
    'eng-midnight', 'Midnight', 'midnight', 'Omar Anwar',
    '2026-01-01', '2026-12-31', 'fixed',
    30000, 30, 10, 15, 22,
    [
      { month: 'Jan 2026', teamCosts: 12500, vendorCosts: 3200, expenses: 1500 },
      { month: 'Feb 2026', teamCosts: 13800, vendorCosts: 2900, expenses: 1200 },
      { month: 'Mar 2026', teamCosts: 14200, vendorCosts: 3500, expenses: 1800 },
    ],
  ),
  buildEngagement(
    'eng-canton', 'Canton', 'canton', 'Elena Zheng',
    '2025-08-01', '2026-08-01', 'auto-renew-mtm',
    20000, 30, 10, 15, 22,
    [
      { month: 'Oct 2025', teamCosts: 9800, vendorCosts: 1500, expenses: 600 },
      { month: 'Nov 2025', teamCosts: 10200, vendorCosts: 1800, expenses: 800 },
      { month: 'Dec 2025', teamCosts: 9500, vendorCosts: 2100, expenses: 500 },
      { month: 'Jan 2026', teamCosts: 11200, vendorCosts: 1600, expenses: 900 },
      { month: 'Feb 2026', teamCosts: 10500, vendorCosts: 1900, expenses: 700 },
      { month: 'Mar 2026', teamCosts: 11800, vendorCosts: 2200, expenses: 1100 },
    ],
  ),
];

/* ------------------------------------------------------------------ */
/*  SOW Forecast Simulator                                             */
/* ------------------------------------------------------------------ */

export interface ForecastResult {
  inputRevenue: number;
  projectedCost: number;
  projectedMarginPct: number;
  projectedSurplus: number;
  healthTier: HealthTierConfig;
}

export function simulateForecast(
  engagement: EngagementHealth,
  revenueOverride: number,
  monthsAhead: number = 6,
): ForecastResult {
  // Use average cost ratio from historical months
  const avgMonthlySpend =
    engagement.months.length > 0
      ? engagement.months.reduce((a, m) => a + m.totalCost, 0) / engagement.months.length
      : engagement.monthlyRemit * 0.65;

  const projectedCost = avgMonthlySpend * monthsAhead;
  const totalRevenue = revenueOverride * monthsAhead;
  const projectedSurplus = totalRevenue - projectedCost;
  const projectedMarginPct = totalRevenue > 0 ? (projectedSurplus / totalRevenue) * 100 : 0;

  return {
    inputRevenue: revenueOverride,
    projectedCost,
    projectedMarginPct,
    projectedSurplus,
    healthTier: getHealthTier(projectedMarginPct),
  };
}
