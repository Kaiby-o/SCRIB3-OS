import type { NodeType, NodeTypeInfo, Layer, LayerInfo } from "./types.ts";

export const NODE_TYPES: Record<NodeType, NodeTypeInfo> = {
  platform:  { label: "Platform",  shape: "square",   icon: "\u2B1B", desc: "External SaaS / tool" },
  process:   { label: "Process",   shape: "diamond",  icon: "\u25C6",  desc: "Workflow / protocol / document" },
  database:  { label: "Database",  shape: "cylinder", icon: "\u2B21",  desc: "Structured data store" },
  ai:        { label: "AI Output", shape: "hexagon",  icon: "\u2B22",  desc: "AI-assisted output or agent" },
  comms:     { label: "Comms",     shape: "circle",   icon: "\u25CF",  desc: "Communication channel" },
};

export const LAYERS: Record<Layer, LayerInfo> = {
  visibility:  { label: "Visibility",  color: "#F5C842" },
  structure:   { label: "Structure",   color: "#4A90D9" },
  quality:     { label: "Quality",     color: "#E87D3E" },
  development: { label: "Development", color: "#8B5CF6" },
};
