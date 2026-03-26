// ===== Bandwidth Estimates Types & Mock Data =====
// Plan v4 §3E — Bandwidth Estimates (Sixtyne)
// Replaces Fillout form at scrib3.fillout.com/traffic
// Team member selects: name, projects worked, estimated hours per project
// Hours × hourly rate = labour cost attributed to project
// Auto-send form link to #brand-internal Slack every Friday 5pm UTC
// Monday morning digest auto-generated → delivered to Ben + Elena

export interface BandwidthEntry {
  projectCode: string;
  projectName: string;
  clientName: string;
  estimatedHours: number;
  hourlyRate: number;
  labourCost: number; // hours × rate
}

export interface BandwidthEstimate {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  weekOf: string; // ISO date (Monday of week)
  entries: BandwidthEntry[];
  totalHours: number;
  totalCost: number;
  capacityPct: number; // totalHours / 40 * 100
  submittedAt: string;
}

export interface BandwidthDigest {
  weekOf: string;
  submissions: BandwidthEstimate[];
  teamAvgCapacity: number;
  highCapacity: BandwidthEstimate[]; // ≥80%
  missingSubmissions: string[]; // names who haven't submitted
  projectCostSummary: { projectCode: string; projectName: string; clientName: string; totalCost: number; totalHours: number }[];
}

const STANDARD_HOURS = 40;

function buildEstimate(
  id: string,
  name: string,
  weekOf: string,
  entries: Omit<BandwidthEntry, 'labourCost'>[],
  submittedAt: string,
): BandwidthEstimate {
  const full = entries.map((e) => ({ ...e, labourCost: e.estimatedHours * e.hourlyRate }));
  const totalHours = full.reduce((a, e) => a + e.estimatedHours, 0);
  return {
    id,
    teamMemberId: id,
    teamMemberName: name,
    weekOf,
    entries: full,
    totalHours,
    totalCost: full.reduce((a, e) => a + e.labourCost, 0),
    capacityPct: Math.round((totalHours / STANDARD_HOURS) * 100),
    submittedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  Mock data — week of 2026-03-23                                     */
/* ------------------------------------------------------------------ */

export const mockEstimates: BandwidthEstimate[] = [
  buildEstimate('bw-kevin', 'Kevin Moran', '2026-03-23', [
    { projectCode: 'RSK-001', projectName: 'Rootstock Refresh', clientName: 'Rootstock', estimatedHours: 18, hourlyRate: 85 },
    { projectCode: 'CDN-012', projectName: 'Cardano Q1', clientName: 'Cardano', estimatedHours: 12, hourlyRate: 85 },
    { projectCode: 'INT-001', projectName: 'Internal Brand', clientName: 'SCRIB3', estimatedHours: 6, hourlyRate: 85 },
  ], '2026-03-21T17:02:00Z'),

  buildEstimate('bw-sam', 'Samantha Kelly', '2026-03-23', [
    { projectCode: 'FT-005', projectName: 'Franklin Strategy', clientName: 'Franklin Templeton', estimatedHours: 20, hourlyRate: 95 },
    { projectCode: 'RSK-001', projectName: 'Rootstock Refresh', clientName: 'Rootstock', estimatedHours: 14, hourlyRate: 95 },
    { projectCode: 'MID-002', projectName: 'Midnight Launch', clientName: 'Midnight', estimatedHours: 8, hourlyRate: 95 },
  ], '2026-03-21T16:45:00Z'),

  buildEstimate('bw-cynthia', 'Cynthia Gentry', '2026-03-23', [
    { projectCode: 'CDN-014', projectName: 'Cardano Content', clientName: 'Cardano', estimatedHours: 16, hourlyRate: 75 },
    { projectCode: 'FT-005', projectName: 'Franklin Content', clientName: 'Franklin Templeton', estimatedHours: 14, hourlyRate: 75 },
    { projectCode: 'CTN-003', projectName: 'Canton Copy', clientName: 'Canton', estimatedHours: 8, hourlyRate: 75 },
  ], '2026-03-21T17:30:00Z'),

  buildEstimate('bw-tolani', 'Tolani Daniel', '2026-03-23', [
    { projectCode: 'CDN-012', projectName: 'Cardano Motion', clientName: 'Cardano', estimatedHours: 22, hourlyRate: 70 },
    { projectCode: 'RSK-003', projectName: 'Rootstock Motion', clientName: 'Rootstock', estimatedHours: 16, hourlyRate: 70 },
  ], '2026-03-21T18:10:00Z'),

  buildEstimate('bw-jake', 'Jake Embleton', '2026-03-23', [
    { projectCode: 'FT-005', projectName: 'Franklin Social', clientName: 'Franklin Templeton', estimatedHours: 20, hourlyRate: 65 },
    { projectCode: 'CDN-014', projectName: 'Cardano Social', clientName: 'Cardano', estimatedHours: 16, hourlyRate: 65 },
  ], '2026-03-21T16:55:00Z'),

  buildEstimate('bw-elena', 'Elena Zheng', '2026-03-23', [
    { projectCode: 'CDN-012', projectName: 'Cardano Acct Mgmt', clientName: 'Cardano', estimatedHours: 10, hourlyRate: 100 },
    { projectCode: 'FT-005', projectName: 'Franklin Acct Mgmt', clientName: 'Franklin Templeton', estimatedHours: 10, hourlyRate: 100 },
    { projectCode: 'CTN-003', projectName: 'Canton Acct Mgmt', clientName: 'Canton', estimatedHours: 8, hourlyRate: 100 },
    { projectCode: 'ROM-001', projectName: 'Rome Acct Mgmt', clientName: 'Rome Protocol', estimatedHours: 6, hourlyRate: 100 },
  ], '2026-03-21T15:20:00Z'),

  buildEstimate('bw-omar', 'Omar Anwar', '2026-03-23', [
    { projectCode: 'RSK-001', projectName: 'Rootstock Acct', clientName: 'Rootstock', estimatedHours: 12, hourlyRate: 90 },
    { projectCode: 'MID-002', projectName: 'Midnight Acct', clientName: 'Midnight', estimatedHours: 10, hourlyRate: 90 },
    { projectCode: 'RSK-004', projectName: 'Rootstock Collective', clientName: 'Rootstock Collective', estimatedHours: 8, hourlyRate: 90 },
  ], '2026-03-21T17:45:00Z'),
];

export const FULL_TEAM = [
  'Kevin Moran', 'Samantha Kelly', 'Cynthia Gentry', 'Tolani Daniel', 'Jake Embleton',
  'Elena Zheng', 'Omar Anwar', 'Amanda Eyer', 'Stef Luthin', 'Luke',
  'Matt Brannon', 'Jenny', 'Destini', 'Janelle', 'Hugh',
  'Kevin Arteaga', 'Madisen', 'Kim', 'Taylor Hadden',
];

export function buildDigest(estimates: BandwidthEstimate[], weekOf: string): BandwidthDigest {
  const submittedNames = estimates.map((e) => e.teamMemberName);
  const missing = FULL_TEAM.filter((n) => !submittedNames.includes(n));
  const avgCap = estimates.length > 0
    ? Math.round(estimates.reduce((a, e) => a + e.capacityPct, 0) / estimates.length)
    : 0;
  const high = estimates.filter((e) => e.capacityPct >= 80);

  // Aggregate by project
  const projectMap = new Map<string, { projectName: string; clientName: string; totalCost: number; totalHours: number }>();
  for (const est of estimates) {
    for (const entry of est.entries) {
      const existing = projectMap.get(entry.projectCode);
      if (existing) {
        existing.totalCost += entry.labourCost;
        existing.totalHours += entry.estimatedHours;
      } else {
        projectMap.set(entry.projectCode, {
          projectName: entry.projectName,
          clientName: entry.clientName,
          totalCost: entry.labourCost,
          totalHours: entry.estimatedHours,
        });
      }
    }
  }

  return {
    weekOf,
    submissions: estimates,
    teamAvgCapacity: avgCap,
    highCapacity: high,
    missingSubmissions: missing,
    projectCostSummary: Array.from(projectMap.entries())
      .map(([code, data]) => ({ projectCode: code, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost),
  };
}

export function getCapacityColor(pct: number): string {
  if (pct >= 100) return '#E74C3C';
  if (pct >= 80) return '#E67E22';
  if (pct >= 60) return '#F1C40F';
  return '#27AE60';
}
