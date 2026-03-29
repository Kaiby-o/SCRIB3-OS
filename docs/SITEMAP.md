# SCRIB3-OS Site Map

> **URL:** s3-os.com | **Generated:** 2026-03-29

---

## Public Routes (No Auth)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Splash screen with SCRIB3 logo, ENTER button → login dialog, burger menu → nav overlay with external links + Let's Talk contact form |
| `/login` | Redirect | Redirects to `/` |

---

## Auth-Gated — All Roles

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/dashboard` | Dashboard | all roles | Role-gated dashboard with modular widgets (drag-and-drop on desktop, stacked on mobile). 5 variants: team, client, vendor, csuite, admin |
| `/profile/:id` | Profile | all roles | User profile page — avatar, name, role, XP bar, info cards. Auto-redirects to own profile if no ID |
| `/portal/:slug` | Client Portal | all roles | Client-facing branded portal — project status, deliverables, team, contract, announcements, asset library, content calendar. Themed per client brand colour |
| `/profdev` | PD Hub | all roles | Professional development hub — goals, proof of excellence, feedback |
| `/chat` | Chat | all roles | Real-time chat with Supabase — channels, @mentions, emoji reactions |
| `/systems-map` | Systems Map | all roles | Interactive SVG node-and-connector map of SCRIB3's operational systems. Pan, zoom, layer filters, journey overlays |
| `/feedback` | Feedback | all roles | Team feedback submission and history |
| `/dapps` | Shoutouts | all roles | Team recognition/shoutout board |
| `/tasks` | Tasks | all roles | Linear integration — live issue tracking with 30s auto-refresh, status columns, issue detail panel, new issue creation |
| `/settings` | Settings | all roles | User settings — widget toggles, preferences |
| `/office` | Virtual Office | ben.lydiat@scrib3.co only | Phaser 3 virtual office — multiplayer, interactive objects, sitting, emotes. All other users see "Coming Soon" |
| `/battle/*` | Battle Module | all roles | RPG battle system — team selection, turn-based combat with SFX |

---

## Auth-Gated — Team, Admin, C-Suite

| Route | Page | Description |
|-------|------|-------------|
| `/team` | Team Directory | Filterable directory of 29 team members with availability, role, unit |
| `/team/:id` | Team Profile | Full team profile — bio, skills, clients, projects, social links |
| `/pd/:id` | PD Tracker | Professional development tracker — 4 tabs (goals, POE, feedback, history) |
| `/clients` | Client Directory | Client list with status filters, stats row, search. 6 priority clients |
| `/clients/onboard` | Client Onboarding | 4-step wizard: Discovery → Agreement → Setup → Kickoff |
| `/clients/:slug/hub` | Client Hub | Internal client hub — 5 tabs (overview, projects, services, contacts, notes) |
| `/projects` | Project Registry | 10 projects, filterable by status/client/search. Table with code, client, status, type, lead, alignment |
| `/projects/:code` | Project Detail | Per-project detail — info cards, tab content, alignment status |
| `/units` | Unit Dashboards | 5 unit views (Accounts, Brand, Media, Ops, PR) with per-unit metrics and tables |
| `/finance` | Finance Overview | Engagement health overview — 6 priority clients, margin bars, health tiers (admin/csuite only) |
| `/finance/:slug` | Finance Detail | Per-client Gantt + SOW forecast simulator — monthly breakdown, health badges (admin/csuite only) |
| `/vendors` | Vendor Management | Tabbed view: Vendors table (onboarding status) + Invoices table (status pipeline). Horizontal scroll on mobile |
| `/vendors/onboard` | Vendor Onboarding | Multi-step vendor onboarding form |
| `/pre-alignment` | Pre-Alignment | Mandatory project alignment checklist — 17 fields + 5-bullet brief + comprehension loop |
| `/bandwidth` | Bandwidth | Team bandwidth estimates — digest builder, capacity tracking, 7 members |
| `/scope-watch` | Scope Watch | 9 scope watch entries across 5 clients — expandable cards, frequency badges |
| `/resources/what-good-looks-like` | WGLL | Quality standards library — 10 sections of reference material |
| `/culture` | Culture Hub | Operating principles, XP leaderboard, culture book, proof of excellence |
| `/tools` | Tools Directory | 13 internal tools with descriptions, links, categories |
| `/approvals` | Approvals | Pending approval queue — deliverables, scope changes, pre-alignment reviews |

---

## Admin Only — DEVICE Layer

| Route | Page | Description |
|-------|------|-------------|
| `/device` | Device Dashboard | Gamified CRT admin layer — virtual office, systems map, battle mode |
| `/device/avatar-creator` | Avatar Creator | Layer-based avatar compositing — body, eyes, outfit, hairstyle, accessories. Saves to Supabase |

---

## Navigation Structure

### Top Nav (Dashboard Header)
- SCRIB3 logo (left) → `/dashboard`
- Builder icon (center)
- Widget picker + burger menu (right)

### Floating Widget (Bottom Pill — All Auth Pages)
Avatar + XP + capacity bar + 9 quick links:
`Chat` · `Calendar` · `Office` · `Dapps` · `Bandwidth` · `Tasks` · `Feedback` · `Prof Dev` · `Settings`

### Nav Overlay (Burger Menu)
Role-dependent categories with sub-items. Example for team/admin:
- **TEAM**: Search Team, Directory, Feedback, Prof Dev, Office, Dapps
- **UNITS**: Accounts, C-Suite, Brand, Media, Ops, PR
- **CLIENTS**: Client Directory, Search Clients
- **PROJECTS**: All Projects, Tasks, Search Projects

---

## Data Sources

| Source | Status | Pages Using |
|--------|--------|-------------|
| Supabase Auth | Live | All auth-gated pages |
| Supabase Profiles | Live | Dashboard, Profile, Team |
| Supabase Chat | Live | Chat, Office chat |
| Supabase Vendor Profiles | Live | Vendor Management |
| Supabase Invoices | Live | Vendor Management |
| Linear API | Live | Tasks page |
| Mock: Team roster (29) | Mock | Team Directory, Team Profile |
| Mock: Clients (6) | Mock | Client pages, Finance, Portal |
| Mock: Projects (10) | Mock | Project Registry, Pre-Alignment |
| Mock: Engagement Health | Mock | Finance Overview/Detail |
| Mock: Bandwidth (7) | Mock | Bandwidth page |
| Mock: Scope Watch (9) | Mock | Scope Watch page |
| Mock: XP/Levels | Mock | Dashboard, Culture, Floating Widget |

---

## Role Access Matrix

| Page | admin | team | csuite | client | vendor |
|------|-------|------|--------|--------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team/Clients/Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Finance | ✅ | ❌ | ✅ | ❌ | ❌ |
| Vendors | ✅ | ✅ | ✅ | ❌ | ❌ |
| Chat/Tasks/Settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Portal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Office | Ben only | ❌ | ❌ | ❌ | ❌ |
| Device | ✅ | ❌ | ❌ | ❌ | ❌ |
