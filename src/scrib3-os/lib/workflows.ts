// ===== Workflow Templates =====
// Plan v4 T3 #10 — Process Documentation
// Pre-populated task sequences + role assignments per project type

export interface WorkflowStep {
  id: string;
  title: string;
  assigneeRole: string; // production_lead, creative_lead, account_lead, etc.
  phase: string;
  required: boolean;
  description: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  projectType: string;
  steps: WorkflowStep[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-podcast', name: 'Podcast Production', projectType: 'Podcast',
    steps: [
      { id: 's1', title: 'Guest Research & Outreach', assigneeRole: 'account_lead', phase: 'Pre-Production', required: true, description: 'Identify and confirm guest. Send briefing document.' },
      { id: 's2', title: 'Recording Setup & Script', assigneeRole: 'production_lead', phase: 'Pre-Production', required: true, description: 'Prepare recording environment, talking points, intro/outro scripts.' },
      { id: 's3', title: 'Recording Session', assigneeRole: 'production_lead', phase: 'Production', required: true, description: 'Record episode. Capture B-roll if applicable.' },
      { id: 's4', title: 'Editing & Post-Production', assigneeRole: 'creative_lead', phase: 'Production', required: true, description: 'Edit audio, add music/SFX, create clips.' },
      { id: 's5', title: 'Motion Graphics & Thumbnails', assigneeRole: 'creative_lead', phase: 'Production', required: false, description: 'Create video thumbnails, social clips with motion overlays.' },
      { id: 's6', title: 'Internal Review', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Team reviews final edit before client.' },
      { id: 's7', title: 'Client Review', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Send to client for approval. Track feedback.' },
      { id: 's8', title: 'Distribution & Publishing', assigneeRole: 'production_lead', phase: 'Delivery', required: true, description: 'Publish to platforms. Submit social clips.' },
    ],
  },
  {
    id: 'wf-social', name: 'Social Content Calendar', projectType: 'Social',
    steps: [
      { id: 's1', title: 'Content Strategy Alignment', assigneeRole: 'account_lead', phase: 'Strategy', required: true, description: 'Confirm content pillars, messaging themes, and calendar cadence with client.' },
      { id: 's2', title: 'Content Calendar Draft', assigneeRole: 'creative_lead', phase: 'Planning', required: true, description: 'Build monthly content calendar with post types, copy themes, visual direction.' },
      { id: 's3', title: 'Copy Writing', assigneeRole: 'creative_lead', phase: 'Production', required: true, description: 'Write all post copy. Include CTAs, hashtags, mentions.' },
      { id: 's4', title: 'Visual Asset Creation', assigneeRole: 'creative_lead', phase: 'Production', required: true, description: 'Design graphics, source imagery, create templates.' },
      { id: 's5', title: 'Internal Review', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Team reviews full calendar before client.' },
      { id: 's6', title: 'Client Approval', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Client reviews and approves calendar.' },
      { id: 's7', title: 'Scheduling & Publishing', assigneeRole: 'production_lead', phase: 'Delivery', required: true, description: 'Schedule all approved posts. Monitor engagement.' },
    ],
  },
  {
    id: 'wf-brand', name: 'Brand Identity', projectType: 'Brand',
    steps: [
      { id: 's1', title: 'Discovery & Research', assigneeRole: 'creative_lead', phase: 'Discovery', required: true, description: 'Competitor audit, audience research, brand positioning workshop.' },
      { id: 's2', title: 'Moodboard & Direction', assigneeRole: 'creative_lead', phase: 'Concept', required: true, description: 'Visual direction exploration. 2-3 concepts presented.' },
      { id: 's3', title: 'Logo Concepts', assigneeRole: 'creative_lead', phase: 'Concept', required: true, description: 'Primary logo, variants, icon. Min 3 directions.' },
      { id: 's4', title: 'Typography & Colour System', assigneeRole: 'creative_lead', phase: 'Build', required: true, description: 'Type hierarchy, colour palette, usage rules.' },
      { id: 's5', title: 'Brand Guidelines Document', assigneeRole: 'creative_lead', phase: 'Build', required: true, description: 'Full guidelines doc with usage examples, do/don\'t, file formats.' },
      { id: 's6', title: 'Internal Review', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Strategy + creative review before client.' },
      { id: 's7', title: 'Client Presentation', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Present brand system to client. Gather feedback.' },
      { id: 's8', title: 'Revisions (2 rounds)', assigneeRole: 'creative_lead', phase: 'Review', required: true, description: '2 revision rounds included per SOW.' },
      { id: 's9', title: 'Final Delivery', assigneeRole: 'production_lead', phase: 'Delivery', required: true, description: 'Deliver all files: logos, guidelines, templates, source files.' },
    ],
  },
  {
    id: 'wf-event', name: 'Event Support', projectType: 'Event',
    steps: [
      { id: 's1', title: 'Event Brief & Timeline', assigneeRole: 'account_lead', phase: 'Planning', required: true, description: 'Confirm event details, deliverables needed, deadlines.' },
      { id: 's2', title: 'Collateral Design', assigneeRole: 'creative_lead', phase: 'Production', required: true, description: 'Banners, signage, swag designs, presentation templates.' },
      { id: 's3', title: 'Content Package', assigneeRole: 'creative_lead', phase: 'Production', required: false, description: 'Social posts, email templates, press kit.' },
      { id: 's4', title: 'Client Review', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Client approves all collateral.' },
      { id: 's5', title: 'Print & Production', assigneeRole: 'production_lead', phase: 'Delivery', required: true, description: 'Send to print. Coordinate delivery logistics.' },
    ],
  },
  {
    id: 'wf-pr', name: 'PR Campaign', projectType: 'PR',
    steps: [
      { id: 's1', title: 'Narrative Development', assigneeRole: 'creative_lead', phase: 'Strategy', required: true, description: 'Develop key messages, story angles, media targets.' },
      { id: 's2', title: 'Press Kit Creation', assigneeRole: 'creative_lead', phase: 'Production', required: true, description: 'Press release, fact sheet, exec bios, imagery.' },
      { id: 's3', title: 'Media List Building', assigneeRole: 'production_lead', phase: 'Production', required: true, description: 'Target journalists, publications, podcasts.' },
      { id: 's4', title: 'Internal Review', assigneeRole: 'account_lead', phase: 'Review', required: true, description: 'Legal/compliance check on all materials.' },
      { id: 's5', title: 'Pitch Execution', assigneeRole: 'production_lead', phase: 'Delivery', required: true, description: 'Send pitches, follow up, track responses.' },
      { id: 's6', title: 'Coverage Tracking', assigneeRole: 'production_lead', phase: 'Delivery', required: true, description: 'Monitor placements, compile coverage report.' },
    ],
  },
];
