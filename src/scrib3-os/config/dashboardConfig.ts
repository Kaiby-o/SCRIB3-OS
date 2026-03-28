// ===== Dashboard Configuration =====
// Single source of truth for role-based dashboard variants.
// One DashboardLayout reads this — never duplicate per role.

export type UserRole = 'admin' | 'team' | 'csuite' | 'client' | 'vendor'

export interface NavCategory {
  label: string
  subItems: string[]
}

export interface ModuleConfig {
  id: string
  label: string
  gridArea: string
  pillFilter?: string[] // which pills show this module (undefined = show on all)
}

export interface DashboardConfig {
  headerLabel: string
  pillNavItems: string[]
  categories: NavCategory[]
  modules: ModuleConfig[]
  gridTemplate: string
  gridColumns: string
}

const teamConfig: DashboardConfig = {
  headerLabel: 'TEAM DASHBOARD',
  pillNavItems: [],
  categories: [
    { label: 'TEAM', subItems: ['Search Team', 'Directory', 'Feedback', 'Prof Dev', 'Office', 'Dapps'] },
    { label: 'UNITS', subItems: ['Accounts', 'C-Suite', 'Brand', 'Media', 'Ops', 'PR'] },
    { label: 'CLIENTS', subItems: ['Search Clients', 'Client Directory'] },
    { label: 'PROJECTS', subItems: ['Search Projects', 'All Projects', 'Tasks'] },
    { label: 'CULTURE', subItems: ['Proof of Excellence', 'Operating Principles', 'Culture Book'] },
    { label: 'TOOLS', subItems: ['Tools Directory', 'Systems Map'] },
  ],
  modules: [
    // Existing
    { id: 'active-projects', label: 'ACTIVE PROJECTS', gridArea: 'projects' },
    { id: 'task-queue', label: 'TASK QUEUE', gridArea: 'tasks' },
    { id: 'team-activity', label: 'TEAM ACTIVITY', gridArea: 'activity' },
    { id: 'comms', label: 'INTERNAL COMMS', gridArea: 'comms' },
    // General
    { id: 'clock-weather', label: 'CLOCK & WEATHER', gridArea: 'clock' },
    { id: 'quick-links', label: 'QUICK LINKS', gridArea: 'links' },
    { id: 'announcements', label: 'ANNOUNCEMENTS', gridArea: 'announce' },
    { id: 'recent-activity', label: 'RECENT ACTIVITY', gridArea: 'feed' },
    { id: 'upcoming-events', label: 'UPCOMING EVENTS', gridArea: 'events' },
    { id: 'search', label: 'SEARCH', gridArea: 'search' },
    // Creative
    { id: 'my-projects-widget', label: 'MY PROJECTS', gridArea: 'myproj' },
    { id: 'task-queue-widget', label: 'MY TASKS', gridArea: 'mytasks' },
    { id: 'deliverable-tracker', label: 'DELIVERABLES', gridArea: 'deliv' },
    { id: 'brand-quick-ref', label: 'BRAND QUICK REF', gridArea: 'brand' },
    { id: 'content-calendar', label: 'CONTENT CALENDAR', gridArea: 'calendar' },
    { id: 'culture-snippet', label: 'CULTURE SNIPPET', gridArea: 'culture' },
    // Management
    { id: 'bandwidth-digest', label: 'BANDWIDTH DIGEST', gridArea: 'bw' },
    { id: 'pending-approvals', label: 'PENDING APPROVALS', gridArea: 'approvals' },
    { id: 'team-availability', label: 'TEAM AVAILABILITY', gridArea: 'avail' },
    { id: 'scope-watch-alerts', label: 'SCOPE WATCH', gridArea: 'scope' },
    { id: 'oneone-upcoming', label: '1:1 UPCOMING', gridArea: 'oneone' },
    { id: 'action-items-widget', label: 'ACTION ITEMS', gridArea: 'actions' },
    { id: 'pre-alignment-queue', label: 'PRE-ALIGNMENT QUEUE', gridArea: 'align' },
    { id: 'team-xp-progress', label: 'TEAM XP', gridArea: 'xp' },
    // Finances
    { id: 'client-health-scorecard', label: 'CLIENT HEALTH', gridArea: 'health' },
    { id: 'revenue-tracker', label: 'REVENUE TRACKER', gridArea: 'rev' },
    { id: 'at-risk-clients', label: 'AT-RISK CLIENTS', gridArea: 'risk' },
    { id: 'invoice-pipeline', label: 'INVOICE PIPELINE', gridArea: 'inv' },
    { id: 'outstanding-payments', label: 'OUTSTANDING PAYMENTS', gridArea: 'pay' },
    { id: 'project-pl', label: 'PROJECT P&L', gridArea: 'pl' },
    { id: 'labour-cost', label: 'LABOUR COST', gridArea: 'labour' },
    { id: 'forecast-simulator', label: 'FORECAST', gridArea: 'forecast' },
    // Culture
    { id: 'xp-leaderboard-mini', label: 'XP LEADERBOARD', gridArea: 'leader' },
    { id: 'recent-dapps', label: 'RECENT DAPPS', gridArea: 'dapps' },
    { id: 'happiness-pulse', label: 'HAPPINESS PULSE', gridArea: 'happy' },
  ],
  gridTemplate: `
    "projects projects tasks"
    "activity comms comms"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

const clientConfig: DashboardConfig = {
  headerLabel: 'CLIENT PORTAL',
  pillNavItems: [],
  categories: [
    { label: 'MY PROJECTS', subItems: ['Active', 'Completed'] },
    { label: 'DELIVERABLES', subItems: ['Pending', 'Approved', 'Archive'] },
    { label: 'TIMELINE', subItems: ['Milestones', 'Schedule'] },
    { label: 'APPROVALS', subItems: ['Pending Review', 'History'] },
    { label: 'SUPPORT', subItems: ['Contact', 'FAQs'] },
  ],
  modules: [
    { id: 'my-projects', label: 'MY PROJECTS', gridArea: 'projects' },
    { id: 'deliverables', label: 'DELIVERABLES', gridArea: 'deliverables' },
    { id: 'timeline', label: 'TIMELINE', gridArea: 'timeline' },
    { id: 'approvals', label: 'APPROVALS', gridArea: 'approvals' },
    { id: 'contact', label: 'CONTACT', gridArea: 'contact' },
    // Client-accessible widgets
    { id: 'clock-weather', label: 'CLOCK & WEATHER', gridArea: 'clock' },
    { id: 'quick-links', label: 'QUICK LINKS', gridArea: 'links' },
    { id: 'client-announcements', label: 'ANNOUNCEMENTS', gridArea: 'announce' },
    { id: 'client-activity', label: 'ACTIVITY', gridArea: 'activity' },
    { id: 'client-events', label: 'UPCOMING EVENTS', gridArea: 'events' },
    { id: 'client-notifications', label: 'NOTIFICATIONS', gridArea: 'notif' },
    { id: 'client-search', label: 'SEARCH', gridArea: 'search' },
    { id: 'client-content-calendar', label: 'CONTENT CALENDAR', gridArea: 'calendar' },
    { id: 'client-action-items', label: 'ACTION ITEMS', gridArea: 'actions' },
    { id: 'search', label: 'SEARCH', gridArea: 'search2' },
  ],
  gridTemplate: `
    "projects projects deliverables"
    "timeline timeline timeline"
    "approvals contact contact"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

const vendorConfig: DashboardConfig = {
  headerLabel: 'VENDOR PORTAL',
  pillNavItems: [],
  categories: [
    { label: 'BRIEFS', subItems: ['Active', 'Upcoming', 'Completed'] },
    { label: 'FILES', subItems: ['Upload', 'Downloads', 'Archive'] },
    { label: 'DEADLINES', subItems: ['Calendar', 'Overdue'] },
    { label: 'INVOICES', subItems: ['Pending', 'Paid', 'Submit'] },
    { label: 'SUPPORT', subItems: ['Contact', 'Guidelines'] },
  ],
  modules: [
    { id: 'briefs', label: 'ASSIGNED BRIEFS', gridArea: 'briefs' },
    { id: 'file-exchange', label: 'FILE EXCHANGE', gridArea: 'files' },
    { id: 'deadlines', label: 'DEADLINES', gridArea: 'deadlines' },
    { id: 'invoices', label: 'INVOICE STATUS', gridArea: 'invoices' },
    { id: 'contact', label: 'CONTACT', gridArea: 'contact' },
  ],
  gridTemplate: `
    "briefs briefs files"
    "deadlines invoices invoices"
    "contact contact contact"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

const csuiteConfig: DashboardConfig = {
  headerLabel: 'EXECUTIVE DASHBOARD',
  pillNavItems: [],
  categories: [
    { label: 'OVERVIEW', subItems: ['Portfolio', 'Metrics', 'Reports'] },
    { label: 'TEAMS', subItems: ['Performance', 'Capacity', 'Hiring'] },
    { label: 'CLIENTS', subItems: ['Health', 'Revenue', 'Pipeline'] },
    { label: 'PROJECTS', subItems: ['Status', 'Risk', 'Roadmap'] },
    { label: 'FINANCE', subItems: ['Revenue', 'Costs', 'Forecasts'] },
    { label: 'STRATEGY', subItems: ['OKRs', 'Initiatives', 'Board'] },
  ],
  modules: [
    { id: 'portfolio', label: 'PORTFOLIO OVERVIEW', gridArea: 'portfolio' },
    { id: 'revenue', label: 'REVENUE', gridArea: 'revenue' },
    { id: 'utilisation', label: 'TEAM UTILISATION', gridArea: 'utilisation' },
    { id: 'client-health', label: 'CLIENT HEALTH', gridArea: 'health' },
    { id: 'metrics', label: 'KEY METRICS', gridArea: 'metrics' },
    // Also gets all team widgets
    ...teamConfig.modules.filter((m) => !['active-projects', 'task-queue', 'team-activity', 'comms'].includes(m.id)),
  ],
  gridTemplate: `
    "portfolio portfolio portfolio"
    "revenue revenue utilisation"
    "health metrics metrics"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

const adminConfig: DashboardConfig = {
  headerLabel: 'ADMIN DASHBOARD',
  pillNavItems: [],
  categories: teamConfig.categories,
  modules: [
    ...teamConfig.modules,
    { id: 'system-overview', label: 'SYSTEM OVERVIEW', gridArea: 'system' },
  ],
  gridTemplate: `
    "projects projects tasks"
    "activity system system"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

export const dashboardConfigs: Record<UserRole, DashboardConfig> = {
  team: teamConfig,
  client: clientConfig,
  vendor: vendorConfig,
  csuite: csuiteConfig,
  admin: adminConfig,
}
