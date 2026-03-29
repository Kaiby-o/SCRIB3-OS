import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  mockEngagements,
  getHealthTier,
  simulateForecast,
  type EngagementHealth,
  type MonthlyBreakdown,
  type ForecastResult,
} from '../lib/engagementHealth';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const fmt = (n: number) => `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

/* ------------------------------------------------------------------ */
/*  Health Badge (same as overview)                                    */
/* ------------------------------------------------------------------ */

const HealthBadge: React.FC<{ marginPct: number; size?: 'sm' | 'lg' }> = ({
  marginPct,
  size = 'sm',
}) => {
  const tier = getHealthTier(marginPct);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'lg' ? 10 : 6,
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: size === 'lg' ? '16px' : '12px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        padding: size === 'lg' ? '8px 20px' : '4px 12px',
        borderRadius: '75.641px',
        background: `${tier.color}18`,
        border: `1px solid ${tier.color}40`,
      }}
    >
      <span>{tier.emoji}</span>
      <span>{tier.label}</span>
      <span style={{ opacity: 0.6 }}>{fmtPct(marginPct)}</span>
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Contract Info Cards                                                */
/* ------------------------------------------------------------------ */

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      background: 'var(--bg-surface)',
      border: '0.733px solid var(--border-default)',
      borderRadius: '10.258px',
      padding: '16px 20px',
    }}
  >
    <span
      style={{
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '10px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        opacity: 0.45,
        display: 'block',
        marginBottom: '6px',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "'Kaio', sans-serif",
        fontWeight: 800,
        fontSize: '18px',
        textTransform: 'uppercase',
      }}
    >
      {value}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Monthly Gantt Table                                                */
/* ------------------------------------------------------------------ */

const MonthlyTable: React.FC<{ months: MonthlyBreakdown[]; floorAmount: number }> = ({
  months,
  floorAmount,
}) => (
  <div
    style={{
      border: '0.733px solid var(--border-default)',
      borderRadius: '10.258px',
      overflow: 'auto',
    }}
  >
    <table
      style={{
        width: '100%',
        minWidth: '800px',
        borderCollapse: 'collapse',
        fontFamily: "'Owners Wide', sans-serif",
        fontSize: '12px',
        letterSpacing: '0.5px',
      }}
    >
      <thead>
        <tr style={{ borderBottom: '0.733px solid var(--border-default)' }}>
          <Th>Month</Th>
          <Th align="right">Budgeted</Th>
          <Th align="right">Team</Th>
          <Th align="right">Vendor</Th>
          <Th align="right">Expenses</Th>
          <Th align="right">Total Spend</Th>
          <Th align="right">Difference</Th>
          <Th align="right">Margin</Th>
          <Th align="right">Cumul. Diff</Th>
          <Th>Health</Th>
        </tr>
      </thead>
      <tbody>
        {months.map((m) => {
          const tier = getHealthTier(m.marginPct);
          const isFloorBreach = m.difference < -floorAmount;
          return (
            <tr
              key={m.month}
              style={{
                borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                background: isFloorBreach ? 'rgba(231,76,60,0.06)' : 'transparent',
              }}
            >
              <Td>{m.month}</Td>
              <Td align="right">{fmt(m.budgeted)}</Td>
              <Td align="right">{fmt(m.teamCosts)}</Td>
              <Td align="right">{fmt(m.vendorCosts)}</Td>
              <Td align="right">{fmt(m.expenses)}</Td>
              <Td align="right">{fmt(m.totalCost)}</Td>
              <Td align="right" color={m.difference >= 0 ? undefined : '#E74C3C'}>
                {m.difference >= 0 ? '+' : '-'}{fmt(m.difference)}
              </Td>
              <Td align="right">{fmtPct(m.marginPct)}</Td>
              <Td align="right" color={m.cumulativeDifference >= 0 ? undefined : '#E74C3C'}>
                {m.cumulativeDifference >= 0 ? '+' : '-'}{fmt(m.cumulativeDifference)}
              </Td>
              <Td>
                <span style={{ fontSize: '14px' }}>{tier.emoji}</span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const Th: React.FC<{ children: React.ReactNode; align?: string }> = ({ children, align }) => (
  <th
    style={{
      padding: '12px 14px',
      textAlign: (align as 'left' | 'right') ?? 'left',
      fontWeight: 400,
      opacity: 0.5,
      fontSize: '10px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; align?: string; color?: string }> = ({
  children,
  align,
  color,
}) => (
  <td
    style={{
      padding: '10px 14px',
      textAlign: (align as 'left' | 'right') ?? 'left',
      color: color ?? 'var(--text-primary)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </td>
);

/* ------------------------------------------------------------------ */
/*  SOW Forecast Simulator                                             */
/* ------------------------------------------------------------------ */

const ForecastSimulator: React.FC<{ engagement: EngagementHealth }> = ({ engagement }) => {
  const [revenueInput, setRevenueInput] = useState(engagement.monthlyRemit.toString());
  const [monthsAhead, setMonthsAhead] = useState(6);
  const [result, setResult] = useState<ForecastResult | null>(null);

  const runSimulation = () => {
    const revenue = parseFloat(revenueInput) || 0;
    setResult(simulateForecast(engagement, revenue, monthsAhead));
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '0.733px solid var(--border-default)',
        borderRadius: '10.258px',
        padding: '28px',
      }}
    >
      <h3
        style={{
          fontFamily: "'Kaio', sans-serif",
          fontWeight: 800,
          fontSize: '18px',
          textTransform: 'uppercase',
          margin: '0 0 6px 0',
        }}
      >
        SOW Forecast
      </h3>
      <p
        style={{
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '12px',
          opacity: 0.5,
          marginBottom: '20px',
        }}
      >
        "What if" mode — input any revenue figure to see projected margin and health tier.
      </p>

      <div className="flex gap-4 flex-wrap" style={{ marginBottom: '20px' }}>
        <div className="flex flex-col gap-1">
          <label
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '10px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            Monthly Revenue ($)
          </label>
          <input
            type="number"
            value={revenueInput}
            onChange={(e) => setRevenueInput(e.target.value)}
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '14px',
              background: 'var(--bg-primary)',
              border: '0.733px solid var(--border-default)',
              borderRadius: '75.641px',
              padding: '8px 16px',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '100%',
              maxWidth: '180px',
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '10px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            Months Ahead
          </label>
          <select
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '14px',
              background: 'var(--bg-primary)',
              border: '0.733px solid var(--border-default)',
              borderRadius: '75.641px',
              padding: '8px 16px',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              width: '100%',
              maxWidth: '120px',
            }}
          >
            {[3, 6, 9, 12].map((n) => (
              <option key={n} value={n}>{n} months</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={runSimulation}
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              background: '#000000',
              color: '#EAF2D7',
              border: 'none',
              borderRadius: '75.641px',
              padding: '10px 24px',
              cursor: 'pointer',
              transition: `opacity 0.2s ${easing}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Simulate
          </button>
        </div>
      </div>

      {result && (
        <div
          className="flex gap-6 flex-wrap"
          style={{
            padding: '20px',
            background: `${result.healthTier.color}10`,
            borderRadius: '10.258px',
            border: `1px solid ${result.healthTier.color}30`,
          }}
        >
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '22px' }}>
              {fmt(result.inputRevenue * monthsAhead)}
            </span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Total Revenue ({monthsAhead}m)
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '22px' }}>
              {fmt(result.projectedCost)}
            </span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Projected Cost
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              style={{
                fontFamily: "'Kaio', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: result.projectedSurplus >= 0 ? 'var(--text-primary)' : '#E74C3C',
              }}
            >
              {result.projectedSurplus >= 0 ? '+' : '-'}{fmt(result.projectedSurplus)}
            </span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Surplus
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '22px' }}>
              {fmtPct(result.projectedMarginPct)}
            </span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Projected Margin
            </span>
          </div>
          <div className="flex items-center">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: "'Owners Wide', sans-serif",
                fontSize: '14px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '8px 20px',
                borderRadius: '75.641px',
                background: `${result.healthTier.color}20`,
                border: `1px solid ${result.healthTier.color}50`,
              }}
            >
              <span style={{ fontSize: '18px' }}>{result.healthTier.emoji}</span>
              {result.healthTier.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const FinanceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const engagement = mockEngagements.find((e) => e.clientSlug === slug);

  if (!engagement) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '30px', textTransform: 'uppercase' }}>
          Engagement Not Found
        </h1>
        <button
          onClick={() => navigate('/finance')}
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '13px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#000',
            marginTop: '24px',
            padding: '10px 24px',
            border: '0.733px solid #000',
            borderRadius: '75.641px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          &larr; Back to Finance
        </button>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{
          position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px',
          padding: '0 40px',
          borderBottom: '0.733px solid var(--border-default)',
        }}
      >
        <button
          onClick={() => navigate('/finance')}
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
          {engagement.clientName} — Engagement Health
        </span>
        <button
          onClick={() => navigate('/finance')}
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
          &larr; All Engagements
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Title + Health badge */}
        <div className="flex items-center gap-4" style={{ marginBottom: '8px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: "'Kaio', sans-serif",
              fontWeight: 800,
              fontSize: isMobile ? '24px' : '36px',
              textTransform: 'uppercase',
              fontFeatureSettings: "'ordn' 1, 'dlig' 1",
              margin: 0,
            }}
          >
            {engagement.clientName}
          </h1>
          <HealthBadge marginPct={engagement.currentMarginPct} size="lg" />
        </div>
        <p
          style={{
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '13px',
            opacity: 0.5,
            marginBottom: '32px',
          }}
        >
          Account Lead: {engagement.accountLead} · {engagement.contractEndType === 'auto-renew-mtm' ? 'Auto-Renew (MTM)' : 'Fixed Term'} · {engagement.startDate} → {engagement.contractEnd}
        </p>

        {/* Contract info cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <InfoPill label="Monthly Remit" value={`$${engagement.monthlyRemit.toLocaleString()}`} />
          <InfoPill label="Target Margin" value={fmtPct(engagement.targetMarginPct)} />
          <InfoPill label="Safety Buffer" value={fmtPct(engagement.safetyBufferPct)} />
          <InfoPill label="Floor" value={fmt(engagement.floorAmount)} />
          <InfoPill label="Overhead" value={fmtPct(engagement.overheadPct)} />
          <InfoPill label="Avg $/Day" value={fmt(engagement.avgDailyRate)} />
          <InfoPill label="Total Surplus" value={`${engagement.totalSurplus >= 0 ? '+' : ''}${fmt(engagement.totalSurplus)}`} />
          <InfoPill label="Working Days" value={`${engagement.workingDaysPerMonth}/mo`} />
        </div>

        {/* Monthly Gantt breakdown */}
        <h2
          style={{
            fontFamily: "'Kaio', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            textTransform: 'uppercase',
            margin: '0 0 16px 0',
          }}
        >
          Monthly Breakdown
        </h2>
        <MonthlyTable months={engagement.months} floorAmount={engagement.floorAmount} />

        {/* SOW Forecast Simulator */}
        <div style={{ marginTop: '40px' }}>
          <ForecastSimulator engagement={engagement} />
        </div>
      </div>
    </div>
  );
};

export default FinanceDetailPage;
