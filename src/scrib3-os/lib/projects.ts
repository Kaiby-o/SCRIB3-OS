// ===== Project Registry Data Layer =====
// Plan v4 §4A — Project Registry
// Code format: [CLIENT_CODE]-[NNN]
// Status: Active / In Progress / On Hold / Completed / Invoiced / Inactive / Not Started
// Type: Monthly Remit / One Time / As-Needed

export type ProjectStatus = 'Active' | 'In Progress' | 'On Hold' | 'Completed' | 'Invoiced' | 'Inactive' | 'Not Started';
export type ProjectType = 'Monthly Remit' | 'One Time' | 'As-Needed';

export interface Project {
  id: string;
  code: string;
  clientName: string;
  clientSlug: string;
  title: string;
  brief: string;
  services: string[];
  status: ProjectStatus;
  type: ProjectType;
  startDate: string;
  completionDate: string;
  productionLead: string;
  creativeLead: string;
  accountLead: string;
  teamMembers: string[];
  freelancers: string[];
  unit: string;
  sowUrl: string;
  linearBoardUrl: string;
  preAlignmentComplete: boolean;
  briefStatus: 'Not Started' | 'Draft' | 'Complete';
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  'Active': '#27AE60',
  'In Progress': '#6E93C3',
  'On Hold': '#E67E22',
  'Completed': '#95A5A6',
  'Invoiced': '#D7ABC5',
  'Inactive': '#BDC3C7',
  'Not Started': '#F1C40F',
};

export const mockProjects: Project[] = [
  {
    id: 'p-cdn012', code: 'CDN-012', clientName: 'Cardano', clientSlug: 'cardano',
    title: 'Q1 Brand Campaign — "Built Different"', brief: 'Multi-channel campaign highlighting Cardano\'s peer-reviewed approach to blockchain development.',
    services: ['Brand Content', 'Motion Graphics', 'Social'], status: 'Active', type: 'Monthly Remit',
    startDate: '2026-01-15', completionDate: '2026-04-05',
    productionLead: 'Kevin Moran', creativeLead: 'Kevin Moran', accountLead: 'Elena Zheng',
    teamMembers: ['Kevin Moran', 'Tolani Daniel', 'Jake Embleton', 'Elena Zheng'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-cdn014', code: 'CDN-014', clientName: 'Cardano', clientSlug: 'cardano',
    title: 'Social Content — March', brief: 'Monthly social content calendar execution for Cardano channels.',
    services: ['Social Content', 'Copywriting'], status: 'In Progress', type: 'Monthly Remit',
    startDate: '2026-03-01', completionDate: '2026-03-31',
    productionLead: 'Jake Embleton', creativeLead: 'Cynthia Gentry', accountLead: 'Elena Zheng',
    teamMembers: ['Jake Embleton', 'Cynthia Gentry', 'Stef Luthin'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-ft005', code: 'FT-005', clientName: 'Franklin Templeton', clientSlug: 'franklin-templeton',
    title: 'BENJI Content Series', brief: 'Educational content series explaining tokenised assets for crypto-native audience.',
    services: ['Brand Strategy', 'Content', 'Social'], status: 'Active', type: 'Monthly Remit',
    startDate: '2026-02-01', completionDate: '2026-06-30',
    productionLead: 'Samantha Kelly', creativeLead: 'Samantha Kelly', accountLead: 'Elena Zheng',
    teamMembers: ['Samantha Kelly', 'Cynthia Gentry', 'Jake Embleton', 'Kevin Arteaga'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-rsk001', code: 'RSK-001', clientName: 'Rootstock', clientSlug: 'rootstock',
    title: 'Brand Refresh Phase 2', brief: 'Applying new visual identity across all touchpoints. Developer portal redesign assets.',
    services: ['Brand Design', 'Visual Identity'], status: 'Active', type: 'Monthly Remit',
    startDate: '2026-01-10', completionDate: '2026-04-01',
    productionLead: 'Kevin Moran', creativeLead: 'Kevin Moran', accountLead: 'Omar Anwar',
    teamMembers: ['Kevin Moran', 'Amanda Eyer', 'Samantha Kelly', 'Omar Anwar'],
    freelancers: ['Studio Parallax'], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-rsk003', code: 'RSK-003', clientName: 'Rootstock', clientSlug: 'rootstock',
    title: 'Motion Content Q1', brief: 'Explainer animations and social motion content for Rootstock channels.',
    services: ['Motion Graphics', 'Animation'], status: 'Active', type: 'Monthly Remit',
    startDate: '2026-01-15', completionDate: '2026-03-31',
    productionLead: 'Tolani Daniel', creativeLead: 'Ben Lydiat', accountLead: 'Omar Anwar',
    teamMembers: ['Tolani Daniel', 'Omar Anwar'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-rom001', code: 'ROM-001', clientName: 'Rome Protocol', clientSlug: 'rome-protocol',
    title: 'Launch Content Package', brief: 'Pre-launch narrative foundation — blog series, social content, brand positioning.',
    services: ['Brand Strategy', 'Content'], status: 'Active', type: 'One Time',
    startDate: '2025-12-01', completionDate: '2026-04-15',
    productionLead: 'Samantha Kelly', creativeLead: 'Samantha Kelly', accountLead: 'Elena Zheng',
    teamMembers: ['Samantha Kelly', 'Elena Zheng'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-mid002', code: 'MID-002', clientName: 'Midnight', clientSlug: 'midnight',
    title: 'Testnet Launch Campaign', brief: 'Content and PR for Midnight testnet launch. Developer onboarding materials.',
    services: ['Brand Content', 'PR'], status: 'Active', type: 'Monthly Remit',
    startDate: '2026-02-01', completionDate: '2026-05-31',
    productionLead: 'Samantha Kelly', creativeLead: 'Samantha Kelly', accountLead: 'Omar Anwar',
    teamMembers: ['Samantha Kelly', 'Destini', 'Madisen', 'Omar Anwar'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-ctn003', code: 'CTN-003', clientName: 'Canton', clientSlug: 'canton',
    title: 'Enterprise Case Studies', brief: 'Case study series highlighting real-world Canton Network participants.',
    services: ['Content', 'Copywriting'], status: 'Active', type: 'Monthly Remit',
    startDate: '2026-02-15', completionDate: '2026-06-30',
    productionLead: 'Cynthia Gentry', creativeLead: 'Cynthia Gentry', accountLead: 'Elena Zheng',
    teamMembers: ['Cynthia Gentry', 'Janelle', 'Kim', 'Elena Zheng'],
    freelancers: [], unit: 'Brand', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
  {
    id: 'p-rsk004', code: 'RSK-004', clientName: 'Rootstock Collective', clientSlug: 'rootstock',
    title: 'Community Content', brief: 'Content for Rootstock Collective community channels.',
    services: ['Social Content'], status: 'In Progress', type: 'As-Needed',
    startDate: '2026-03-01', completionDate: '',
    productionLead: 'Omar Anwar', creativeLead: 'Omar Anwar', accountLead: 'Omar Anwar',
    teamMembers: ['Omar Anwar'],
    freelancers: [], unit: 'Accounts', sowUrl: '#', linearBoardUrl: '#',
    preAlignmentComplete: false, briefStatus: 'Draft',
  },
  {
    id: 'p-int001', code: 'INT-001', clientName: 'SCRIB3', clientSlug: '',
    title: 'Internal Brand Refresh', brief: 'SCRIB3-OS build + internal brand system.',
    services: ['Brand Design', 'Development'], status: 'Active', type: 'One Time',
    startDate: '2026-01-01', completionDate: '',
    productionLead: 'Ben Lydiat', creativeLead: 'Kevin Moran', accountLead: 'Ben Lydiat',
    teamMembers: ['Ben Lydiat', 'Kevin Moran', 'CK'],
    freelancers: [], unit: 'Brand', sowUrl: '', linearBoardUrl: '',
    preAlignmentComplete: true, briefStatus: 'Complete',
  },
];

export const UNITS_WITH_PROJECTS = [...new Set(mockProjects.map((p) => p.unit))].sort();
export const CLIENTS_WITH_PROJECTS = [...new Set(mockProjects.map((p) => p.clientName))].sort();
