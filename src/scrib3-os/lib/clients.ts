// ===== Client Data Layer =====
// Plan v4 §3A–3K — Client Registry, MD Files, Blueprints, Portals
// Priority clients: Cardano, Franklin Templeton, Rootstock, Rome Protocol, Midnight, Canton

export interface ClientContact {
  name: string;
  role: string;
  email: string;
  commsPreference: string;
  isPrimary: boolean;
}

export interface ScopeWatchItem {
  requestType: string;
  inScope: boolean;
  approvedResponse: string;
}

export interface ActiveProject {
  code: string;
  title: string;
  status: string;
  lead: string;
  start: string;
  blocker: string;
}

export interface ClientProfile {
  id: string;
  slug: string;
  companyName: string;
  industry: string;
  website: string;
  twitter: string;
  linkedin: string;
  discord: string;
  contractStart: string;
  contractType: 'Monthly Remit' | 'One Time' | 'As-Needed';
  accountHealth: '🔴' | '🟠' | '🟡' | '🟢' | '⭐';
  accountLead: string;
  creativeLead: string;
  prLead: string;
  slackChannel: string;
  // Brand
  primaryColour: string;
  secondaryColours: string[];
  primaryFont: string;
  toneOfVoice: string;
  keyMessaging: string[];
  contentDos: string[];
  contentDonts: string[];
  // Services
  servicesActive: { service: string; description: string; scopeNotes: string }[];
  // Strategy
  macroStrategy: string;
  currentSprintFocus: string;
  whatWeAreNotDoing: string;
  // Contacts
  contacts: ClientContact[];
  // Projects
  activeProjects: ActiveProject[];
  // Upcoming
  upcomingDates: { date: string; event: string; who: string }[];
}

export const priorityClients: ClientProfile[] = [
  {
    id: 'cl-cardano', slug: 'cardano', companyName: 'Cardano', industry: 'Layer 1 Blockchain',
    website: 'cardano.org', twitter: '@Cardano', linkedin: 'cardano-foundation', discord: 'cardano.org/discord',
    contractStart: '2025-06-01', contractType: 'Monthly Remit', accountHealth: '🟢',
    accountLead: 'Elena Zheng', creativeLead: 'Kevin Moran', prLead: 'Matthew Brannon',
    slackChannel: '#cardano-scrib3',
    primaryColour: '#0033AD', secondaryColours: ['#1A44B8', '#E8E8E8'], primaryFont: 'Chivo',
    toneOfVoice: 'Authoritative yet accessible. Academic rigour without jargon. Community-first.',
    keyMessaging: ['Peer-reviewed blockchain', 'Sustainable PoS', 'Real-world utility', 'Global financial operating system'],
    contentDos: ['Reference research papers', 'Highlight developer ecosystem', 'Use data-driven claims'],
    contentDonts: ['Never compare directly to Ethereum', 'Avoid hype language', 'No price predictions'],
    servicesActive: [
      { service: 'Brand Content', description: 'Monthly social + blog content', scopeNotes: '20 posts/mo + 4 long-form' },
      { service: 'PR', description: 'Media relations + thought leadership', scopeNotes: 'Monthly coverage targets' },
      { service: 'Motion Graphics', description: 'Explainer animations', scopeNotes: '2-3 per quarter' },
    ],
    macroStrategy: 'Position Cardano as the research-driven blockchain building real-world utility. Shift narrative from "Ethereum killer" to "complementary infrastructure for global finance."',
    currentSprintFocus: 'Q1 campaign: "Built Different" — highlighting Cardano\'s unique approach to blockchain development through peer review.',
    whatWeAreNotDoing: 'Token price content, DeFi yield promotion, competitive comparison pieces, event management.',
    contacts: [
      { name: 'Tim Harrison', role: 'VP Communications', email: 'tim@cardanofoundation.org', commsPreference: 'Email + Slack', isPrimary: true },
      { name: 'Maria Chen', role: 'Content Director', email: 'maria@cardanofoundation.org', commsPreference: 'Slack', isPrimary: false },
    ],
    activeProjects: [
      { code: 'CDN-012', title: 'Q1 Brand Campaign', status: 'Active', lead: 'Kevin Moran', start: '2026-01-15', blocker: '' },
      { code: 'CDN-014', title: 'Social Content March', status: 'In Progress', lead: 'Jake Embleton', start: '2026-03-01', blocker: '' },
    ],
    upcomingDates: [
      { date: '2026-04-05', event: 'Q1 Campaign Delivery', who: 'Kevin + Elena' },
      { date: '2026-04-15', event: 'QBR Presentation', who: 'Elena + Nick' },
    ],
  },
  {
    id: 'cl-franklin', slug: 'franklin-templeton', companyName: 'Franklin Templeton', industry: 'TradFi / Asset Management',
    website: 'franklintempleton.com', twitter: '@FTI_US', linkedin: 'franklin-templeton', discord: '',
    contractStart: '2025-09-01', contractType: 'Monthly Remit', accountHealth: '🟡',
    accountLead: 'Elena Zheng', creativeLead: 'Samantha Kelly', prLead: 'Matthew Brannon',
    slackChannel: '#franklin-scrib3',
    primaryColour: '#00205B', secondaryColours: ['#4A90D9', '#F5F5F5'], primaryFont: 'Noto Sans',
    toneOfVoice: 'Institutional authority meets digital-native clarity. Bridging TradFi credibility with Web3 innovation.',
    keyMessaging: ['$1.5T AUM meets blockchain', 'Tokenized money market fund', 'Institutional-grade Web3'],
    contentDos: ['Cite fund performance data', 'Reference regulatory compliance', 'Highlight institutional partnerships'],
    contentDonts: ['Never use "crypto bro" language', 'Avoid speculative claims', 'No comparisons to DeFi yields'],
    servicesActive: [
      { service: 'Brand Strategy', description: 'Web3 positioning for TradFi brand', scopeNotes: 'Quarterly strategy refresh' },
      { service: 'Content', description: 'Educational content + social', scopeNotes: '15 posts/mo + 2 thought leadership' },
      { service: 'PR', description: 'Crypto media + TradFi crossover', scopeNotes: 'Monthly pitching' },
    ],
    macroStrategy: 'Establish Franklin Templeton as the most credible TradFi brand in Web3. Lead with the tokenized fund narrative.',
    currentSprintFocus: 'BENJI token fund content series — educational explainers for crypto-native audience on what tokenized assets mean.',
    whatWeAreNotDoing: 'Retail investment advice, DeFi protocol integrations, meme content, community management.',
    contacts: [
      { name: 'David Park', role: 'Digital Assets Marketing', email: 'david.park@franklintempleton.com', commsPreference: 'Email', isPrimary: true },
    ],
    activeProjects: [
      { code: 'FT-005', title: 'BENJI Content Series', status: 'Active', lead: 'Samantha Kelly', start: '2026-02-01', blocker: 'Compliance review delays' },
    ],
    upcomingDates: [
      { date: '2026-04-10', event: 'BENJI Series Phase 2 Launch', who: 'Samantha + Elena' },
    ],
  },
  {
    id: 'cl-rootstock', slug: 'rootstock', companyName: 'Rootstock', industry: 'Bitcoin Sidechain / Smart Contracts',
    website: 'rootstock.io', twitter: '@rootaborobar', linkedin: 'rootstock-labs', discord: 'rootstock.io/discord',
    contractStart: '2025-07-01', contractType: 'Monthly Remit', accountHealth: '🟢',
    accountLead: 'Omar Anwar', creativeLead: 'Kevin Moran', prLead: 'Hugh',
    slackChannel: '#rootstock-scrib3',
    primaryColour: '#FF6B00', secondaryColours: ['#1A1A1A', '#FFFFFF'], primaryFont: 'Inter',
    toneOfVoice: 'Bold, technical, Bitcoin-maximalist-friendly. Pragmatic innovation.',
    keyMessaging: ['Smart contracts on Bitcoin', 'Merged mining security', 'EVM-compatible Bitcoin layer'],
    contentDos: ['Lead with Bitcoin narrative', 'Highlight merged mining', 'Technical depth welcome'],
    contentDonts: ['Never position against Bitcoin', 'Avoid "Ethereum clone" framing', 'No DeFi degen content'],
    servicesActive: [
      { service: 'Brand Refresh', description: 'Visual identity overhaul', scopeNotes: 'Logo, type, colour, guidelines' },
      { service: 'Content', description: 'Developer + community content', scopeNotes: '12 posts/mo' },
      { service: 'Motion', description: 'Explainer + social motion', scopeNotes: '1-2 per month' },
    ],
    macroStrategy: 'Reposition Rootstock as the leading Bitcoin smart contract platform. Make the brand as bold and recognisable as the tech.',
    currentSprintFocus: 'Brand refresh Phase 2 — applying new identity across all touchpoints. Developer portal redesign assets.',
    whatWeAreNotDoing: 'Exchange listings support, tokenomics content, competitor comparison pieces.',
    contacts: [
      { name: 'Diego Gutierrez', role: 'Chief Scientist', email: 'diego@rootstocklabs.com', commsPreference: 'Slack', isPrimary: true },
      { name: 'Anna Schmidt', role: 'Marketing Lead', email: 'anna@rootstocklabs.com', commsPreference: 'Slack + Email', isPrimary: false },
    ],
    activeProjects: [
      { code: 'RSK-001', title: 'Brand Refresh Phase 2', status: 'Active', lead: 'Kevin Moran', start: '2026-01-10', blocker: '' },
      { code: 'RSK-003', title: 'Motion Content Q1', status: 'Active', lead: 'Tolani Daniel', start: '2026-01-15', blocker: '' },
    ],
    upcomingDates: [
      { date: '2026-04-01', event: 'Brand Refresh Final Delivery', who: 'Kevin + Omar' },
      { date: '2026-04-20', event: 'Developer Portal Assets', who: 'Kevin' },
    ],
  },
  {
    id: 'cl-rome', slug: 'rome-protocol', companyName: 'Rome Protocol', industry: 'Cross-chain Infrastructure',
    website: 'rome.io', twitter: '@RomeProtocol', linkedin: '', discord: '',
    contractStart: '2025-11-01', contractType: 'One Time', accountHealth: '🟢',
    accountLead: 'Elena Zheng', creativeLead: 'Samantha Kelly', prLead: '',
    slackChannel: '#rome-scrib3',
    primaryColour: '#8B0000', secondaryColours: ['#D4AF37', '#1A1A1A'], primaryFont: 'Playfair Display',
    toneOfVoice: 'Grand, historical metaphor meets cutting-edge tech. "All roads lead to Rome."',
    keyMessaging: ['Shared sequencing', 'Cross-chain atomic composability', 'The highway between blockchains'],
    contentDos: ['Use Roman empire metaphors tastefully', 'Emphasise infrastructure narrative', 'Technical depth for devs'],
    contentDonts: ['Avoid generic "interoperability" claims', 'No bridge comparisons', 'No meme-heavy content'],
    servicesActive: [
      { service: 'Brand Strategy', description: 'Launch positioning', scopeNotes: 'Fixed scope engagement' },
      { service: 'Content', description: 'Launch content package', scopeNotes: 'Blog series + social' },
    ],
    macroStrategy: 'Position Rome Protocol as essential cross-chain infrastructure — the "highway system" of Web3.',
    currentSprintFocus: 'Pre-launch content pipeline. Building narrative foundation before mainnet.',
    whatWeAreNotDoing: 'Post-launch community management, token marketing, exchange partnerships.',
    contacts: [
      { name: 'Marcus Webb', role: 'Co-Founder', email: 'marcus@rome.io', commsPreference: 'Telegram', isPrimary: true },
    ],
    activeProjects: [
      { code: 'ROM-001', title: 'Launch Content Package', status: 'Active', lead: 'Samantha Kelly', start: '2025-12-01', blocker: '' },
    ],
    upcomingDates: [
      { date: '2026-04-15', event: 'Pre-launch Content Drop', who: 'Samantha + Elena' },
    ],
  },
  {
    id: 'cl-midnight', slug: 'midnight', companyName: 'Midnight', industry: 'Privacy Blockchain / Cardano Ecosystem',
    website: 'midnight.network', twitter: '@MidnightNtwrk', linkedin: '', discord: '',
    contractStart: '2026-01-01', contractType: 'Monthly Remit', accountHealth: '🟢',
    accountLead: 'Omar Anwar', creativeLead: 'Samantha Kelly', prLead: 'Destini',
    slackChannel: '#midnight-scrib3',
    primaryColour: '#1A0033', secondaryColours: ['#7B2FBE', '#E0E0E0'], primaryFont: 'Space Grotesk',
    toneOfVoice: 'Mysterious, sophisticated, privacy-focused. Serious tech with elegant presentation.',
    keyMessaging: ['Data protection blockchain', 'Selective disclosure', 'Built on Cardano technology'],
    contentDos: ['Lead with privacy narrative', 'Reference Cardano heritage', 'Explain ZK proofs simply'],
    contentDonts: ['Never associate with illicit use cases', 'Avoid "dark web" connotations', 'No Monero/Zcash comparisons'],
    servicesActive: [
      { service: 'Brand Content', description: 'Monthly content calendar', scopeNotes: '15 posts/mo' },
      { service: 'PR', description: 'Privacy tech media', scopeNotes: 'Bi-weekly pitching' },
    ],
    macroStrategy: 'Establish Midnight as the enterprise-grade privacy layer. Lead with "data protection" not "anonymity."',
    currentSprintFocus: 'Testnet launch content. Developer onboarding materials and community education.',
    whatWeAreNotDoing: 'Token launch support, exchange listings, influencer marketing.',
    contacts: [
      { name: 'Sarah Jennings', role: 'Head of Marketing', email: 'sarah@midnight.network', commsPreference: 'Email', isPrimary: true },
    ],
    activeProjects: [
      { code: 'MID-002', title: 'Testnet Launch Campaign', status: 'Active', lead: 'Samantha Kelly', start: '2026-02-01', blocker: '' },
    ],
    upcomingDates: [
      { date: '2026-04-08', event: 'Testnet Content Drop', who: 'Samantha + Omar' },
    ],
  },
  {
    id: 'cl-canton', slug: 'canton', companyName: 'Canton', industry: 'Enterprise Blockchain / DeFi Infrastructure',
    website: 'canton.network', twitter: '@canton_network', linkedin: 'canton-network', discord: '',
    contractStart: '2025-08-01', contractType: 'Monthly Remit', accountHealth: '🟡',
    accountLead: 'Elena Zheng', creativeLead: 'Cynthia Gentry', prLead: '',
    slackChannel: '#canton-scrib3',
    primaryColour: '#0A2540', secondaryColours: ['#00B4D8', '#FFFFFF'], primaryFont: 'IBM Plex Sans',
    toneOfVoice: 'Enterprise authority. Clear, precise, jargon-appropriate for institutional audience.',
    keyMessaging: ['Privacy-enabled interoperability', 'Enterprise DeFi', 'Regulated financial infrastructure'],
    contentDos: ['Reference institutional use cases', 'Cite regulatory frameworks', 'Technical precision'],
    contentDonts: ['No retail DeFi language', 'Avoid "decentralisation maximalism"', 'No memes'],
    servicesActive: [
      { service: 'Content', description: 'Enterprise-focused content', scopeNotes: '10 posts/mo' },
    ],
    macroStrategy: 'Position Canton as the trust layer for regulated financial institutions entering DeFi.',
    currentSprintFocus: 'Enterprise case study series. Highlighting real-world Canton Network participants.',
    whatWeAreNotDoing: 'Retail audience content, community Discord management, event sponsorship.',
    contacts: [
      { name: 'Raj Patel', role: 'Marketing Director', email: 'raj@canton.network', commsPreference: 'Email', isPrimary: true },
    ],
    activeProjects: [
      { code: 'CTN-003', title: 'Enterprise Case Studies', status: 'Active', lead: 'Cynthia Gentry', start: '2026-02-15', blocker: '' },
    ],
    upcomingDates: [
      { date: '2026-04-12', event: 'Case Study #1 Publish', who: 'Cynthia + Elena' },
    ],
  },
];

export const healthColors: Record<string, string> = {
  '🔴': '#E74C3C',
  '🟠': '#E67E22',
  '🟡': '#F1C40F',
  '🟢': '#27AE60',
  '⭐': '#D7ABC5',
};
