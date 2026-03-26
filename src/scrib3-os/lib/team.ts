// ===== Team Data Layer =====
// Plan v4 §2 — Full 29-person roster from the confirmed team table
// Profile photos: Google Drive /1xqqFfk3yUUhlccTOzIcW7todPIXLOB0J (not wired yet)

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team' | 'csuite';
  title: string;
  unit: string;
  location: string;
  timezone: string;
  isOnline: boolean;
  availability: 'available' | 'busy' | 'away' | 'offline';
  bio: string;
  skillsets: string[];
  socialLinks: { platform: string; url: string }[];
  currentClients: string[];
  currentProjects: string[];
  joinedDate: string;
  xp: number;
  bandwidthPct: number;
}

export const mockTeam: TeamMember[] = [
  {
    id: 'tm-ben', name: 'Ben Lydiat', email: 'ben.lydiat@scrib3.co', role: 'admin',
    title: 'VP of Creative', unit: 'Brand', location: 'Portugal', timezone: 'Europe/Lisbon',
    isOnline: true, availability: 'available',
    bio: 'Leading creative vision across all SCRIB3 engagements. Obsessed with design systems, brand craft, and making crypto accessible through visual storytelling.',
    skillsets: ['Brand Strategy', 'Design Systems', 'Creative Direction', 'Web3'],
    socialLinks: [{ platform: 'Twitter', url: '#' }, { platform: 'LinkedIn', url: '#' }],
    currentClients: ['Cardano', 'Rootstock', 'Franklin Templeton'],
    currentProjects: ['RSK-001', 'CDN-012', 'INT-001'],
    joinedDate: '2023-03-01', xp: 820, bandwidthPct: 85,
  },
  {
    id: 'tm-sixtyne', name: 'Sixtyne Perez', email: 'sixtyne@scrib3.co', role: 'csuite',
    title: 'Chief Creative Officer', unit: 'C-Suite', location: 'Paris, FR', timezone: 'Europe/Paris',
    isOnline: true, availability: 'busy',
    bio: 'Overseeing creative output, production workflows, and team culture. Championing operational excellence and financial transparency.',
    skillsets: ['Creative Leadership', 'Production Management', 'Finance', 'Team Development'],
    socialLinks: [{ platform: 'LinkedIn', url: '#' }],
    currentClients: ['All — oversight'], currentProjects: ['All — oversight'],
    joinedDate: '2022-06-01', xp: 950, bandwidthPct: 95,
  },
  {
    id: 'tm-nick', name: 'Nick Mitchell', email: 'nick@scrib3.co', role: 'csuite',
    title: 'Chief Strategy Officer', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'away',
    bio: 'Setting strategic direction for client engagements and internal processes. Focused on alignment, quality standards, and what "good" looks like.',
    skillsets: ['Strategy', 'Client Relations', 'Process Design', 'Quality Standards'],
    socialLinks: [{ platform: 'Twitter', url: '#' }, { platform: 'LinkedIn', url: '#' }],
    currentClients: ['Franklin Templeton', 'Cardano'], currentProjects: ['FT-005', 'CDN-012'],
    joinedDate: '2022-04-01', xp: 780, bandwidthPct: 70,
  },
  {
    id: 'tm-jb', name: 'JB', email: 'jb@scrib3.co', role: 'csuite',
    title: 'Chief Executive Officer', unit: 'C-Suite', location: 'Chicago, USA', timezone: 'America/Chicago',
    isOnline: false, availability: 'away',
    bio: '', skillsets: ['Leadership', 'Business Development', 'Web3'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2021-01-01', xp: 500, bandwidthPct: 40,
  },
  {
    id: 'tm-ross', name: 'Ross Booth', email: 'ross@scrib3.co', role: 'csuite',
    title: 'Co-Founder', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline',
    bio: '', skillsets: ['Business Development', 'Partnerships'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2021-01-01', xp: 400, bandwidthPct: 20,
  },
  {
    id: 'tm-arthur', name: 'Arthur Stern', email: 'arthur@scrib3.co', role: 'csuite',
    title: 'Co-Founder / COO', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline',
    bio: '', skillsets: ['Operations', 'Finance', 'Partnerships'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2021-01-01', xp: 400, bandwidthPct: 25,
  },
  {
    id: 'tm-ishan', name: 'Ishan', email: 'ishan@scrib3.co', role: 'csuite',
    title: 'Co-Founder', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline',
    bio: '', skillsets: ['Technology', 'Web3', 'Product'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2021-01-01', xp: 350, bandwidthPct: 15,
  },
  {
    id: 'tm-elena', name: 'Elena Zheng', email: 'elena@scrib3.co', role: 'team',
    title: 'Senior Account Lead', unit: 'Accounts', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available',
    bio: 'Managing SCRIB3\'s largest client relationships. Ensuring alignment between client goals and creative output.',
    skillsets: ['Account Management', 'Client Relations', 'Strategy', 'Project Management'],
    socialLinks: [{ platform: 'LinkedIn', url: '#' }],
    currentClients: ['Cardano', 'Franklin Templeton', 'Canton', 'Rome Protocol'],
    currentProjects: ['CDN-012', 'FT-005', 'CTN-003', 'ROM-001'],
    joinedDate: '2023-06-01', xp: 620, bandwidthPct: 85,
  },
  {
    id: 'tm-omar', name: 'Omar Anwar', email: 'omar@scrib3.co', role: 'team',
    title: 'Account Lead', unit: 'Accounts', location: 'UK', timezone: 'Europe/London',
    isOnline: true, availability: 'available',
    bio: 'Leading the Rootstock and Midnight accounts. Focused on clear communication and proactive client management.',
    skillsets: ['Account Management', 'Client Relations', 'Web3'],
    socialLinks: [{ platform: 'LinkedIn', url: '#' }],
    currentClients: ['Rootstock', 'Midnight', 'Rootstock Collective'],
    currentProjects: ['RSK-001', 'MID-002', 'RSK-004'],
    joinedDate: '2024-01-15', xp: 480, bandwidthPct: 75,
  },
  {
    id: 'tm-haley', name: 'Haley Stewart Torculas', email: 'haley@scrib3.co', role: 'team',
    title: 'People & Operations', unit: 'Ops', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available',
    bio: 'Running people operations, onboarding, and team culture initiatives.',
    skillsets: ['HR', 'Operations', 'Onboarding', 'Culture'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2023-09-01', xp: 310, bandwidthPct: 60,
  },
  {
    id: 'tm-camila', name: 'Camila', email: 'camila@scrib3.co', role: 'team',
    title: 'Operations — Invoicing POC', unit: 'Ops', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available',
    bio: 'Processing vendor invoices and managing payment workflows.',
    skillsets: ['Finance', 'Invoicing', 'Operations'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2024-06-01', xp: 180, bandwidthPct: 55,
  },
  {
    id: 'tm-matt', name: 'Matthew Brannon', email: 'matt@scrib3.co', role: 'team',
    title: 'PR Lead', unit: 'PR', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'busy',
    bio: 'Leading PR strategy and media relations across all client engagements.',
    skillsets: ['PR Strategy', 'Media Relations', 'Crisis Comms', 'Web3 PR'],
    socialLinks: [{ platform: 'Twitter', url: '#' }],
    currentClients: ['Cardano', 'Franklin Templeton', 'Rootstock'],
    currentProjects: ['CDN-012', 'FT-005', 'RSK-001'],
    joinedDate: '2023-04-01', xp: 540, bandwidthPct: 80,
  },
  {
    id: 'tm-jenny', name: 'Jenny', email: 'jenny@scrib3.co', role: 'team',
    title: 'PR / Broadcast', unit: 'PR', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'away', bio: '', skillsets: ['PR', 'Broadcast', 'Media'],
    socialLinks: [], currentClients: ['Cardano'], currentProjects: ['CDN-012'],
    joinedDate: '2024-02-01', xp: 220, bandwidthPct: 65,
  },
  {
    id: 'tm-destini', name: 'Destini', email: 'destini@scrib3.co', role: 'team',
    title: 'PR', unit: 'PR', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline', bio: '', skillsets: ['PR', 'Media Relations'],
    socialLinks: [], currentClients: ['Midnight'], currentProjects: ['MID-002'],
    joinedDate: '2024-03-01', xp: 190, bandwidthPct: 50,
  },
  {
    id: 'tm-janelle', name: 'Janelle', email: 'janelle@scrib3.co', role: 'team',
    title: 'PR', unit: 'PR', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline', bio: '', skillsets: ['PR', 'Content'],
    socialLinks: [], currentClients: ['Canton'], currentProjects: ['CTN-003'],
    joinedDate: '2024-05-01', xp: 160, bandwidthPct: 45,
  },
  {
    id: 'tm-hugh', name: 'Hugh', email: 'hugh@scrib3.co', role: 'team',
    title: 'PR / Podcasts', unit: 'PR', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'away', bio: '', skillsets: ['PR', 'Podcasts', 'Audio'],
    socialLinks: [], currentClients: ['Cardano', 'Rootstock'], currentProjects: ['CDN-012', 'RSK-001'],
    joinedDate: '2024-01-01', xp: 280, bandwidthPct: 70,
  },
  {
    id: 'tm-kevin', name: 'Kevin Moran', email: 'kevin@scrib3.co', role: 'team',
    title: 'Brand Designer', unit: 'Brand', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'busy',
    bio: 'Designing brand systems and visual identities for SCRIB3 clients. Pixel-perfect execution with strategic intent.',
    skillsets: ['Brand Design', 'Visual Identity', 'Typography', 'Figma'],
    socialLinks: [{ platform: 'Portfolio', url: '#' }],
    currentClients: ['Rootstock', 'Cardano', 'SCRIB3'],
    currentProjects: ['RSK-001', 'CDN-012', 'INT-001'],
    joinedDate: '2023-07-01', xp: 580, bandwidthPct: 90,
  },
  {
    id: 'tm-kevina', name: 'Kevin Arteaga', email: 'kevin.arteaga@scrib3.co', role: 'team',
    title: 'PR Account Manager', unit: 'PR', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available', bio: '', skillsets: ['PR', 'Account Management'],
    socialLinks: [], currentClients: ['Franklin Templeton'], currentProjects: ['FT-005'],
    joinedDate: '2024-08-01', xp: 140, bandwidthPct: 60,
  },
  {
    id: 'tm-sam', name: 'Samantha Kelly', email: 'sam@scrib3.co', role: 'team',
    title: 'Brand Strategy / Creative', unit: 'Brand', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'busy',
    bio: 'Bridging strategy and creative execution. Ensuring every deliverable ladders up to the client\'s strategic goals.',
    skillsets: ['Brand Strategy', 'Creative Direction', 'Content Strategy', 'Web3'],
    socialLinks: [{ platform: 'LinkedIn', url: '#' }],
    currentClients: ['Franklin Templeton', 'Rootstock', 'Midnight'],
    currentProjects: ['FT-005', 'RSK-001', 'MID-002'],
    joinedDate: '2023-05-01', xp: 650, bandwidthPct: 95,
  },
  {
    id: 'tm-cynthia', name: 'Cynthia Gentry', email: 'cynthia@scrib3.co', role: 'team',
    title: 'Creative Copywriter', unit: 'Brand', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available',
    bio: 'Crafting copy that converts. Specializing in Web3 messaging and brand voice development.',
    skillsets: ['Copywriting', 'Brand Voice', 'Content Strategy', 'Web3'],
    socialLinks: [],
    currentClients: ['Cardano', 'Franklin Templeton', 'Canton'],
    currentProjects: ['CDN-014', 'FT-005', 'CTN-003'],
    joinedDate: '2023-11-01', xp: 420, bandwidthPct: 95,
  },
  {
    id: 'tm-amanda', name: 'Amanda Eyer', email: 'amanda@scrib3.co', role: 'team',
    title: 'Creative', unit: 'Brand', location: 'Brazil', timezone: 'America/Sao_Paulo',
    isOnline: false, availability: 'away', bio: '', skillsets: ['Design', 'Creative', 'Illustration'],
    socialLinks: [], currentClients: ['Rootstock'], currentProjects: ['RSK-001'],
    joinedDate: '2024-04-01', xp: 240, bandwidthPct: 55,
  },
  {
    id: 'tm-jake', name: 'Jake Embleton', email: 'jake@scrib3.co', role: 'team',
    title: 'Content / Social', unit: 'Brand', location: 'Philippines', timezone: 'Asia/Manila',
    isOnline: false, availability: 'away',
    bio: 'Creating social content that drives engagement in the Web3 space.',
    skillsets: ['Social Media', 'Content Creation', 'Community', 'Web3'],
    socialLinks: [],
    currentClients: ['Franklin Templeton', 'Cardano'],
    currentProjects: ['FT-005', 'CDN-014'],
    joinedDate: '2024-02-15', xp: 340, bandwidthPct: 90,
  },
  {
    id: 'tm-stef', name: 'Stef Luthin', email: 'stef@scrib3.co', role: 'team',
    title: 'Content', unit: 'Brand', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available', bio: '', skillsets: ['Content', 'Writing', 'Research'],
    socialLinks: [], currentClients: ['Cardano'], currentProjects: ['CDN-014'],
    joinedDate: '2024-06-01', xp: 200, bandwidthPct: 50,
  },
  {
    id: 'tm-luke', name: 'Luke', email: 'luke@scrib3.co', role: 'team',
    title: 'Content / Social', unit: 'Brand', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline', bio: '', skillsets: ['Content', 'Social Media'],
    socialLinks: [], currentClients: ['Canton'], currentProjects: ['CTN-003'],
    joinedDate: '2024-07-01', xp: 150, bandwidthPct: 45,
  },
  {
    id: 'tm-tolani', name: 'Tolani Daniel', email: 'tolani@scrib3.co', role: 'team',
    title: 'Motion Graphic Designer', unit: 'Brand', location: 'Nigeria', timezone: 'Africa/Lagos',
    isOnline: true, availability: 'busy',
    bio: 'Bringing brand stories to life through motion. Specializing in explainer animations and social motion content.',
    skillsets: ['Motion Graphics', 'Animation', 'After Effects', 'Cinema 4D'],
    socialLinks: [{ platform: 'Portfolio', url: '#' }],
    currentClients: ['Cardano', 'Rootstock'],
    currentProjects: ['CDN-012', 'RSK-003'],
    joinedDate: '2023-08-01', xp: 510, bandwidthPct: 95,
  },
  {
    id: 'tm-taylor', name: 'Taylor Hadden', email: 'taylor@scrib3.co', role: 'team',
    title: '—', unit: 'Brand', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'offline', bio: '', skillsets: ['Brand'],
    socialLinks: [], currentClients: [], currentProjects: [],
    joinedDate: '2024-09-01', xp: 80, bandwidthPct: 30,
  },
  {
    id: 'tm-madisen', name: 'Madisen', email: 'madisen@scrib3.co', role: 'team',
    title: 'Account Manager', unit: 'Accounts', location: 'USA', timezone: 'America/New_York',
    isOnline: true, availability: 'available', bio: '', skillsets: ['Account Management', 'Client Relations'],
    socialLinks: [], currentClients: ['Midnight'], currentProjects: ['MID-002'],
    joinedDate: '2024-10-01', xp: 120, bandwidthPct: 55,
  },
  {
    id: 'tm-kim', name: 'Kim', email: 'kim@scrib3.co', role: 'team',
    title: 'Account Manager', unit: 'Accounts', location: 'Dubai', timezone: 'Asia/Dubai',
    isOnline: false, availability: 'away', bio: '', skillsets: ['Account Management', 'MENA Markets'],
    socialLinks: [], currentClients: ['Canton'], currentProjects: ['CTN-003'],
    joinedDate: '2024-11-01', xp: 100, bandwidthPct: 50,
  },
  {
    id: 'tm-ck', name: 'CK', email: 'ck@scrib3.co', role: 'team',
    title: 'Collaborator / Dev', unit: '—', location: 'USA', timezone: 'America/New_York',
    isOnline: false, availability: 'away',
    bio: 'Building SCRIB3-OS. Bridging design and development.',
    skillsets: ['Development', 'React', 'TypeScript', 'Web3'],
    socialLinks: [],
    currentClients: ['SCRIB3'], currentProjects: ['INT-001'],
    joinedDate: '2025-01-01', xp: 360, bandwidthPct: 40,
  },
];

export const UNITS = [...new Set(mockTeam.map((m) => m.unit))].sort();
export const LOCATIONS = [...new Set(mockTeam.map((m) => m.location))].sort();

export const availabilityColors: Record<string, string> = {
  available: '#27AE60',
  busy: '#E67E22',
  away: '#F1C40F',
  offline: '#95A5A6',
};

export function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}
