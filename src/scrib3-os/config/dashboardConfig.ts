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
  pillNavItems: ['Overview', 'Projects', 'Tasks', 'Files'],
  categories: [
    { label: 'TEAM', subItems: ['Directory', 'Profiles', 'Activity'] },
    { label: 'UNITS', subItems: ['Business Units', 'Departments'] },
    { label: 'CLIENTS', subItems: ['Client List', 'Onboarding'] },
    { label: 'PROJECTS', subItems: ['Active', 'Archived', 'Proposals'] },
    { label: 'CULTURE', subItems: ['Values', 'Events', 'Recognition'] },
    { label: 'TOOLS', subItems: ['Resources', 'Templates', 'Integrations'] },
  ],
  modules: [
    { id: 'active-projects', label: 'ACTIVE PROJECTS', gridArea: 'projects' },
    { id: 'task-queue', label: 'TASK QUEUE', gridArea: 'tasks' },
    { id: 'team-activity', label: 'TEAM ACTIVITY', gridArea: 'activity' },
    { id: 'comms', label: 'INTERNAL COMMS', gridArea: 'comms' },
    { id: 'recent-files', label: 'RECENT FILES', gridArea: 'files' },
  ],
  gridTemplate: `
    "projects projects tasks"
    "activity comms comms"
    "files files files"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

const clientConfig: DashboardConfig = {
  headerLabel: 'CLIENT PORTAL',
  pillNavItems: ['Overview', 'Deliverables', 'Timeline', 'Approvals'],
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
  pillNavItems: ['Overview', 'Briefs', 'Files', 'Deadlines'],
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
  pillNavItems: ['Overview', 'Projects', 'Teams', 'Finance'],
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
  ],
  gridTemplate: `
    "portfolio portfolio portfolio"
    "revenue revenue utilisation"
    "health metrics metrics"
  `,
  gridColumns: 'repeat(3, 1fr)',
}

export const dashboardConfigs: Record<UserRole, DashboardConfig> = {
  team: teamConfig,
  client: clientConfig,
  vendor: vendorConfig,
  csuite: csuiteConfig,
  admin: {
    ...teamConfig,
    headerLabel: 'ADMIN DASHBOARD',
  },
}
