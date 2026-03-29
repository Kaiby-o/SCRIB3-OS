import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  mockEngagements,
  getHealthTier,
  HEALTH_TIERS,
  type EngagementHealth,
  type HealthTierConfig,
} from '../lib/engagementHealth';
import { useSupabaseQuery } from '../hooks/useSupabase';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `$${n.toLocaleString()}`;

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Health Badge                                                       */
/* ------------------------------------------------------------------ */

const HealthBadge: React.FC<{ tier: HealthTierConfig; size?: 'sm' | 'md' }> = ({
  tier,
  size = 'sm',
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size === 'md' ? 8 : 5,
      fontFamily: "'Owners Wide', sans-serif",
      fontSize: size === 'md' ? '13px' : '11px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      padding: size === 'md' ? '6px 14px' : '4px 10px',
      borderRadius: '75.641px',
      background: `${tier.color}18`,
      border: `1px solid ${tier.color}40`,
    }}
  >
    <span>{tier.emoji}</span>
    <span>{tier.label}</span>
  </span>
);

/* ------------------------------------------------------------------ */
/*  Margin Bar                                                         */
/* ------------------------------------------------------------------ */

const MarginBar: React.FC<{ pct: number; width?: number }> = ({ pct, width = 100 }) => {
  const tier = getHealthTier(pct);
  const clampedPct = Math.max(0, Math.min(pct, 100));
  return (
    <div
      style={{
        width,
        height: 6,
        background: 'rgba(0,0,0,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clampedPct}%`,
          height: '100%',
          background: tier.color,
          borderRadius: 3,
          transition: `width 0.4s ${easing}`,
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Summary Stats                                                      */
/* ------------------------------------------------------------------ */

const SummaryStats: React.FC = () => {
  const totalBudgeted = mockEngagements.reduce((a, e) => a + e.totalBudgeted, 0);
  const totalSpend = mockEngagements.reduce((a, e) => a + e.totalSpend, 0);
  const totalSurplus = totalBudgeted - totalSpend;
  const avgMargin = totalBudgeted > 0 ? (totalSurplus / totalBudgeted) * 100 : 0;
  const monthlyRemitTotal = mockEngagements.reduce((a, e) => a + e.monthlyRemit, 0);
  const atRisk = mockEngagements.filter((e) => e.currentMarginPct < 20).length;

  return (
    <div
      className="flex gap-6 flex-wrap"
      style={{ marginBottom: '32px' }}
    >
      <StatCard value={fmt(monthlyRemitTotal)} label="Monthly Remit" sublabel="/month" />
      <StatCard value={fmt(totalBudgeted)} label="Total Budgeted" sublabel="All time" />
      <StatCard value={fmt(totalSpend)} label="Total Spend" sublabel="All time" />
      <StatCard
        value={fmt(totalSurplus)}
        label="Surplus"
        sublabel={totalSurplus >= 0 ? 'Healthy' : 'Deficit'}
        accent={totalSurplus < 0}
      />
      <StatCard value={fmtPct(avgMargin)} label="Avg Margin" sublabel={getHealthTier(avgMargin).label} />
      <StatCard value={atRisk.toString()} label="At Risk" sublabel="< 20% margin" accent={atRisk > 0} />
    </div>
  );
};

const StatCard: React.FC<{
  value: string;
  label: string;
  sublabel: string;
  accent?: boolean;
}> = ({ value, label, sublabel, accent }) => (
  <div className="flex flex-col gap-1">
    <span
      style={{
        fontFamily: "'Kaio', sans-serif",
        fontWeight: 800,
        fontSize: '28px',
        textTransform: 'uppercase',
        color: accent ? '#E74C3C' : 'var(--text-primary)',
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        opacity: 0.5,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '10px',
        letterSpacing: '0.5px',
        opacity: 0.35,
      }}
    >
      {sublabel}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Engagement Row                                                     */
/* ------------------------------------------------------------------ */

const EngagementRow: React.FC<{
  engagement: EngagementHealth;
  onClick: () => void;
}> = ({ engagement: e, onClick }) => {
  const tier = getHealthTier(e.currentMarginPct);
  const latestMonth = e.months[e.months.length - 1];

  return (
    <div
      className="flex items-center"
      onClick={onClick}
      style={{
        padding: '16px 24px',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: `background 0.15s ${easing}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Client */}
      <div style={{ width: '18%' }}>
        <span
          style={{
            fontFamily: "'Kaio', sans-serif",
            fontWeight: 800,
            fontSize: '14px',
            textTransform: 'uppercase',
          }}
        >
          {e.clientName}
        </span>
      </div>

      {/* Account Lead */}
      <div style={{ width: '14%' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
          {e.accountLead}
        </span>
      </div>

      {/* Monthly Remit */}
      <div style={{ width: '12%' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>
          {fmt(e.monthlyRemit)}
        </span>
      </div>

      {/* Latest Actual vs Budget */}
      <div style={{ width: '16%' }}>
        <div className="flex flex-col gap-1">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
            {latestMonth ? fmt(latestMonth.totalCost) : '—'} / {fmt(e.monthlyRemit)}
          </span>
          <span
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '10px',
              opacity: 0.5,
            }}
          >
            {latestMonth?.month ?? '—'}
          </span>
        </div>
      </div>

      {/* Surplus/Deficit */}
      <div style={{ width: '12%' }}>
        <span
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '13px',
            color: e.totalSurplus >= 0 ? 'var(--text-primary)' : '#E74C3C',
          }}
        >
          {e.totalSurplus >= 0 ? '+' : ''}{fmt(e.totalSurplus)}
        </span>
      </div>

      {/* Margin */}
      <div style={{ width: '14%' }}>
        <div className="flex items-center gap-2">
          <MarginBar pct={e.currentMarginPct} width={60} />
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
            {fmtPct(e.currentMarginPct)}
          </span>
        </div>
      </div>

      {/* Health */}
      <div style={{ width: '14%' }}>
        <HealthBadge tier={tier} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const FinanceOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Try Supabase engagement_health — aggregate by client
  const { data: dbHealth } = useSupabaseQuery<Record<string, unknown>>(
    'engagement_health', '*, client_profiles(slug, company_name)',
    undefined, { column: 'month', ascending: true }
  );

  // Build engagements from DB or fall back to mock
  const engagements: EngagementHealth[] = useMemo(() => {
    if (dbHealth.length > 0) {
      // Group by client
      const byClient = new Map<string, Record<string, unknown>[]>();
      for (const row of dbHealth) {
        const cp = row.client_profiles as Record<string, unknown> | null;
        const slug = cp?.slug as string ?? 'unknown';
        if (!byClient.has(slug)) byClient.set(slug, []);
        byClient.get(slug)!.push(row);
      }

      return Array.from(byClient.entries()).map(([slug, rows]) => {
        const cp = rows[0].client_profiles as Record<string, unknown>;
        const monthlyRemit = Number(rows[0].monthly_remit ?? 0);
        const months = rows.map((r) => ({
          month: new Date(r.month as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          budgeted: monthlyRemit,
          teamCosts: Number(r.team_costs ?? 0),
          vendorCosts: Number(r.vendor_costs ?? 0),
          expenses: Number(r.expense_costs ?? 0),
          totalCost: Number(r.team_costs ?? 0) + Number(r.vendor_costs ?? 0) + Number(r.expense_costs ?? 0),
          difference: monthlyRemit - (Number(r.team_costs ?? 0) + Number(r.vendor_costs ?? 0) + Number(r.expense_costs ?? 0)),
          marginPct: monthlyRemit > 0 ? ((monthlyRemit - (Number(r.team_costs ?? 0) + Number(r.vendor_costs ?? 0) + Number(r.expense_costs ?? 0))) / monthlyRemit) * 100 : 0,
          cumulativeBudget: 0, cumulativeSpend: 0, cumulativeDifference: 0,
        }));

        const totalBudgeted = months.reduce((a, m) => a + m.budgeted, 0);
        const totalSpend = months.reduce((a, m) => a + m.totalCost, 0);
        const totalSurplus = totalBudgeted - totalSpend;
        const currentMarginPct = totalBudgeted > 0 ? (totalSurplus / totalBudgeted) * 100 : 0;

        return {
          id: `eng-${slug}`,
          clientName: (cp?.company_name ?? slug) as string,
          clientSlug: slug,
          accountLead: '',
          startDate: '', contractEnd: '', contractEndType: 'auto-renew-mtm' as const,
          monthlyRemit, targetMarginPct: Number(rows[0].target_margin_pct ?? 30),
          safetyBufferPct: Number(rows[0].safety_buffer_pct ?? 10),
          overheadPct: Number(rows[0].overhead_pct ?? 15),
          workingDaysPerMonth: Number(rows[0].working_days ?? 22),
          avgDailyRate: monthlyRemit / 22,
          floorAmount: monthlyRemit * 0.1,
          months, currentMarginPct,
          currentHealth: getHealthTier(currentMarginPct).key,
          totalBudgeted, totalSpend, totalSurplus,
        } as EngagementHealth;
      });
    }
    return mockEngagements;
  }, [dbHealth]);

  // Sort by margin ascending (worst first)
  const sorted = [...engagements].sort((a, b) => a.currentMarginPct - b.currentMarginPct);

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{
          position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px',
          padding: isMobile ? '0 16px' : '0 40px',
          borderBottom: '0.733px solid var(--border-default)',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          Engagement Health
        </span>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            opacity: 0.5,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        >
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Title */}
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <h1
              style={{
                fontFamily: "'Kaio', sans-serif",
                fontWeight: 800,
                fontSize: isMobile ? '24px' : '32px',
                textTransform: 'uppercase',
                fontFeatureSettings: "'ordn' 1, 'dlig' 1",
                margin: 0,
              }}
            >
              Engagement Health
            </h1>
            <p
              style={{
                fontFamily: "'Owners Wide', sans-serif",
                fontSize: '13px',
                opacity: 0.5,
                marginTop: '8px',
              }}
            >
              Financial health across all active client engagements
            </p>
          </div>

          {/* Health tier legend */}
          <div className="flex gap-2">
            {HEALTH_TIERS.map((t) => (
              <HealthBadge key={t.key} tier={t} />
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <SummaryStats />

        {/* Engagements table */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: '700px' }}>
            <div
              style={{
                border: '0.733px solid var(--border-default)',
                borderRadius: '10.258px',
                overflow: 'hidden',
              }}
            >
              {/* Table header */}
              <div
                className="flex items-center"
                style={{
                  padding: '14px 24px',
                  borderBottom: '0.733px solid var(--border-default)',
                  opacity: 0.5,
                }}
              >
                <TH width="18%">Client</TH>
                <TH width="14%">Account Lead</TH>
                <TH width="12%">Monthly Remit</TH>
                <TH width="16%">Actual vs Budget</TH>
                <TH width="12%">Surplus</TH>
                <TH width="14%">Margin</TH>
                <TH width="14%">Health</TH>
              </div>

              {sorted.map((eng) => (
                <EngagementRow
                  key={eng.id}
                  engagement={eng}
                  onClick={() => navigate(`/finance/${eng.clientSlug}`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floor warning */}
        <p
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.5px',
            opacity: 0.35,
            marginTop: '24px',
            textAlign: 'center',
          }}
        >
          FLOOR: Do not let Difference exceed the safety buffer — means losing money
        </p>
      </div>
    </div>
  );
};

const TH: React.FC<{ width: string; children: React.ReactNode }> = ({ width, children }) => (
  <span
    style={{
      width,
      fontFamily: "'Owners Wide', sans-serif",
      fontSize: '11px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    }}
  >
    {children}
  </span>
);

export default FinanceOverviewPage;
