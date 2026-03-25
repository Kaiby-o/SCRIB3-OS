export type NodeType = "platform" | "process" | "database" | "ai" | "comms";

export type Layer = "visibility" | "structure" | "quality" | "development";

export type JourneyKey =
  | "new_business"
  | "client_onboarding"
  | "content_delivery"
  | "task_bandwidth"
  | "team_onboarding"
  | "vendor_onboarding"
  | "account_health"
  | "scope_expansion"
  | "pd_promotions";

export type StakeholderKey =
  | "creative_strategy"
  | "creative_execution"
  | "content_writer"
  | "social_media_manager"
  | "account_strategy"
  | "account_lead"
  | "pr"
  | "new_business"
  | "ops"
  | "finance"
  | "leadership";

export interface NodeTypeInfo {
  label: string;
  shape: string;
  icon: string;
  desc: string;
}

export interface LayerInfo {
  label: string;
  color: string;
}

export interface SystemNode {
  id: string;
  label: string;
  layer: Layer;
  type: NodeType;
  x: number;
  y: number;
  desc: string;
  feeds: string[];
  fedBy: string[];
  deprecated?: boolean;
  building?: boolean;
}

export interface Flow {
  from: string;
  to: string;
  dashed?: boolean;
}

export interface Journey {
  label: string;
  color: string;
  nodes: string[];
  flows: Flow[];
}

export interface JourneyPhase {
  label: string;
  nodes: string[];
}

export interface StakeholderInfo {
  label: string;
  color: string;
}

export interface StakeholderPhaseEntry {
  nodes: string[];
  role: string | null;
  considerations: string[];
}

export type StakeholderPhaseRecord = Record<StakeholderKey, StakeholderPhaseEntry>;
