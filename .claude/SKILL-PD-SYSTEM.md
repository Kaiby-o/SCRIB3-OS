# SKILL: Professional Development System

> **Domain:** People — Individual Growth, Coaching, Reviews
> **Applies to:** SCRIB3-OS layer, `/pd/:id` route
> **Plan v4 §2D**

---

## Three Layers

### Layer 1 — Individual Tracker (member-facing, semi-private)

Source template: Stef's tracker at Notion `3117dab95ee281409fdfc74d3caeaadc`

**Sections (rendered as tabs in OS):**

1. **Goals / Courses** — SMART enforced: Specific/Measured/Achievable/Relevant/Time-bound
   - Fields: Goal, Type (SMART/Course/Stretch), Target date, Status
   - Stretch goals award 50 XP on completion

2. **Proof of Excellence (POE)** — Evidence of quality work
   - Fields: Date, Description, Client, Type (Client Recognition/Internal Win/Skill Milestone/Peer Recognition), Source link
   - Added by manager, peer, or self (manager validates self-submitted)
   - POE entries award 10-30 XP

3. **Operating Principles Self-Rating** — Quarterly self-assessment
   - The Five Principles: Keep Externalities in Perspective / If It Doesn't Make Sense Don't Do It / Tackle Problems Head On / Set Teammates Up for Success / Develop or Die
   - Fields: Principle, Self-rating (1–5), Evidence, Manager rating (during review)
   - Completing a full self-rating awards 15 XP

4. **Instant Feedback** — Real-time praise and development points
   - Fields: Date, Type (Praise/Development Point), Content, Context, Source type
   - `is_repeated` boolean for recurring themes
   - Receiving praise = 10 XP, giving feedback to peer = 5 XP

**Also planned (not yet built):**
- About Me: "MJ State" (flow triggers), personality test links
- Task Tracker: embedded Linear tasks
- Call Recordings: Fathom links, agenda, summary, action items
- 1:1 Agenda structure (SOLVE/STRENGTHEN/SCALE/Topics/Start-Stop-Continue)

---

### Layer 2 — Manager Coaching Admin (Ben only, private)

Source: Notion `3117dab95ee28069b02ed59b65005aad`

- Coaching Actionables: cross-team actions from 1:1s
- Coaching Admin: per-member private notes
- Teamwide Concepts: recurring themes across ≥3 people → workshop or resource
- Resources: Critical Thinking, Getting Everyone On Same Page, Client Facilitation, Speed > Craft Ritual

**Status: Not yet built — Layer 2 is admin-only and lower priority than Layer 1.**

---

### Layer 3 — Review & Evaluation (CSuite-gated)

Used for performance reviews, raises, promotions. Culture Amp triggers cycle; OS provides structured data.

Data surfaced: goal completion rate, POE count/quality, Operating Principles gap analysis, Instant Feedback patterns, bandwidth history, call recording links.

Outputs: performance level, promotion readiness, salary review flag, development plan.

**Status: Not yet built — requires Culture Amp integration.**

---

## Access Controls

| Role | Access |
|------|--------|
| Team member | Own tracker only |
| Ben (manager) | All direct reports' trackers + Coaching Admin |
| CSuite | Review summaries only — NOT raw 1:1 notes |
| Haley (HR) | Review outcomes/ratings — NOT coaching notes |

## Current State

- Layer 1 built as `/pd/:id` with 4 tabs: Goals, POE, Operating Principles, Instant Feedback
- Mock data for each section
- Linked from team profile page
- XP events defined in `src/scrib3-os/lib/xp.ts`

## Supabase Tables

`pd_goals`, `pd_proof_of_excellence`, `pd_operating_principles`, `pd_call_recordings`, `pd_instant_feedback`, `pd_coaching_notes`, `pd_review_cycles`
