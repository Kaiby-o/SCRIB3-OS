// ===== Scope Watch Types & Mock Data =====
// Plan v4 §3H — Scope Watch (Sixtyne + Elena)
// Per-client out-of-scope requests that come up regularly
// Linked SOW clause, approved response language
// Editable by account lead
// Banner: "Client questions go to the account lead — never DM a client directly."

export interface ScopeWatchEntry {
  id: string;
  clientSlug: string;
  clientName: string;
  requestType: string;
  inScope: boolean;
  sowClause: string;
  approvedResponse: string;
  addedBy: string;
  addedAt: string;
  frequency: 'rare' | 'occasional' | 'frequent';
}

export const frequencyColors: Record<string, string> = {
  rare: '#27AE60',
  occasional: '#F1C40F',
  frequent: '#E74C3C',
};

export const mockScopeWatch: ScopeWatchEntry[] = [
  // Cardano
  {
    id: 'sw-1', clientSlug: 'cardano', clientName: 'Cardano',
    requestType: 'Request for event-specific branded collateral (banners, swag designs)',
    inScope: false, sowClause: 'SOW §3.2 — Monthly retainer covers digital content only, not event/print collateral',
    approvedResponse: 'Event collateral falls outside our current retainer scope. Happy to scope this as a one-off project — I\'ll prepare a mini-SOW with timeline and cost.',
    addedBy: 'Elena Zheng', addedAt: '2026-02-15', frequency: 'frequent',
  },
  {
    id: 'sw-2', clientSlug: 'cardano', clientName: 'Cardano',
    requestType: 'Asking SCRIB3 to manage community Discord moderation',
    inScope: false, sowClause: 'SOW §2.1 — Scope limited to content creation and strategy; community management excluded',
    approvedResponse: 'Community moderation isn\'t part of our current engagement. We can recommend specialist partners or scope an add-on if this is a priority.',
    addedBy: 'Elena Zheng', addedAt: '2026-01-20', frequency: 'occasional',
  },
  {
    id: 'sw-3', clientSlug: 'cardano', clientName: 'Cardano',
    requestType: 'Requesting direct access to SCRIB3 design files (Figma editor access)',
    inScope: false, sowClause: 'SOW §5.1 — Deliverables provided as final exports; source files remain SCRIB3 property',
    approvedResponse: 'We provide all deliverables in final format (PNG/PDF/MP4). Source files are retained by SCRIB3 per our agreement. Happy to export in any specific format you need.',
    addedBy: 'Kevin Moran', addedAt: '2026-03-01', frequency: 'rare',
  },
  // Franklin Templeton
  {
    id: 'sw-4', clientSlug: 'franklin-templeton', clientName: 'Franklin Templeton',
    requestType: 'Compliance review turnaround expected within 24 hours',
    inScope: true, sowClause: 'SOW §4.3 — 48-hour turnaround on compliance review; expedited available at additional cost',
    approvedResponse: 'Our standard compliance turnaround is 48 hours per the SOW. If you need expedited 24-hour review, we can accommodate at an additional cost — let me know if you\'d like me to action that.',
    addedBy: 'Elena Zheng', addedAt: '2026-02-28', frequency: 'frequent',
  },
  {
    id: 'sw-5', clientSlug: 'franklin-templeton', clientName: 'Franklin Templeton',
    requestType: 'Request for paid media management (ad buying, campaign management)',
    inScope: false, sowClause: 'SOW §2.2 — Organic content strategy only; paid media excluded',
    approvedResponse: 'Paid media management falls outside our current scope. We can provide creative assets for paid campaigns, or scope a separate paid media engagement.',
    addedBy: 'Elena Zheng', addedAt: '2026-01-10', frequency: 'occasional',
  },
  // Rootstock
  {
    id: 'sw-6', clientSlug: 'rootstock', clientName: 'Rootstock',
    requestType: 'Requesting SCRIB3 attend in-person events as client representatives',
    inScope: false, sowClause: 'SOW §1.4 — Remote engagement only; travel and event attendance not included',
    approvedResponse: 'In-person event representation isn\'t part of our current retainer. We can provide event collateral, talking points, and social coverage remotely. If on-site support is needed, we can scope travel separately.',
    addedBy: 'Omar Anwar', addedAt: '2026-03-10', frequency: 'occasional',
  },
  {
    id: 'sw-7', clientSlug: 'rootstock', clientName: 'Rootstock',
    requestType: 'Asking for unlimited revision rounds on deliverables',
    inScope: false, sowClause: 'SOW §3.5 — 2 rounds of revisions included per deliverable; additional rounds billed hourly',
    approvedResponse: 'Our scope includes 2 revision rounds per deliverable. We\'re currently on round 3 — I\'ll log this as an additional revision. Happy to continue iterating; just flagging for transparency on billing.',
    addedBy: 'Omar Anwar', addedAt: '2026-02-05', frequency: 'frequent',
  },
  // Midnight
  {
    id: 'sw-8', clientSlug: 'midnight', clientName: 'Midnight',
    requestType: 'Requesting SCRIB3 write technical documentation / developer docs',
    inScope: false, sowClause: 'SOW §2.3 — Scope covers brand and marketing content; technical documentation excluded',
    approvedResponse: 'Technical documentation falls outside our brand/marketing scope. We can help with developer-facing marketing content (blog posts, ecosystem overviews) but not API docs or technical specs.',
    addedBy: 'Omar Anwar', addedAt: '2026-03-15', frequency: 'rare',
  },
  // Canton
  {
    id: 'sw-9', clientSlug: 'canton', clientName: 'Canton',
    requestType: 'Weekend / after-hours content requests for "urgent" social posts',
    inScope: false, sowClause: 'SOW §6.1 — Business hours Mon-Fri; emergency out-of-hours support at 1.5x rate',
    approvedResponse: 'We operate Monday to Friday during business hours. For urgent weekend requests, we can accommodate at our out-of-hours rate (1.5x). Let me know if you\'d like to proceed.',
    addedBy: 'Elena Zheng', addedAt: '2026-02-20', frequency: 'frequent',
  },
];
