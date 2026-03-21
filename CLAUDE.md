# SCRIB3-OS

## What This Is
A gamified project management platform for SCRIB3, a Web3/crypto content & brand agency. The UI is a militarized sci-fi field device — think handheld CRT instrument, not a SaaS dashboard.

## Current Phase
Phase 0 (Foundation) — login flow, dashboard shell, module system architecture, and systems map integration.

## Team
- **Ben (Kaiby-o)** — VP Creative & Digital at SCRIB3, EU timezone, product owner
- **CK (CK42BB)** — collaborator, US evening timezone, uses Claude Code. Picks up where Ben leaves off. CHANGELOG.md and PLANNING.md updated on every push.

## Architecture
- **Stack**: React 19 + TypeScript, Vite 8, Zustand (state), Supabase (auth, DB, realtime)
- **Two visual modes**: Cyberpunk (PNG-based CRT device) and Clean (neumorphic CSS)
- **Module system**: Components wrapped in ModuleFrame + ModuleExpansion, activated via Zustand store
- **Systems Map**: Full-screen takeover view (not a module) — 45 nodes, 9 journeys, 11 stakeholder roles

## Key Artefacts
- `.claude/SCRIB3-OS-PRD.md` — Full product requirements document
- `.claude/SKILL-CRT.md` — CRT monitor aesthetics
- `.claude/SKILL-GAMIFICATION.md` — XP, levels, badges
- `.claude/SKILL-HARDWARE-CHROME.md` — CSS hardware UI components
- `.claude/SKILL-MODULE-EXPAND.md` — Module expansion animations
- `.claude/SKILL-REALTIME-PATTERNS.md` — Supabase realtime patterns

## Conventions
- ALL CAPS labels in UI
- Monospace fonts: JetBrains Mono, IBM Plex Mono, Share Tech Mono
- Hardware aesthetic: screws, bevels, connector strips, barcodes
- Mechanical easing curves (cubic-bezier, no soft ease-in-out)
- Role-based access: TEAM (full), CLIENT (scoped), CONTRACTOR (assigned tasks only)
