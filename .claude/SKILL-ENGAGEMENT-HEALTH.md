# SKILL: Engagement Health Calculator

> **Domain:** Finance — Client Engagement Profitability
> **Applies to:** SCRIB3-OS layer, `/finance` routes
> **Priority:** 🔴 Sixtyne — #1 from Plan v4 §3D

---

## Overview

Calculator/simulator for per-client financial health. No historical data to import — this is a forward-looking tool. Matches the Cardano Gantt CSV format from Notion $CRIB3.

---

## Health Tiers

| Tier | Emoji | Margin Range | Colour |
|------|-------|-------------|--------|
| Loss | 🔴 | ≤ 0% | `#E74C3C` |
| Break Even | 🟠 | 0–20% | `#E67E22` |
| Acceptable | 🟡 | 20–30% | `#F1C40F` |
| Healthy | 🟢 | 30–40% | `#27AE60` |
| Great | ⭐ | ≥ 40% | `#D7ABC5` |

---

## Per-Engagement Inputs

```
Project Name, Start Date, Contract End, Contract End Type (Auto-Renew MTM / Fixed)
Monthly Remit ($)
Target Margin % → $ target
Safety Buffer % → $ buffer
S3 Overhead % → $ overhead
Working Days in month → Average $/day
```

## Monthly Breakdown (Gantt format)

| Column | Formula |
|--------|---------|
| Budgeted | Monthly remit × months |
| Actual spend | Team costs + vendor + expenses |
| Difference | Budgeted − actual |
| FLOOR | Safety buffer amount — "Do not let Difference exceed this" |

## SOW Forecast Simulator

"What if" mode: input any revenue figure → see projected margin, surplus, health tier over N months. Uses average historical cost ratio.

## Views

- **CSuite dashboard module**: All engagements, one row each, health badge + margin % + monthly actual vs budget
- **`/finance`**: Full overview with summary stats, sorted by worst margin first
- **`/finance/:slug`**: Per-client monthly Gantt table + SOW simulator

## Data

- Source: `src/scrib3-os/lib/engagementHealth.ts`
- Currently mock — 6 priority clients (Cardano, Franklin Templeton, Rootstock, Rome Protocol, Midnight, Canton)
- Supabase table: `engagement_health` (see migration SQL)

## Access

- `/finance` — admin, csuite only
- C-Suite dashboard modules pull from same data
- Account leads see their clients only (future RLS)
