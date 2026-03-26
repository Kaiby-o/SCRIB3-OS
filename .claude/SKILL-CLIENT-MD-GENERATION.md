# SKILL: Client MD File Generation

> **Domain:** Client Intelligence — Auto-generated Knowledge Files
> **Applies to:** SCRIB3-OS layer, client hubs
> **Plan v4 §3B**

---

## Overview

For each priority client, generate a structured MD file from ALL available sources. Mark missing fields `[DATA NEEDED — account lead to verify]`. These are the single source of truth for everything SCRIB3 knows about a client.

---

## Data Sources (in order of priority)

| Source | What to Extract | Access Method |
|--------|----------------|---------------|
| Notion Client Hubs | Hub page for each active client | `notion-fetch` each linked page |
| Notion Account Blueprints | Strategy, workstreams, contacts | `notion-fetch` template pages |
| Notion Project Numbers | Project codes, status, types, SOW links | `notion-search` in DB |
| Slack client channels | Account updates, team assignments, blockers | `slack_search_public_and_private` |
| Slack #scrib3-core | Mentions, shoutouts, account wins | `slack_search_public` |
| Figma | Brand files (search by client name) | `figma_search` |
| Google Drive | Pitch decks, SOWs, briefs, brand guidelines | `gdrive_search` |
| Web | Official website, brand page, Twitter, LinkedIn | `web_search` + `web_fetch` |

---

## MD File Schema

```markdown
# [CLIENT NAME]
> Last updated: [DATE] | Fields marked [DATA NEEDED] require verification.

## Overview
- Industry, Website, Twitter/X, LinkedIn, Discord
- Contract Start, Type (Monthly Remit / One Time / As-Needed)
- Contract Value (monthly) [DATA NEEDED — finance only]
- Account Health (🔴/🟠/🟡/🟢/⭐)
- SCRIB3 Account Lead, Creative Lead, PR Lead
- Primary Slack Channel

## Key Contacts
| Name | Role | Email | Comms Preference | Sensitivities |

## Brand
- Primary Colour, Secondary Colours, Primary Font, Logo
- Brand Book link, Figma link
- Tone of Voice, Key Messaging Pillars
- Content DO's, Content DON'Ts

## Services Active
| Service | Description | Scope notes |

## Active Projects
| Code | Title | Status | Lead | Start | Blocker |

## Scope Watch
| Request type | In scope? | Approved response |

## Macro Strategy
## Current Sprint Focus
## What We Are NOT Doing
## Upcoming Key Dates
## References (Brand Guidelines, MSA, SOWs)
## Internal Notes
## Change Log
```

---

## Current State

- Schema fully implemented in `src/scrib3-os/lib/clients.ts`
- 6 priority clients populated with mock data: Cardano, Franklin Templeton, Rootstock, Rome Protocol, Midnight, Canton
- Rendered at `/clients/:slug/hub` (internal, 5-tab view)
- **Not yet auto-generated from MCP sources** — requires Notion/Slack/Figma connections

## Priority Client Order for Generation

1. Rootstock (fully populated Blueprint exists in Notion)
2. Franklin Templeton
3. Midnight
4. Cardano
5. Canton
6. Rootstock Collective
