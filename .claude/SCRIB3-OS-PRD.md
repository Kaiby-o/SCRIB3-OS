# SCRIB3-OS — Product Requirements Document
**Version:** 0.1 — Pre-Build  
**Status:** Ready for Claude Code Handoff  
**Date:** 2026-03-13

---

## 1. Product Overview

### 1.1 What It Is
SCRIB3-OS is a browser-native project management platform designed as a tactile, sci-fi field device. It is not a dashboard. It is a piece of equipment. The UI resembles a ruggedised, military-grade handheld terminal — white and blush/pink colourway, exposed hardware details, CRT screen aesthetics, and a screen expansion mechanic where feature panels physically unfold as hardware modules.

### 1.2 Core Design Philosophy
> "This is a piece of equipment, not a SaaS dashboard."

Every interaction must feel mechanical, intentional, and earned. Nothing floats. Nothing fades. Things power on, slot in, snap into place, and boot.

### 1.3 Product Goals
- Replace generic PM tools for creative agencies with a branded, opinionated OS experience
- Enforce role-based access without friction — users experience only what they're cleared for
- Use gamification to reinforce team performance culture without being juvenile
- Serve as a showcase artefact for SCRIB3's creative and technical capability

---

## 2. User Roles & Access Model

All roles share a single backend. Views are filtered server-side via Supabase Row-Level Security.

| Role | Label | Access Scope |
|---|---|---|
| Internal staff | `TEAM` | All projects, all clients, resource view, internal comms, full timeline, task management, gamification |
| External client | `CLIENT` | Their project only, approval workflows, file delivery, milestone progress — no internal comms |
| External collaborator | `CONTRACTOR` | Assigned tasks only, file upload/download, time logging — no client-facing data |

**Assignment logic:**
- `TEAM` — assigned by admin on account creation
- `CLIENT` — auto-scoped to their org's projects
- `CONTRACTOR` — manually scoped to specific tasks/projects by a TEAM admin

---

## 3. Onboarding & Login

### 3.1 The Data Module Card
On first load, the user sees a landscape hardware card (the login cartridge). Reference: `CRT-ENTRY.png` and `CRT-ENTRY__1_.png`.

Card anatomy:
- `SCRIB3 — OS` / `DATA MODULE` header (monospace, large, ALL CAPS)
- Barcode strip, top edge (decorative SVG)
- Gold contact strip on left edge (CSS gradient, visual only)
- Pink cartridge tab on right (visual only)
- SCRIB3 logo mark (circular dial element, centre-right)
- Fields: `USERNAME`, `PASSWORD`, `ACCESS LEVEL` (dropdown: TEAM / CLIENT / CONTRACTOR)
- Indicator dots (blush pink) beside field labels
- Ruler/measurement graphic strip (decorative)
- Globe icon (bottom right, decorative)

### 3.2 Insertion Animation
On submit (valid credentials):
1. Card applies a slight 3D perspective tilt (~8deg on X axis)
2. Card translates downward (~translateY 120%) toward a visible card slot on the device chassis bottom edge
3. Slot "accepts" card — brief blush indicator light pulse
4. Device screen powers on — phosphor glow bloom from dark
5. Boot sequence begins

Full animation budget: ≤ 1200ms. CSS keyframes + JS class toggling. No canvas.

### 3.3 Boot Sequence
Typewriter text reveal, phosphor green, monospace:
```
> SCRIB3-OS v1.0
> AUTHENTICATING OPERATOR...
> ACCESS LEVEL: [TEAM | CLIENT | CONTRACTOR]
> LOADING MODULES...
████████████████░░░░  80%
> SYSTEM READY
```
Each line typewriter-reveals before next begins. Progress bar fills mechanically. On completion: snap cut to main OS (no fade).

---

## 4. Screen Expansion System

### 4.1 Concept
Platform starts as a single primary screen module. As users navigate to feature areas, additional screen panels animate in from behind the primary unit — physically unfolding, sliding, or slotting into position. Reference images: `AUX-SCREEN.png`, `AUX-SCREEN-2__1_.png`, `AUX-SCREEN-2__2_.png`.

Full expanded state = multi-screen field deployment array.

### 4.2 Module Map

| Module ID | Feature | Form Factor | Direction |
|---|---|---|---|
| `MOD-PRIMARY` | Dashboard / task overview | Landscape wide | Base (always visible) |
| `MOD-TIMELINE` | Project timeline / Gantt | Landscape wide | Unfolds above |
| `MOD-FILES` | File delivery / assets | Portrait | Slides out left |
| `MOD-COMMS` | Internal comms (TEAM only) | Portrait tall | Slides out right |
| `MOD-APPROVALS` | Approval workflows | Portrait | Folds from top-right |
| `MOD-LEADERBOARD` | XP leaderboard (TEAM, conditional) | Portrait | Appears right (unlocks at 3+ active) |
| `MOD-RESOURCE` | Capacity view (TEAM only) | Landscape | Unfolds below |

### 4.3 Module States
`DORMANT → QUEUED → DEPLOYING → ACTIVE → SLEEPING`

### 4.4 Performance Contract
- All expansion animations: 60fps
- Use `transform` and `opacity` only — no layout thrashing
- Modules use absolute positioning within a device canvas coordinate system
- No reflow of existing content during expansion

---

## 5. Feature Modules — Requirements

### 5.1 MOD-PRIMARY: Dashboard
**All roles (filtered)**
- Active task count, upcoming deadlines (7-day window)
- Real-time activity feed (Supabase subscriptions)
- Project status tiles (TEAM: all; CLIENT: their project; CONTRACTOR: their tasks)
- Quick-action row: New Task / Upload File / Request Approval
- Operator profile widget: avatar, XP bar, level badge

### 5.2 MOD-TIMELINE: Project Timeline
**TEAM (full) + CLIENT (milestones read-only)**
- Horizontal Gantt-style timeline
- Milestone markers with status indicators
- Task bars per phase (TEAM can drag-resize)
- CLIENT sees milestones only — no internal task detail
- Real-time: task completion reflects on milestone progress immediately

### 5.3 MOD-FILES: File Delivery
**TEAM (full), CLIENT (download), CONTRACTOR (upload + download assigned)**
- Folder structure per project / deliverable phase
- File status: `PENDING / IN REVIEW / APPROVED / REJECTED`
- Version history per file
- Drag-and-drop upload with mechanical progress bar animation

### 5.4 MOD-COMMS: Internal Communications
**TEAM only**
- Thread-based messaging (structured threads per project, not live chat)
- @mention support
- File attachment from MOD-FILES
- Entirely invisible to CLIENT and CONTRACTOR

### 5.5 MOD-APPROVALS: Approval Workflows
**TEAM (manage) + CLIENT (approve/reject/comment)**
- Approval request card per deliverable
- Status: `PENDING / APPROVED / REJECTED / REVISION REQUESTED`
- CLIENT can approve or request revision + comment
- TEAM notified on status change (real-time)
- Approval triggers XP award to submitting operator

### 5.6 MOD-LEADERBOARD: Team XP Board
**TEAM only — unlocks when 3+ TEAM operators have logged activity**
- Ranked list by XP, with level badges
- Weekly / all-time toggle
- Hardware badge display per operator
- Animated XP tick-up counter on view

### 5.7 MOD-RESOURCE: Capacity View
**TEAM only**
- Per-operator capacity grid (this week / next week)
- Load indicator: `UNDER / NORMAL / OVERLOADED`
- Project allocation breakdown
- Refresh on navigate (no real-time needed)

---

## 6. Gamification System

### 6.1 XP Events

| Action | XP |
|---|---|
| Task completed on time | +50 |
| Task completed early | +75 |
| Task completed late | +10 |
| File uploaded on time | +30 |
| First-pass approval received | +40 |
| Approval received after revision | +15 |
| Daily login streak | +5 |
| 7-day streak bonus | +25 |

### 6.2 Operator Levels

| Level | Title | XP Threshold |
|---|---|---|
| 1 | RECRUIT | 0 |
| 2 | OPERATOR | 200 |
| 3 | SPECIALIST | 600 |
| 4 | FIELD AGENT | 1,400 |
| 5 | COMMAND | 3,000 |
| 6 | DIRECTOR | 6,000 |
| 7 | ARCHITECT | 12,000 |

### 6.3 Achievement Badges

| Badge | Trigger |
|---|---|
| `FIRST BLOOD` | First task completed |
| `EARLY BIRD` | 5 tasks completed before deadline |
| `CLEAN PASS` | 3 first-pass approvals in a row |
| `STREAK UNIT` | 14-day login streak |
| `DELIVERY LOCKED` | 10 files delivered on time |
| `GHOST MODE` | 5 tasks completed with no late flags |
| `COMMS CLEAR` | First approval workflow completed |

Badges rendered as hardware badge icons on the operator's device chassis panel.

### 6.4 Notification Theatrics
- **XP award:** Number ticks up, brief phosphor flash on XP bar
- **Level up:** Screen flicker → boot fragment → `LEVEL UP: [TITLE]` typewriter → badge slam animation
- **Achievement unlock:** Badge drops onto chassis, mechanical sound (user-toggleable)

---

## 7. Visual Design System

### 7.1 Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `--hw-white` | `#F2EDE8` | Chassis base |
| `--hw-blush` | `#E8A49C` | Accent hardware, tabs, knobs |
| `--hw-dark` | `#1A1A1A` | Screen background |
| `--hw-chrome` | `#C8C0B8` | Screws, bevels, metallic detail |
| `--crt-green` | `#39FF14` | Phosphor green text mode |
| `--crt-amber` | `#FFB000` | Phosphor amber text mode |
| `--crt-dim` | `#1A2A1A` | Inactive screen glow |
| `--status-ok` | `#39FF14` | Active / complete |
| `--status-warn` | `#FFB000` | Pending / in-progress |
| `--status-err` | `#FF3B3B` | Error / rejected |

### 7.2 Typography
- **All UI text:** `JetBrains Mono` or `IBM Plex Mono`
- **Hardware labels (large):** `Share Tech Mono`
- **Zero humanist sans.** No Inter. No Roboto. No system fonts.
- All labels: ALL CAPS, `letter-spacing: 0.08em` minimum
- Font loading: Google Fonts CDN + self-hosted fallback

### 7.3 Hardware Chrome Components
Every panel must include:
- Corner screws (SVG circle + cross, `--hw-chrome` fill)
- Bevelled edge (CSS `inset` box-shadow)
- Embossed label strip (text-shadow offset trick)
- Barcode strip (SVG repeating pattern)
- Indicator light (blinking dot — blush or crt-green)
- Speaker grille (CSS `repeating-linear-gradient`)

### 7.4 Animation Contract
- UI interactions: 150–400ms
- Module expansions: 600–1200ms
- Easing: `cubic-bezier(0.25, 0, 0, 1)` for mechanical snap; `steps(n, end)` for typewriter
- No `ease-in-out` soft curves
- Screen power-on: `filter: brightness(0)` → `brightness(1)` with brief overscan flash
- State transitions: 1-2 frame static/noise frame before content appears

---

## 8. Technical Architecture

### 8.1 Frontend Stack
| Layer | Choice | Rationale |
|---|---|---|
| Build | Vite + React 18 | Fast DX, modern defaults |
| Styling | CSS Modules + CSS custom properties | Full control — Tailwind insufficient for hardware chrome detail |
| Animation | CSS transitions + Framer Motion | CSS for simple; Framer for complex module sequences |
| State | Zustand | Lightweight, no boilerplate |
| Real-time | Supabase JS client | Websocket subscriptions built in |
| Fonts | Google Fonts + self-hosted | JetBrains Mono, IBM Plex Mono, Share Tech Mono |

### 8.2 Backend: Supabase
**Over PocketBase because:** real-time subscriptions, auth depth, RLS maps directly to role model, Storage included.

Core schema:
```sql
users        (id, email, username, access_level, xp, level, org_id, created_at)
orgs         (id, name, slug)
projects     (id, org_id, name, status, client_id, created_at)
tasks        (id, project_id, title, assignee_id, status, due_date, completed_at)
files        (id, project_id, name, url, version, status, uploaded_by)
approvals    (id, file_id, project_id, status, requester_id, approver_id, comment)
messages     (id, project_id, thread_id, author_id, content, created_at)
achievements (id, user_id, badge_id, earned_at)
xp_log       (id, user_id, event_type, xp_amount, ref_id, created_at)
```

RLS rules:
- `CLIENT`: SELECT on projects WHERE org_id matches their org
- `CONTRACTOR`: SELECT/INSERT on tasks WHERE assignee_id = auth.uid()
- `TEAM`: Full access within their org

### 8.3 Real-Time Subscriptions
- Task completion → milestone progress update (CLIENT visible)
- Approval status change → TEAM notification
- XP award → operator profile widget
- Pattern: `supabase.channel().on('postgres_changes', ...)`

### 8.4 File Storage
- Supabase Storage (S3-compatible)
- Buckets: `project-files`, `avatars`
- Bucket policies mirror files table RLS

### 8.5 Deployment
- **Platform:** Railway
- **Frontend:** Static build via Nixpacks (Vite output)
- **Backend:** Supabase hosted (no self-hosting)
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 9. Routing

```
/                     Login (Data Module Card)
/boot                 Boot sequence (post-login transition)
/os                   Primary OS shell — MOD-PRIMARY always loaded
/os/timeline          Triggers MOD-TIMELINE expansion
/os/files             Triggers MOD-FILES expansion
/os/comms             Triggers MOD-COMMS (TEAM only)
/os/approvals         Triggers MOD-APPROVALS expansion
/os/leaderboard       Triggers MOD-LEADERBOARD (TEAM + unlock condition)
/os/resource          Triggers MOD-RESOURCE (TEAM only)
/os/profile           Operator profile overlay (not a module expansion)
```

Navigation triggered by hardware-rendered interactive elements on device chassis (knobs, toggles, function keys) — not a conventional nav bar.

---

## 10. Viewport / Responsive

Desktop-primary. The hardware device metaphor does not translate to mobile.

- **Min width:** 1280px
- **Optimal:** 1440–1920px
- **Mobile (< 768px):** Render hardware chassis with message: `CONNECT FROM DESKTOP TERMINAL`
- **Tablet (768–1279px):** Single module only, no expansion, with advisory

---

## 11. Phased Build Plan

| Phase | Scope | Est. Duration |
|---|---|---|
| 0 — Foundation | Vite+React setup, Supabase schema+RLS, auth, static Data Module Card, device chassis shell, hardware chrome component library | Week 1 |
| 1 — Core OS | Boot sequence, card insertion animation, MOD-PRIMARY live data, role filtering, basic XP, operator profile | Weeks 2–3 |
| 2 — Module Expansion | MOD-TIMELINE, MOD-FILES, MOD-APPROVALS, screen expansion animation system, real-time wired | Weeks 4–5 |
| 3 — Gamification + Comms | Full XP/level system, achievement badges, MOD-LEADERBOARD, MOD-COMMS, notification theatrics | Week 6 |
| 4 — Polish + Deploy | MOD-RESOURCE, CRT effects throughout, sound hooks, cross-browser QA, Railway deploy, perf audit | Week 7 |

---

## 12. Open Questions

| # | Question | Default |
|---|---|---|
| 1 | White-label for clients? | No — SCRIB3-branded v1 |
| 2 | CONTRACTOR: self-registered or admin-invited? | Admin-invited only |
| 3 | Sound effects: AudioContext or asset files? | Asset files, user-toggleable |
| 4 | Custom domain on Railway? | TBD |
| 5 | Achievements configurable per org? | No — fixed badge set v1 |
| 6 | Leaderboard resets weekly? | Toggle: weekly / all-time |

---

## 13. Skill File Index

| File | Purpose |
|---|---|
| `SKILL-CRT.md` | CRT aesthetics, scanlines, phosphor glow, flicker, signal noise |
| `SKILL-SCREEN-EXPANSION.md` | Module unfold/snap/slot animation system, 60fps contracts |
| `SKILL-GAMIFICATION.md` | XP systems, levels, badges, notification theatrics |
| `SKILL-HARDWARE-CHROME.md` | CSS/SVG hardware detail rendering (screws, bevels, barcodes, grilles) |

---
*SCRIB3-OS PRD v0.1 — End of document*
