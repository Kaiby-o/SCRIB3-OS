import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';

/* ------------------------------------------------------------------ */
/*  Systems Map — OS Aesthetic                                         */
/*  Simplified view of SCRIB3 tool ecosystem with right-angle lines    */
/* ------------------------------------------------------------------ */

interface MapNode {
  id: string;
  label: string;
  category: 'structure' | 'visibility' | 'quality' | 'development';
  x: number;
  y: number;
  desc: string;
  connections: string[];
}

const CATEGORIES = {
  structure: { label: 'Structure', color: '#6E93C3' },
  visibility: { label: 'Visibility', color: '#D7ABC5' },
  quality: { label: 'Quality', color: '#27AE60' },
  development: { label: 'Development', color: '#E67E22' },
};

const nodes: MapNode[] = [
  // Core Structure
  { id: 'client-hub', label: 'Client Hub', category: 'structure', x: 400, y: 100, desc: 'Central client profile. MSA/SOW, contacts, brand assets, strategy.', connections: ['md-files', 'task-tracker', 'projects-db'] },
  { id: 'projects-db', label: 'Projects DB', category: 'structure', x: 600, y: 100, desc: 'All active and historical projects. Codes, SOW refs, team assignments.', connections: ['task-tracker', 'engagement-health'] },
  { id: 'task-tracker', label: 'Task Tracker', category: 'structure', x: 200, y: 200, desc: 'Linear integration. Central task database for all deliverables.', connections: ['bandwidth'] },
  { id: 'md-files', label: 'MD Files', category: 'structure', x: 400, y: 200, desc: 'Per-client knowledge: tone, guidelines, pillars, strategy.', connections: ['content-prompts'] },
  { id: 'team-profiles', label: 'Team Profiles', category: 'structure', x: 200, y: 300, desc: '29 team members. Skills, PD notes, bandwidth, XP.', connections: ['bandwidth', 'pd-system'] },
  { id: 'vendor-profiles', label: 'Vendor Profiles', category: 'structure', x: 600, y: 300, desc: 'Vendor onboarding, invoices, ACH, tax forms.', connections: ['invoices'] },

  // Visibility
  { id: 'bandwidth', label: 'Bandwidth', category: 'visibility', x: 100, y: 400, desc: 'Weekly capacity estimates. Digest + submit form. Auto-alerts at 80%.', connections: ['engagement-health'] },
  { id: 'engagement-health', label: 'Engagement Health', category: 'visibility', x: 400, y: 400, desc: 'Per-client financial health. Margin %, health tiers, SOW simulator.', connections: ['sow-forecasts'] },
  { id: 'scope-watch', label: 'Scope Watch', category: 'visibility', x: 600, y: 400, desc: 'Out-of-scope requests. SOW clauses, approved responses.', connections: [] },
  { id: 'sow-forecasts', label: 'SOW Forecasts', category: 'visibility', x: 400, y: 500, desc: '"What if" revenue simulator. Projected margin and health.', connections: [] },
  { id: 'invoices', label: 'Invoices', category: 'visibility', x: 700, y: 500, desc: 'Vendor invoice tracking. Submit → validate → process → paid.', connections: [] },

  // Quality
  { id: 'pre-alignment', label: 'Pre-Alignment', category: 'quality', x: 100, y: 550, desc: '17-field mandatory checklist. Five-Bullet Brief. Comprehension Loop.', connections: ['approvals'] },
  { id: 'approvals', label: 'Approvals', category: 'quality', x: 250, y: 550, desc: 'Sign-off workflows. Pre-alignment, handoff, deliverable approvals.', connections: [] },
  { id: 'content-prompts', label: 'Quality Standards', category: 'quality', x: 400, y: 550, desc: 'What Good Looks Like. 10 sections with team examples.', connections: [] },

  // Development
  { id: 'pd-system', label: 'Prof Dev', category: 'development', x: 100, y: 650, desc: 'Goals, POE, Operating Principles, feedback, 1:1 notes.', connections: ['feedback'] },
  { id: 'feedback', label: 'Feedback Hub', category: 'development', x: 300, y: 650, desc: 'Peer reviews, self-assessment, instant feedback, action items.', connections: [] },
  { id: 'culture', label: 'Culture', category: 'development', x: 500, y: 650, desc: 'Operating Principles, XP leaderboard, Culture Book.', connections: [] },
  { id: 'dapps', label: 'Dapps', category: 'development', x: 650, y: 650, desc: 'Shoutouts + XP recognition between teammates.', connections: [] },
];

const SystemsMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Draw right-angle connector between two points
  const drawConnector = (from: MapNode, toId: string) => {
    const to = nodes.find((n) => n.id === toId);
    if (!to) return null;
    const x1 = from.x + 60; const y1 = from.y + 20;
    const x2 = to.x + 60; const y2 = to.y + 20;
    const midY = (y1 + y2) / 2;
    const isHighlighted = hoveredNode === from.id || hoveredNode === toId;
    return (
      <path key={`${from.id}-${toId}`}
        d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
        fill="none" stroke={isHighlighted ? '#D7ABC5' : 'rgba(0,0,0,0.1)'} strokeWidth={isHighlighted ? 2 : 1}
        style={{ transition: 'stroke 200ms, stroke-width 200ms' }} />
    );
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Systems Map</span>
        <BurgerButton />
      </header>

      <div style={{ padding: '24px', overflow: 'auto' }}>
        {/* Legend */}
        <div className="flex gap-4 flex-wrap" style={{ marginBottom: '16px' }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Map SVG */}
        <div style={{ position: 'relative', width: '100%', minHeight: '750px' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {nodes.flatMap((node) => node.connections.map((c) => drawConnector(node, c)))}
          </svg>

          {nodes.map((node) => {
            const cat = CATEGORIES[node.category];
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode === node.id;
            return (
              <div key={node.id}
                onClick={() => setSelectedNode(isSelected ? null : node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: 'absolute', left: node.x, top: node.y,
                  width: 120, padding: '10px 12px',
                  background: isSelected ? cat.color : 'var(--bg-primary)',
                  border: `1.5px solid ${isHovered || isSelected ? cat.color : 'var(--border-default)'}`,
                  borderRadius: '10.258px', cursor: 'pointer',
                  transition: 'all 150ms',
                  zIndex: isSelected ? 10 : 1,
                  boxShadow: isSelected ? `0 4px 16px ${cat.color}30` : 'none',
                }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, marginBottom: '6px' }} />
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', lineHeight: 1.2, display: 'block', color: isSelected ? '#000' : 'var(--text-primary)' }}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected node detail */}
        {selectedNode && (
          <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#EAF2D7', borderRadius: '10.258px', padding: '20px 24px', maxWidth: '500px', width: 'calc(100% - 48px)', zIndex: 30 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{selectedNode.label}</span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EAF2D7', fontSize: '16px', opacity: 0.5 }}>&times;</button>
            </div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>{CATEGORIES[selectedNode.category].label}</span>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, margin: 0, opacity: 0.7 }}>{selectedNode.desc}</p>
            {selectedNode.connections.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', opacity: 0.4 }}>Connects to: {selectedNode.connections.map((c) => nodes.find((n) => n.id === c)?.label).join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemsMapPage;
