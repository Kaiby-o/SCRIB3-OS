# SCRIB3-OS — Product Requirements Document

> **Version:** 1.0 | **Date:** 2026-03-25 | **Status:** AWAITING APPROVAL
> **Scope:** SCRIB3-OS (the professional platform). This document does NOT cover SCRIB3-DEVICE.

---

## 1. Product Overview

SCRIB3-OS is a browser-native internal operating platform for SCRIB3, a Web3/brand/content agency. It provides role-based dashboards for team members, clients, vendors, and C-suite leadership. The design language is editorial-corporate with a warm organic palette — structured, clean, and professional. It sits in front of SCRIB3-DEVICE (the existing gamified admin layer), which is preserved as a gated admin tool.

---

## 2. User Roles

| Role | Access Level | Description | Example Users |
|------|-------------|-------------|---------------|
| `admin` | Full — OS + DEVICE | Product owner. Full platform access including DEVICE admin layer. | Ben Lydiatt |
| `team` | OS — full internal | SCRIB3 team members. All internal dashboards, team profiles, project views. | CK |
| `csuite` | OS — strategic | C-suite leadership. High-level project status, financial overview, team performance. | Sixtyne Perez, Nick Mitchell |
| `client` | OS — scoped | External clients. Their projects only — deliverables, timelines, approvals. | (TBD — seed later) |
| `vendor` | OS — scoped | External vendors/contractors. Assigned work, briefs, file exchange. | (TBD — seed later) |

### Role Hierarchy (access superset)

```
admin > csuite > team > client | vendor
```

`client` and `vendor` are parallel — neither is a superset of the other.

---

## 3. Page Inventory

| # | Route | Auth | Roles | Description |
|---|-------|------|-------|-------------|
| 1 | `/` | Public | All | Landing page — SCRIB3 branding, link to login |
| 2 | `/login` | Public | All | Shared login — email/password via Supabase |
| 3 | `/dashboard` | Auth | All roles | Role-gated dashboard — single layout, config-driven |
| 4 | `/profile/:id` | Auth | team, csuite, admin | Team member profile view |
| 5 | `/device` | Auth | admin only | Loads SCRIB3-DEVICE (existing gamified admin layer) |

---

## 4. User Stories

### 4.1 — All Users

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-01 | As a user, I can visit the landing page and understand what SCRIB3-OS is | Landing page renders with SCRIB3 branding, link to `/login` |
| US-02 | As a user, I can log in with email and password | Supabase auth, redirect to `/dashboard` on success, error message on failure |
| US-03 | As a user, I see a dashboard customised to my role after login | Dashboard renders role-specific nav items, module panels, and header label |
| US-04 | As a user, I can navigate via the pill nav bar | PillNav shows role-appropriate items from `dashboardConfig.ts` |
| US-05 | As a user, I can open the full-screen nav overlay | Hamburger `≡` opens Layer 1 (black, giant Kaio labels) |
| US-06 | As a user, I can drill into a nav category | Clicking a Layer 1 label opens Layer 2 (pink, sub-items) |
| US-07 | As a user, I can see my profile card | UserProfileCard shows avatar, name, role, XP bar (bottom-left) |
| US-08 | As a user, I can see the current local time | ClockDisplay renders in bottom-left area |
| US-09 | As a user, I can toggle dark/light mode | Toggle in NavOverlay Layer 1. Preference persists. |

### 4.2 — Team Members (`team`)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-10 | As a team member, I see team-specific dashboard modules | Dashboard shows: active projects, task queue, team activity, internal comms, recent files |
| US-11 | As a team member, I can view other team profiles | `/profile/:id` accessible, shows member info |
| US-12 | As a team member, I see TEAM/UNITS/CLIENTS/PROJECTS/CULTURE/TOOLS in nav overlay | Layer 1 categories match team config |

### 4.3 — Clients (`client`)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-13 | As a client, I see client-specific dashboard modules | Dashboard shows: my projects, deliverables, timeline, approvals, contact |
| US-14 | As a client, I only see my own project data | RLS restricts data to client's assigned projects |
| US-15 | As a client, I cannot access team profiles or internal tools | `/profile/:id` and internal nav items are hidden/blocked |

### 4.4 — Vendors (`vendor`)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-16 | As a vendor, I see vendor-specific dashboard modules | Dashboard shows: assigned briefs, file exchange, deadlines, invoicing status |
| US-17 | As a vendor, I only see my assigned work | RLS restricts data to vendor's assigned tasks |

### 4.5 — C-Suite (`csuite`)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-18 | As C-suite, I see strategic dashboard modules | Dashboard shows: portfolio overview, revenue tracking, team utilisation, client health, key metrics |
| US-19 | As C-suite, I can view all projects and team members | Full read access to projects, profiles |
| US-20 | As C-suite, I see high-level nav categories | Nav overlay adapted for strategic view |

### 4.6 — Admin (`admin`)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-21 | As admin, I can access SCRIB3-DEVICE at `/device` | Route loads existing DEVICE shell |
| US-22 | As admin, I have full OS access (superset of all roles) | All modules, all data, all nav items visible |

---

## 5. Dashboard Module Inventory

Modules are placeholder shells in Phase 1. Content will be populated with real data in future phases.

### Team Dashboard

| Module | Grid Position | Content (placeholder) |
|--------|--------------|----------------------|
| Active Projects | Top-left (wide) | Project cards with status indicators |
| Task Queue | Top-right | Prioritised task list |
| Team Activity | Middle-left | Recent activity feed |
| Internal Comms | Middle-right | Message previews |
| Recent Files | Bottom (full width) | File thumbnails with metadata |

### Client Dashboard

| Module | Grid Position | Content (placeholder) |
|--------|--------------|----------------------|
| My Projects | Top-left (wide) | Client's project cards |
| Deliverables | Top-right | Pending deliverables list |
| Timeline | Middle (full width) | Project milestone timeline |
| Approvals | Bottom-left | Items awaiting approval |
| Contact | Bottom-right | Account manager card |

### Vendor Dashboard

| Module | Grid Position | Content (placeholder) |
|--------|--------------|----------------------|
| Assigned Briefs | Top-left (wide) | Active brief cards |
| File Exchange | Top-right | Upload/download area |
| Deadlines | Middle-left | Upcoming due dates |
| Invoice Status | Middle-right | Payment tracking |
| Contact | Bottom (full width) | SCRIB3 point of contact |

### C-Suite Dashboard

| Module | Grid Position | Content (placeholder) |
|--------|--------------|----------------------|
| Portfolio Overview | Top (full width) | All projects, health indicators |
| Revenue | Middle-left | Revenue tracking chart |
| Team Utilisation | Middle-right | Capacity/allocation view |
| Client Health | Bottom-left | Client satisfaction scores |
| Key Metrics | Bottom-right | KPI summary cards |

---

## 6. Navigation Categories (per role)

Categories shown in NavOverlay Layer 1. Sub-items shown in Layer 2.

### Team / Admin

| Category | Sub-items |
|----------|-----------|
| TEAM | Directory, Profiles, Activity |
| UNITS | Business Units, Departments |
| CLIENTS | Client List, Onboarding |
| PROJECTS | Active, Archived, Proposals |
| CULTURE | Values, Events, Recognition |
| TOOLS | Resources, Templates, Integrations |

### C-Suite

| Category | Sub-items |
|----------|-----------|
| OVERVIEW | Portfolio, Metrics, Reports |
| TEAMS | Performance, Capacity, Hiring |
| CLIENTS | Health, Revenue, Pipeline |
| PROJECTS | Status, Risk, Roadmap |
| FINANCE | Revenue, Costs, Forecasts |
| STRATEGY | OKRs, Initiatives, Board |

### Client

| Category | Sub-items |
|----------|-----------|
| MY PROJECTS | Active, Completed |
| DELIVERABLES | Pending, Approved, Archive |
| TIMELINE | Milestones, Schedule |
| APPROVALS | Pending Review, History |
| SUPPORT | Contact, FAQs |

### Vendor

| Category | Sub-items |
|----------|-----------|
| BRIEFS | Active, Upcoming, Completed |
| FILES | Upload, Downloads, Archive |
| DEADLINES | Calendar, Overdue |
| INVOICES | Pending, Paid, Submit |
| SUPPORT | Contact, Guidelines |

---

## 7. Design Constraints

### Typography

| Token | Font | Weight | Size | Use |
|-------|------|--------|------|-----|
| displayHero | Kaio | 800 (Black) | 80px | Landing page hero |
| displayDash | Kaio | 800 (Black) | 30px | Nav category labels |
| displayName | Kaio | 900 (Super) | 15px | User profile name |
| body | Owners Wide | 400 | 20px | Primary body text |
| bodySml | Owners Wide | 400 | 16px | Secondary body text |
| pillNav | Owners Wide | 400 | 12.55px | Navigation pills |
| meta | NT Stardust | 400 | 3.5px | Bandwidth/status labels |
| time | Owners Wide | — | 18px | Clock display |

### Colour Palette (3 colours only)

| Token | Hex | Use |
|-------|-----|-----|
| offWhite | `#EAF2D7` | Primary background |
| black | `#000000` | Text, borders, nav overlay |
| pink | `#D7ABC5` | Accent, active states, subcategory overlay |

### Hard Rules

- No drop shadows
- No glassmorphism blur
- No colours outside the three-colour palette
- No web-safe or Google Fonts
- No decorative elements (pink figurative illustrations are brand assets, not UI)
- No drag-and-drop (static grid only)
- One `DashboardLayout.tsx` — never duplicate per role
- Role config in `dashboardConfig.ts` — not scattered in components
- All design tokens in `tokens.ts` + Tailwind extension — no hardcoded hex values

---

## 8. Technical Requirements

| Requirement | Specification |
|-------------|--------------|
| Stack | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS (OS layer only) |
| State | Zustand |
| Auth/DB | Supabase (existing project) |
| Routing | React Router |
| Deployment | Vercel (localhost first) |
| Font loading | Self-hosted `@font-face` in `public/fonts/` |
| Animation | CSS transitions + clip-path only (no animation libraries) |

---

## 9. Supabase Schema (additions to existing)

### `profiles` table — add column

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'team'
  CHECK (role IN ('admin', 'team', 'csuite', 'client', 'vendor'));
```

### RLS policies (see SKILL-RLS-SUPABASE.md for full spec)

- Profiles: users read own profile; team/csuite/admin read all internal profiles; clients/vendors read only own
- Projects: team/csuite/admin read all; clients read assigned; vendors read assigned
- Tasks: scoped by project assignment

---

## 10. Out of Scope

| Item | Reason |
|------|--------|
| SCRIB3-DEVICE modifications | Frozen — separate layer |
| Gamification (XP, badges, levels) | Lives in DEVICE layer |
| Drag-and-drop dashboard | Future Phase 2 |
| Real data integration | Placeholder content only in Phase 1 |
| Mobile-first responsive | Desktop-first; mobile flagged for later |
| Email notifications | Not in scope |
| File upload/download | Placeholder UI only |
| Approval workflows | Placeholder UI only |
| Real-time updates | Not in scope for Phase 1 |
| Vercel deployment | Localhost first |

---

## 11. Success Criteria

1. All 9 pages are navigable and render correctly
2. Login → role detection → correct dashboard loads
3. NavOverlay 3-layer system works with smooth transitions
4. Typography renders correctly (Kaio at all weights, Owners Wide, NT Stardust)
5. Colour palette is strictly 3 colours + translucent surface
6. Admin can access `/device` and see existing DEVICE layer
7. Non-admin users are blocked from `/device`
8. `npm run build` passes with zero errors
9. Single `DashboardLayout.tsx` serves all roles
