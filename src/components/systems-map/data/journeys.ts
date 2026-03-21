import type { Journey, JourneyKey, JourneyPhase } from "./types.ts";

export const JOURNEYS: Record<JourneyKey, Journey> = {
  new_business: {
    label: "New Business",
    color: "#F97316",
    nodes: ["gmail_outreach","lead_crm","pitch_deck_library","custom_deck","slack_client","notion_client_hub"],
    flows: [
      { from: "gmail_outreach", to: "lead_crm" },
      { from: "slack_client", to: "lead_crm" },
      { from: "lead_crm", to: "pitch_deck_library" },
      { from: "pitch_deck_library", to: "custom_deck" },
      { from: "lead_crm", to: "notion_client_hub" },
    ]
  },
  client_onboarding: {
    label: "Client Onboarding",
    color: "#FF4D4D",
    nodes: ["pitch_deck_library","custom_deck","docusign","quickbooks","fillout_onboarding","notion_client_hub","client_blueprint","md_files","slack_client","google_workspace","claude_code","typeform_fillout"],
    flows: [
      { from: "pitch_deck_library", to: "custom_deck" },
      { from: "custom_deck", to: "docusign" },
      { from: "custom_deck", to: "quickbooks" },
      { from: "docusign", to: "fillout_onboarding" },
      { from: "docusign", to: "notion_client_hub" },
      { from: "quickbooks", to: "notion_client_hub" },
      { from: "fillout_onboarding", to: "notion_client_hub" },
      { from: "fillout_onboarding", to: "md_files" },
      { from: "slack_client", to: "client_blueprint" },
      { from: "google_workspace", to: "client_blueprint" },
      { from: "claude_code", to: "client_blueprint" },
      { from: "client_blueprint", to: "notion_client_hub" },
      { from: "client_blueprint", to: "md_files" },
      { from: "notion_client_hub", to: "md_files" },
    ]
  },
  content_delivery: {
    label: "Content Delivery",
    color: "#00C9A7",
    nodes: ["notion_client_hub","md_files","tone_of_voice","creative_briefs","content_prompts","content_calendar","content_approval","client_dashboard_ext","figma","google_workspace","adobe","slack_client"],
    flows: [
      { from: "notion_client_hub", to: "md_files" },
      { from: "md_files", to: "tone_of_voice" },
      { from: "md_files", to: "creative_briefs" },
      { from: "tone_of_voice", to: "content_prompts" },
      { from: "creative_briefs", to: "content_prompts" },
      { from: "figma", to: "creative_briefs" },
      { from: "google_workspace", to: "md_files" },
      { from: "content_prompts", to: "content_calendar" },
      { from: "adobe", to: "content_calendar" },
      { from: "content_calendar", to: "client_dashboard_ext" },
      { from: "client_dashboard_ext", to: "content_approval" },
      { from: "content_approval", to: "md_files" },
      { from: "content_approval", to: "content_prompts" },
    ]
  },
  task_bandwidth: {
    label: "Task & Bandwidth",
    color: "#FF9F1C",
    nodes: ["notion_client_hub","task_tracker","slack_client","slack_internal","bandwidth_form","bandwidth_tracker","bandwidth_report","account_health_review","client_dashboard_int","typeform_fillout","zapier","linear"],
    flows: [
      { from: "slack_client", to: "task_tracker" },
      { from: "notion_client_hub", to: "task_tracker" },
      { from: "task_tracker", to: "slack_internal" },
      { from: "task_tracker", to: "client_dashboard_int" },
      { from: "typeform_fillout", to: "bandwidth_form" },
      { from: "bandwidth_form", to: "bandwidth_tracker" },
      { from: "bandwidth_form", to: "task_tracker" },
      { from: "bandwidth_tracker", to: "bandwidth_report" },
      { from: "task_tracker", to: "bandwidth_report" },
      { from: "zapier", to: "bandwidth_report" },
      { from: "bandwidth_report", to: "slack_internal" },
      { from: "bandwidth_report", to: "client_dashboard_int" },
      { from: "bandwidth_report", to: "account_health_review" },
      { from: "task_tracker", to: "account_health_review" },
      { from: "account_health_review", to: "client_dashboard_int" },
      { from: "account_health_review", to: "slack_internal" },
      { from: "bandwidth_tracker", to: "client_dashboard_int" },
      { from: "client_dashboard_int", to: "slack_internal" },
    ]
  },
  team_onboarding: {
    label: "Team Onboarding & PD",
    color: "#A78BFA",
    nodes: ["team_profiles","fathom","pd_system","training_materials","bandwidth_tracker","bandwidth_form","slack_internal","account_comms_protocol","typeform_fillout","zapier"],
    flows: [
      { from: "typeform_fillout", to: "bandwidth_form" },
      { from: "fathom", to: "pd_system" },
      { from: "fathom", to: "slack_internal" },
      { from: "pd_system", to: "team_profiles" },
      { from: "pd_system", to: "training_materials" },
      { from: "pd_system", to: "account_comms_protocol" },
      { from: "team_profiles", to: "pd_system" },
      { from: "team_profiles", to: "bandwidth_tracker" },
      { from: "bandwidth_form", to: "bandwidth_tracker" },
      { from: "account_comms_protocol", to: "training_materials" },
    ]
  },
  vendor_onboarding: {
    label: "Vendor / Freelancer",
    color: "#34D399",
    nodes: ["typeform_fillout","fillout_vendor","vendor_profiles","docusign","quickbooks","notion_client_hub","task_tracker","slack_internal"],
    flows: [
      { from: "typeform_fillout", to: "fillout_vendor" },
      { from: "fillout_vendor", to: "vendor_profiles" },
      { from: "fillout_vendor", to: "docusign" },
      { from: "fillout_vendor", to: "quickbooks" },
      { from: "docusign", to: "vendor_profiles" },
      { from: "quickbooks", to: "vendor_profiles" },
      { from: "vendor_profiles", to: "notion_client_hub" },
      { from: "vendor_profiles", to: "task_tracker" },
    ]
  },
  account_health: {
    label: "Account Health",
    color: "#60A5FA",
    nodes: ["bandwidth_report","task_tracker","account_health_review","client_dashboard_int","scope_proposal","slack_internal","pitch_deck_library","docusign"],
    flows: [
      { from: "bandwidth_report", to: "account_health_review" },
      { from: "task_tracker", to: "account_health_review" },
      { from: "account_health_review", to: "client_dashboard_int" },
      { from: "account_health_review", to: "scope_proposal" },
      { from: "account_health_review", to: "slack_internal" },
      { from: "client_dashboard_int", to: "scope_proposal" },
      { from: "scope_proposal", to: "pitch_deck_library" },
      { from: "scope_proposal", to: "docusign" },
    ]
  },
  scope_expansion: {
    label: "Scope Expansion",
    color: "#E879F9",
    nodes: ["client_dashboard_int","account_health_review","scope_proposal","pitch_deck_library","custom_deck","docusign","quickbooks","notion_client_hub"],
    flows: [
      { from: "client_dashboard_int", to: "scope_proposal" },
      { from: "account_health_review", to: "scope_proposal" },
      { from: "scope_proposal", to: "pitch_deck_library" },
      { from: "pitch_deck_library", to: "custom_deck" },
      { from: "custom_deck", to: "docusign" },
      { from: "custom_deck", to: "quickbooks" },
      { from: "docusign", to: "notion_client_hub" },
      { from: "quickbooks", to: "notion_client_hub" },
    ]
  },
  pd_promotions: {
    label: "PD, Promotions & Raises",
    color: "#FB923C",
    nodes: ["fathom","pd_system","team_profiles","training_materials","bandwidth_form","bandwidth_tracker","engagement_health","account_health_review","slack_internal","docusign"],
    flows: [
      { from: "fathom", to: "pd_system" },
      { from: "pd_system", to: "team_profiles" },
      { from: "pd_system", to: "training_materials" },
      { from: "team_profiles", to: "pd_system" },
      { from: "bandwidth_form", to: "bandwidth_tracker" },
      { from: "bandwidth_tracker", to: "engagement_health" },
      { from: "engagement_health", to: "account_health_review" },
      { from: "account_health_review", to: "slack_internal" },
      { from: "pd_system", to: "slack_internal" },
      { from: "account_health_review", to: "docusign" },
    ]
  },
};

export const JOURNEY_PHASES: Record<JourneyKey, JourneyPhase[]> = {
  new_business: [
    { label: "Prospect",  nodes: ["gmail_outreach","slack_client"] },
    { label: "Qualify",   nodes: ["lead_crm"] },
    { label: "Pitch",     nodes: ["pitch_deck_library","custom_deck"] },
    { label: "Convert",   nodes: ["notion_client_hub"] },
  ],
  client_onboarding: [
    { label: "Dating",         nodes: ["pitch_deck_library","custom_deck"] },
    { label: "Signing",        nodes: ["docusign","quickbooks"] },
    { label: "Onboarding",     nodes: ["typeform_fillout","fillout_onboarding","notion_client_hub"] },
    { label: "Doing the Work", nodes: ["slack_client","google_workspace","claude_code","client_blueprint","md_files"] },
  ],
  content_delivery: [
    { label: "Brief",    nodes: ["notion_client_hub","md_files","tone_of_voice","creative_briefs"] },
    { label: "Generate", nodes: ["figma","google_workspace","content_prompts"] },
    { label: "Deliver",  nodes: ["adobe","content_calendar","client_dashboard_ext"] },
    { label: "Validate", nodes: ["content_approval","slack_client"] },
  ],
  task_bandwidth: [
    { label: "Capture", nodes: ["typeform_fillout","slack_client","notion_client_hub","bandwidth_form"] },
    { label: "Track",   nodes: ["task_tracker","bandwidth_tracker","linear"] },
    { label: "Report",  nodes: ["zapier","bandwidth_report"] },
    { label: "Review",  nodes: ["account_health_review","client_dashboard_int","slack_internal"] },
  ],
  team_onboarding: [
    { label: "Onboard", nodes: ["typeform_fillout","bandwidth_form","team_profiles"] },
    { label: "Develop", nodes: ["fathom","pd_system"] },
    { label: "Coach",   nodes: ["account_comms_protocol","training_materials"] },
    { label: "Track",   nodes: ["bandwidth_tracker","slack_internal","zapier"] },
  ],
  vendor_onboarding: [
    { label: "Apply",    nodes: ["typeform_fillout","fillout_vendor"] },
    { label: "Contract", nodes: ["docusign","quickbooks"] },
    { label: "Onboard",  nodes: ["vendor_profiles","notion_client_hub"] },
    { label: "Activate", nodes: ["task_tracker","slack_internal"] },
  ],
  account_health: [
    { label: "Monitor", nodes: ["bandwidth_report","task_tracker","client_dashboard_int"] },
    { label: "Review",  nodes: ["account_health_review"] },
    { label: "Act",     nodes: ["scope_proposal","slack_internal"] },
    { label: "Expand",  nodes: ["pitch_deck_library","docusign"] },
  ],
  scope_expansion: [
    { label: "Identify", nodes: ["client_dashboard_int","account_health_review"] },
    { label: "Propose",  nodes: ["scope_proposal","pitch_deck_library"] },
    { label: "Pitch",    nodes: ["custom_deck"] },
    { label: "Close",    nodes: ["docusign","quickbooks","notion_client_hub"] },
  ],
  pd_promotions: [
    { label: "Record",   nodes: ["fathom","bandwidth_form"] },
    { label: "Assess",   nodes: ["pd_system","team_profiles","bandwidth_tracker"] },
    { label: "Evaluate", nodes: ["engagement_health","account_health_review"] },
    { label: "Action",   nodes: ["training_materials","slack_internal","docusign"] },
  ],
};
