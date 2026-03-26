import React from 'react';
import { mockEngagements, getHealthTier } from '../../lib/engagementHealth';

/* ------------------------------------------------------------------ */
/*  Shared micro-components for module panel content                   */
/* ------------------------------------------------------------------ */

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontFamily: "'Owners Wide', sans-serif",
      fontSize: '11px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      opacity: 0.45,
    }}
  >
    {children}
  </span>
);

const Value: React.FC<{ children: React.ReactNode; large?: boolean }> = ({
  children,
  large,
}) => (
  <span
    style={{
      fontFamily: "'Kaio', sans-serif",
      fontWeight: 800,
      fontSize: large ? '36px' : '22px',
      lineHeight: 1,
      textTransform: 'uppercase',
    }}
  >
    {children}
  </span>
);

const Row: React.FC<{
  left: React.ReactNode;
  right?: React.ReactNode;
  muted?: boolean;
}> = ({ left, right, muted }) => (
  <div
    className="flex items-center justify-between"
    style={{
      padding: '10px 0',
      borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      opacity: muted ? 0.5 : 1,
    }}
  >
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '0.5px' }}>
      {left}
    </span>
    {right && (
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '0.5px', opacity: 0.6 }}>
        {right}
      </span>
    )}
  </div>
);

const StatusDot: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: color,
      marginRight: 8,
    }}
  />
);

const ProgressBar: React.FC<{ percent: number; color?: string }> = ({
  percent,
  color = '#000',
}) => (
  <div
    style={{
      height: 4,
      background: 'rgba(0,0,0,0.08)',
      borderRadius: 2,
      overflow: 'hidden',
      flex: 1,
      maxWidth: 80,
    }}
  >
    <div
      style={{
        width: `${percent}%`,
        height: '100%',
        background: color,
        borderRadius: 2,
      }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  TEAM modules                                                       */
/* ------------------------------------------------------------------ */

export const ActiveProjectsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>7</Value>
      <Label>active projects</Label>
    </div>
    <Row left={<><StatusDot color="#D7ABC5" />Nexus Brand Refresh</>} right="68%" />
    <Row left={<><StatusDot color="#6E93C3" />SCRIB3 Website Redesign</>} right="42%" />
    <Row left={<><StatusDot color="#000" />Token Launch Campaign</>} right="91%" />
    <Row left={<><StatusDot color="#D7ABC5" />MetaVerse Gallery Build</>} right="23%" />
    <Row left={<><StatusDot color="#6E93C3" />DAO Governance Docs</>} right="55%" muted />
  </div>
);

export const TaskQueueContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>12</Value>
      <Label>tasks pending</Label>
    </div>
    <Row left="Review brand guidelines v3" right="Today" />
    <Row left="Submit token copy to legal" right="Today" />
    <Row left="Wireframe mobile navigation" right="Tomorrow" />
    <Row left="Update style guide colours" right="Mar 28" />
    <Row left="Prepare client presentation" right="Mar 29" muted />
  </div>
);

export const TeamActivityContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <Row left="Ben updated Nexus Brand Refresh" right="2m ago" />
    <Row left="Sixtyne approved Q1 report" right="18m ago" />
    <Row left="CK pushed commit to SCRIB3-OS" right="1h ago" />
    <Row left="Nick reviewed Token Campaign" right="3h ago" />
    <Row left="Ben added 4 new files" right="5h ago" muted />
  </div>
);

export const InternalCommsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>3</Value>
      <Label>unread messages</Label>
    </div>
    <Row left="#general — Sprint standup notes" right="11:04" />
    <Row left="#design — New font specimen uploaded" right="10:22" />
    <Row left="#dev — CI pipeline fixed" right="09:15" />
    <Row left="#general — Team lunch Friday" right="Yesterday" muted />
  </div>
);

export const RecentFilesContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <Row left="brand-guidelines-v3.pdf" right="2.4 MB" />
    <Row left="token-launch-deck.pptx" right="8.1 MB" />
    <Row left="homepage-wireframe.fig" right="1.7 MB" />
    <Row left="q1-financials.xlsx" right="340 KB" />
    <Row left="team-photo-offsite.jpg" right="4.2 MB" muted />
  </div>
);

/* ------------------------------------------------------------------ */
/*  CLIENT modules                                                     */
/* ------------------------------------------------------------------ */

export const MyProjectsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>3</Value>
      <Label>active projects</Label>
    </div>
    <Row left={<><StatusDot color="#D7ABC5" />Brand Identity Package</>} right="In Progress" />
    <Row left={<><StatusDot color="#6E93C3" />Website Development</>} right="In Review" />
    <Row left={<><StatusDot color="#000" />Social Media Kit</>} right="Completed" muted />
  </div>
);

export const DeliverablesContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>4</Value>
      <Label>awaiting review</Label>
    </div>
    <Row left="Logo concepts — Round 2" right="Review by Mar 28" />
    <Row left="Landing page mockup" right="Review by Mar 30" />
    <Row left="Colour palette final" right="Approved" muted />
    <Row left="Brand voice document" right="Approved" muted />
  </div>
);

export const TimelineContent: React.FC = () => (
  <div className="flex flex-col gap-2">
    <Label>upcoming milestones</Label>
    <div className="flex flex-col gap-0 mt-2">
      <Row left={<><StatusDot color="#D7ABC5" />Logo Delivery</>} right="Mar 30" />
      <Row left={<><StatusDot color="#6E93C3" />Website Beta</>} right="Apr 12" />
      <Row left={<><StatusDot color="#000" />Launch Day</>} right="Apr 28" />
    </div>
  </div>
);

export const ApprovalsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>2</Value>
      <Label>pending approvals</Label>
    </div>
    <Row left="Homepage hero section" right="Awaiting" />
    <Row left="Typography system" right="Awaiting" />
    <Row left="Colour system" right="Approved ✓" muted />
  </div>
);

export const ContactContent: React.FC = () => (
  <div className="flex flex-col gap-3">
    <Label>your account manager</Label>
    <div className="flex items-center gap-3 mt-1">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EAF2D7',
          fontFamily: "'Kaio', sans-serif",
          fontWeight: 900,
          fontSize: '14px',
        }}
      >
        B
      </div>
      <div className="flex flex-col">
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', letterSpacing: '0.5px' }}>
          Ben Lydiatt
        </span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5, letterSpacing: '0.5px' }}>
          ben@scrib3.co
        </span>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  VENDOR modules                                                     */
/* ------------------------------------------------------------------ */

export const AssignedBriefsContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>3</Value>
      <Label>active briefs</Label>
    </div>
    <Row left={<><StatusDot color="#D7ABC5" />Illustration Set — Nexus</>} right="Due Apr 2" />
    <Row left={<><StatusDot color="#6E93C3" />Icon System — SCRIB3</>} right="Due Apr 8" />
    <Row left={<><StatusDot color="#000" />Motion Graphics — Token</>} right="Due Apr 15" />
  </div>
);

export const FileExchangeContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value>6</Value>
      <Label>files uploaded</Label>
    </div>
    <Row left="illustrations-batch-01.zip" right="12.4 MB" />
    <Row left="icon-wip-v2.fig" right="2.1 MB" />
    <Row left="motion-storyboard.pdf" right="890 KB" muted />
  </div>
);

export const DeadlinesContent: React.FC = () => (
  <div className="flex flex-col gap-2">
    <Label>upcoming deadlines</Label>
    <div className="flex flex-col gap-0 mt-2">
      <Row left="Illustration Set — Final" right="Apr 2" />
      <Row left="Icon System — Draft" right="Apr 5" />
      <Row left="Motion — Storyboard" right="Apr 10" />
      <Row left="Motion — Final Delivery" right="Apr 15" muted />
    </div>
  </div>
);

export const InvoiceStatusContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value large>$4,200</Value>
      <Label>outstanding</Label>
    </div>
    <Row left="INV-2026-041 — Illustrations" right="Pending" />
    <Row left="INV-2026-038 — Icons Phase 1" right="Paid ✓" muted />
    <Row left="INV-2026-035 — Onboarding" right="Paid ✓" muted />
  </div>
);

/* ------------------------------------------------------------------ */
/*  C-SUITE modules                                                    */
/* ------------------------------------------------------------------ */

export const PortfolioOverviewContent: React.FC = () => {
  const totalRemit = mockEngagements.reduce((a, e) => a + e.monthlyRemit, 0);
  const atRisk = mockEngagements.filter((e) => e.currentMarginPct < 20).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          <Value large>{mockEngagements.length}</Value>
          <Label>engagements</Label>
        </div>
        <div className="flex flex-col gap-1">
          <Value large>{atRisk}</Value>
          <Label>at risk</Label>
        </div>
        <div className="flex flex-col gap-1">
          <Value large>${(totalRemit / 1000).toFixed(0)}K</Value>
          <Label>monthly remit</Label>
        </div>
      </div>
      <div className="mt-2">
        {mockEngagements.slice(0, 3).map((e) => {
          const tier = getHealthTier(e.currentMarginPct);
          return (
            <Row
              key={e.id}
              left={<><StatusDot color={tier.color} />{e.clientName}</>}
              right={<ProgressBar percent={Math.max(0, e.currentMarginPct)} color={tier.color} />}
            />
          );
        })}
      </div>
    </div>
  );
};

export const RevenueContent: React.FC = () => {
  const totalBudgeted = mockEngagements.reduce((a, e) => a + e.totalBudgeted, 0);
  const totalSpend = mockEngagements.reduce((a, e) => a + e.totalSpend, 0);
  const totalSurplus = totalBudgeted - totalSpend;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          <Value large>${(totalBudgeted / 1000).toFixed(0)}K</Value>
          <Label>total budgeted</Label>
        </div>
        <div className="flex flex-col gap-1">
          <Value>{totalSurplus >= 0 ? '+' : ''}{`$${(totalSurplus / 1000).toFixed(1)}K`}</Value>
          <Label>surplus</Label>
        </div>
      </div>
      <div className="mt-2">
        {mockEngagements.slice(0, 3).map((e) => (
          <Row
            key={e.id}
            left={e.clientName}
            right={`$${(e.monthlyRemit / 1000).toFixed(0)}K/mo`}
          />
        ))}
        {mockEngagements.length > 3 && (
          <Row left={`+${mockEngagements.length - 3} more`} right="" muted />
        )}
      </div>
    </div>
  );
};

export const TeamUtilisationContent: React.FC = () => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3 mb-3">
      <Value large>76%</Value>
      <Label>avg utilisation</Label>
    </div>
    <Row left="Design" right={<ProgressBar percent={88} color="#D7ABC5" />} />
    <Row left="Development" right={<ProgressBar percent={72} color="#6E93C3" />} />
    <Row left="Strategy" right={<ProgressBar percent={65} />} />
    <Row left="Content" right={<ProgressBar percent={81} color="#D7ABC5" />} />
  </div>
);

export const ClientHealthContent: React.FC = () => {
  const sorted = [...mockEngagements].sort((a, b) => a.currentMarginPct - b.currentMarginPct);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-3">
        <Value>{mockEngagements.length}</Value>
        <Label>active engagements</Label>
      </div>
      {sorted.slice(0, 4).map((e) => {
        const tier = getHealthTier(e.currentMarginPct);
        return (
          <Row
            key={e.id}
            left={<><StatusDot color={tier.color} />{e.clientName}</>}
            right={`${tier.emoji} ${e.currentMarginPct.toFixed(0)}%`}
          />
        );
      })}
    </div>
  );
};

export const KeyMetricsContent: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    }}
  >
    <div className="flex flex-col gap-1">
      <Value>94%</Value>
      <Label>client retention</Label>
    </div>
    <div className="flex flex-col gap-1">
      <Value>4.2d</Value>
      <Label>avg turnaround</Label>
    </div>
    <div className="flex flex-col gap-1">
      <Value>$18K</Value>
      <Label>avg project value</Label>
    </div>
    <div className="flex flex-col gap-1">
      <Value>12</Value>
      <Label>team members</Label>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  ADMIN modules                                                      */
/* ------------------------------------------------------------------ */

export const SystemOverviewContent: React.FC = () => (
  <div className="flex flex-col gap-3">
    <div className="flex gap-6">
      <div className="flex flex-col gap-1">
        <Value>4</Value>
        <Label>registered users</Label>
      </div>
      <div className="flex flex-col gap-1">
        <Value>5</Value>
        <Label>active roles</Label>
      </div>
    </div>
    <div className="mt-1">
      <Row left={<><StatusDot color="#D7ABC5" />Supabase Auth</>} right="Connected" />
      <Row left={<><StatusDot color="#D7ABC5" />RLS Policies</>} right="14 Active" />
      <Row left={<><StatusDot color="#6E93C3" />DEVICE Layer</>} right="Available" />
      <Row left={<><StatusDot color="#000" />Google OAuth</>} right="Configured" muted />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Module ID → Content map                                            */
/* ------------------------------------------------------------------ */

export const moduleContentMap: Record<string, React.FC> = {
  // Team / Admin
  'active-projects': ActiveProjectsContent,
  'task-queue': TaskQueueContent,
  'team-activity': TeamActivityContent,
  'comms': InternalCommsContent,
  'recent-files': RecentFilesContent,
  // Client
  'my-projects': MyProjectsContent,
  'deliverables': DeliverablesContent,
  'timeline': TimelineContent,
  'approvals': ApprovalsContent,
  'contact': ContactContent,
  // Vendor
  'briefs': AssignedBriefsContent,
  'file-exchange': FileExchangeContent,
  'deadlines': DeadlinesContent,
  'invoices': InvoiceStatusContent,
  // Admin
  'system-overview': SystemOverviewContent,
  // C-Suite
  'portfolio': PortfolioOverviewContent,
  'revenue': RevenueContent,
  'utilisation': TeamUtilisationContent,
  'client-health': ClientHealthContent,
  'metrics': KeyMetricsContent,
};
