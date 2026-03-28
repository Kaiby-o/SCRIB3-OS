// ===== Dashboard Widgets — Management & Finance =====

import React from 'react';
import { mockTeam, availabilityColors } from '../../lib/team';
import { mockEngagements, getHealthTier } from '../../lib/engagementHealth';
import { mockBandwidthDigest, getCapacityColor } from '../../lib/bandwidth';
import { mockScopeWatch, frequencyColors } from '../../lib/scopeWatch';
import { mockVendors, mockInvoices } from '../../lib/vendors';
import { getLevel, getLevelProgress } from '../../lib/xp';

const L: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{children}</span>
);
const V: React.FC<{ children: React.ReactNode; lg?: boolean }> = ({ children, lg }) => (
  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: lg ? '36px' : '22px', lineHeight: 1, textTransform: 'uppercase' }}>{children}</span>
);
const R: React.FC<{ left: React.ReactNode; right?: React.ReactNode; muted?: boolean }> = ({ left, right, muted }) => (
  <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', opacity: muted ? 0.5 : 1 }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{left}</span>
    {right && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, flexShrink: 0, marginLeft: 8 }}>{right}</span>}
  </div>
);
const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, marginRight: 6 }} />
);
const Bar: React.FC<{ pct: number; color?: string }> = ({ pct, color = '#000' }) => (
  <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', flex: 1, maxWidth: 80 }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
  </div>
);

/* ===== M1 — Bandwidth Digest ===== */
export const BandwidthDigestContent: React.FC = () => {
  const digest = mockBandwidthDigest;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V>{Math.round(digest.teamAvgCapacity)}%</V><L>avg capacity</L></div>
      {digest.submissions.slice(0, 4).map((s) => (
        <div key={s.teamMemberName} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', flex: 1 }}>{s.teamMemberName}</span>
          <Bar pct={s.capacityPct} color={getCapacityColor(s.capacityPct)} />
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, marginLeft: 6, width: 30, textAlign: 'right' }}>{s.capacityPct}%</span>
        </div>
      ))}
      {digest.highCapacity.length > 0 && (
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: '#E74C3C', marginTop: 4 }}>
          {digest.highCapacity.length} at high capacity
        </span>
      )}
    </div>
  );
};

/* ===== M2 — Pending Approvals ===== */
export const PendingApprovalsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-2"><V>3</V><L>pending approvals</L></div>
    <R left={<><Dot color="#E67E22" />RSK-004 Pre-Alignment</>} right="2d ago" />
    <R left={<><Dot color="#F1C40F" />FT-005 Scope Change</>} right="1d ago" />
    <R left={<><Dot color="#6E93C3" />CDN-014 Deliverable</>} right="4h ago" />
  </div>
);

/* ===== M3 — Team Availability ===== */
export const TeamAvailabilityContent: React.FC = () => {
  const online = mockTeam.filter((m) => m.availability !== 'offline');
  return (
    <div>
      <div className="flex items-center gap-3 mb-2"><V>{online.length}</V><L>online</L></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '4px' }}>
        {mockTeam.slice(0, 12).map((m) => (
          <div key={m.id} className="flex items-center gap-1" style={{ padding: '3px 0' }}>
            <Dot color={availabilityColors[m.availability]} />
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===== M4 — Scope Watch Alerts ===== */
export const ScopeWatchAlertsContent: React.FC = () => {
  const frequent = mockScopeWatch.filter((s) => s.frequency === 'frequent');
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V>{frequent.length}</V><L>frequent alerts</L></div>
      {mockScopeWatch.slice(0, 4).map((s) => (
        <R key={s.id} left={<><Dot color={frequencyColors[s.frequency]} />{s.clientName} — {s.requestType.slice(0, 40)}...</>} right={s.frequency} />
      ))}
    </div>
  );
};

/* ===== M5 — 1:1 Upcoming ===== */
export const OneOnOneUpcomingContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <L>next 1:1 sessions</L>
    <R left={<><Dot color="#D7ABC5" />Sixtyne Perez</>} right="Apr 1 · 14:00" />
    <R left={<><Dot color="#6E93C3" />Nick Mitchell</>} right="Apr 3 · 10:00" />
    <R left={<><Dot color="#000" />Elena Zheng</>} right="Apr 4 · 15:30" />
  </div>
);

/* ===== M6 — Action Items Widget ===== */
export const ActionItemsWidgetContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-2"><V>5</V><L>open actions</L></div>
    <R left="Document onboarding process" right="Due Mar 28" />
    <R left="Involve account leads earlier" right="Due Apr 5" />
    <R left="Review scope watch entries" right="Due Apr 2" />
    <R left="Seed WGLL with examples" right="Complete" muted />
  </div>
);

/* ===== M7 — Pre-Alignment Queue ===== */
export const PreAlignmentQueueContent: React.FC = () => {
  const { mockProjects } = require('../../lib/projects');
  const missing = mockProjects.filter((p: { preAlignmentComplete: boolean; status: string }) => !p.preAlignmentComplete && p.status !== 'Completed');
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V>{missing.length}</V><L>missing alignment</L></div>
      {missing.map((p: { id: string; code: string; clientName: string }) => (
        <R key={p.id} left={<><Dot color="#E67E22" />{p.code} — {p.clientName}</>} right="Blocked" />
      ))}
    </div>
  );
};

/* ===== M8 — Team XP Progress ===== */
export const TeamXPProgressContent: React.FC = () => {
  const sorted = [...mockTeam].sort((a, b) => b.xp - a.xp).slice(0, 5);
  return (
    <div className="flex flex-col gap-1">
      <L>team xp</L>
      {sorted.map((m) => {
        const level = getLevel(m.xp);
        return (
          <div key={m.id} className="flex items-center gap-2" style={{ padding: '6px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', flex: 1 }}>{m.name}</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', opacity: 0.4 }}>Lvl {level.level}</span>
            <Bar pct={getLevelProgress(m.xp)} color="#D7ABC5" />
            <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '11px', fontWeight: 800, width: 35, textAlign: 'right' }}>{m.xp}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ===== F1 — Client Health Scorecard ===== */
export const ClientHealthScorecardContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <L>client health</L>
    {mockEngagements.map((e) => {
      const tier = getHealthTier(e.currentMarginPct);
      return <R key={e.id} left={<><Dot color={tier.color} />{e.clientName}</>} right={`${tier.emoji} ${e.currentMarginPct.toFixed(0)}%`} />;
    })}
  </div>
);

/* ===== F2 — Revenue Tracker ===== */
export const RevenueTrackerContent: React.FC = () => {
  const totalBudgeted = mockEngagements.reduce((a, e) => a + e.totalBudgeted, 0);
  const totalSpend = mockEngagements.reduce((a, e) => a + e.totalSpend, 0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-6">
        <div className="flex flex-col gap-1"><V lg>${(totalBudgeted / 1000).toFixed(0)}K</V><L>budgeted</L></div>
        <div className="flex flex-col gap-1"><V>${((totalBudgeted - totalSpend) / 1000).toFixed(1)}K</V><L>surplus</L></div>
      </div>
      {mockEngagements.slice(0, 3).map((e) => (
        <R key={e.id} left={e.clientName} right={`$${(e.monthlyRemit / 1000).toFixed(0)}K/mo`} />
      ))}
    </div>
  );
};

/* ===== F3 — At-Risk Clients ===== */
export const AtRiskClientsContent: React.FC = () => {
  const atRisk = mockEngagements.filter((e) => e.currentMarginPct < 20);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V>{atRisk.length}</V><L>at risk</L></div>
      {atRisk.length === 0 ? <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.4 }}>No clients at risk</span> :
        atRisk.map((e) => <R key={e.id} left={<><Dot color="#E74C3C" />{e.clientName}</>} right={`${e.currentMarginPct.toFixed(0)}% margin`} />)}
    </div>
  );
};

/* ===== F4 — Invoice Pipeline ===== */
export const InvoicePipelineContent: React.FC = () => {
  const byStatus = { submitted: 0, validated: 0, processing: 0, paid: 0 };
  mockInvoices.forEach((inv) => { if (inv.status in byStatus) byStatus[inv.status as keyof typeof byStatus]++; });
  return (
    <div className="flex flex-col gap-1">
      <L>invoice pipeline</L>
      <div className="flex gap-4 mt-2 mb-2">
        {Object.entries(byStatus).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1"><V>{v}</V><L>{k}</L></div>
        ))}
      </div>
    </div>
  );
};

/* ===== F5 — Outstanding Payments ===== */
export const OutstandingPaymentsContent: React.FC = () => {
  const unpaid = mockInvoices.filter((i) => i.status !== 'paid');
  const total = unpaid.reduce((a, i) => a + i.totalAmount, 0);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V lg>${total.toLocaleString()}</V><L>outstanding</L></div>
      {unpaid.slice(0, 3).map((i) => <R key={i.id} left={`${i.vendorName}`} right={`$${i.totalAmount.toLocaleString()}`} />)}
    </div>
  );
};

/* ===== F6 — Project P&L ===== */
export const ProjectPLContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <L>project p&l</L>
    {mockEngagements.slice(0, 4).map((e) => {
      const tier = getHealthTier(e.currentMarginPct);
      return (
        <div key={e.id} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', flex: 1 }}>{e.clientName}</span>
          <Bar pct={Math.max(0, e.currentMarginPct)} color={tier.color} />
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5, marginLeft: 6 }}>{e.currentMarginPct.toFixed(0)}%</span>
        </div>
      );
    })}
  </div>
);

/* ===== F7 — Labour Cost ===== */
export const LabourCostContent: React.FC = () => {
  const digest = mockBandwidthDigest;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2"><V lg>${(digest.submissions.reduce((a, s) => a + s.totalCost, 0) / 1000).toFixed(0)}K</V><L>weekly cost</L></div>
      {digest.submissions.slice(0, 4).map((s) => (
        <R key={s.teamMemberName} left={s.teamMemberName} right={`$${s.totalCost.toLocaleString()}`} />
      ))}
    </div>
  );
};

/* ===== F8 — Forecast ===== */
export const ForecastSimulatorContent: React.FC = () => {
  const totalRemit = mockEngagements.reduce((a, e) => a + e.monthlyRemit, 0);
  return (
    <div className="flex flex-col gap-2">
      <L>quarterly forecast</L>
      <div className="flex gap-4 mt-1">
        <div className="flex flex-col gap-1"><V>${(totalRemit * 3 / 1000).toFixed(0)}K</V><L>projected</L></div>
        <div className="flex flex-col gap-1"><V>${(totalRemit * 2.8 / 1000).toFixed(0)}K</V><L>conservative</L></div>
      </div>
    </div>
  );
};

/* ===== P1 — XP Leaderboard Mini ===== */
export const XPLeaderboardMiniContent: React.FC = () => {
  const top5 = [...mockTeam].sort((a, b) => b.xp - a.xp).slice(0, 5);
  return (
    <div className="flex flex-col gap-0">
      <L>xp leaderboard</L>
      {top5.map((m, i) => (
        <R key={m.id} left={<><span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '10px', fontWeight: 800, width: 16 }}>#{i + 1}</span>{m.name}</>} right={`${m.xp} XP`} />
      ))}
    </div>
  );
};

/* ===== P2 — Recent Dapps ===== */
export const RecentDappsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <L>recent dapps</L>
    <R left="Sixtyne → Ben: Outstanding OS build" right="2h ago" />
    <R left="Elena → Kevin: Brand refresh was perfect" right="1d ago" />
    <R left="Nick → Sam: Strategy deck was sharp" right="2d ago" />
  </div>
);

/* ===== P5 — Happiness Pulse ===== */
export const HappinessPulseContent: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3"><V lg>7.2</V><L>/ 10 avg happiness</L></div>
    <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: '72%', height: '100%', background: '#27AE60', borderRadius: 3 }} />
    </div>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>Based on 12 self-assessment responses</span>
  </div>
);

/* ===== Client Portal Variants ===== */
export const ClientAnnouncementsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <L>announcements</L>
    <R left="Your Q1 report is ready for review" right="1d ago" />
    <R left="New deliverable uploaded — Logo concepts v2" right="3d ago" />
  </div>
);

export const ClientActivityContent: React.FC = () => (
  <div className="flex flex-col gap-0">
    <R left="Ben uploaded Logo concepts v2" right="2h ago" />
    <R left="Kevin completed brand refresh assets" right="1d ago" />
    <R left="Elena updated project timeline" right="2d ago" />
  </div>
);

export const ClientEventsContent: React.FC = () => (
  <div className="flex flex-col gap-0">
    <L>upcoming</L>
    <R left={<><Dot color="#D7ABC5" />QBR Presentation</>} right="Apr 2" />
    <R left={<><Dot color="#6E93C3" />Deliverable Review</>} right="Apr 8" />
  </div>
);

export const ClientNotificationsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-2"><V>2</V><L>new notifications</L></div>
    <R left="Approval requested: Homepage hero" right="4h ago" />
    <R left="New comment on brand guidelines" right="1d ago" />
  </div>
);

export const ClientSearchContent: React.FC = () => (
  <div>
    <input placeholder="Search your projects, deliverables..."
      style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '75.641px', padding: '8px 14px', outline: 'none', width: '100%' }} />
  </div>
);

export const ClientContentCalendarContent: React.FC = () => (
  <div className="flex flex-col gap-0">
    <L>your content this week</L>
    <R left="Blog: Q1 Results Summary" right="Mon" />
    <R left="Social: Campaign Launch Thread" right="Wed" />
    <R left="Newsletter: Monthly Digest" right="Fri" />
  </div>
);

export const ClientActionItemsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-2"><V>2</V><L>action items</L></div>
    <R left="Review and approve logo concepts" right="Due Apr 2" />
    <R left="Provide brand voice feedback" right="Due Apr 5" />
  </div>
);
