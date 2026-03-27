import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { NODES } from '../../scrib3-device/components/systems-map/data/nodes';
import { FLOWS } from '../../scrib3-device/components/systems-map/data/flows';
import { LAYERS } from '../../scrib3-device/components/systems-map/data/layers';
import { JOURNEYS } from '../../scrib3-device/components/systems-map/data/journeys';
import type { SystemNode, Layer, JourneyKey } from '../../scrib3-device/components/systems-map/data/types';

/* ------------------------------------------------------------------ */
/*  Systems Map — OS Aesthetic                                         */
/*  Full port from DEVICE layer with right-angle connectors            */
/* ------------------------------------------------------------------ */

// OS colour mapping for layers (replaces DEVICE CRT colours)
const OS_LAYER_COLORS: Record<Layer, string> = {
  visibility: '#D7ABC5',
  structure: '#6E93C3',
  quality: '#27AE60',
  development: '#E67E22',
};

const SystemsMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<Layer | 'all'>('all');
  const [activeJourney, setActiveJourney] = useState<JourneyKey | null>(null);
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  // Filter nodes by active layer
  const visibleNodes = useMemo(() => {
    if (activeLayer === 'all') return NODES.filter((n) => !n.deprecated);
    return NODES.filter((n) => n.layer === activeLayer && !n.deprecated);
  }, [activeLayer]);

  const visibleIds = new Set(visibleNodes.map((n) => n.id));

  // Journey highlight
  const journeyNodeIds = useMemo(() => {
    if (!activeJourney || !JOURNEYS[activeJourney]) return new Set<string>();
    return new Set(JOURNEYS[activeJourney].nodes);
  }, [activeJourney]);

  const journeyFlows = useMemo(() => {
    if (!activeJourney || !JOURNEYS[activeJourney]) return [];
    return JOURNEYS[activeJourney].flows;
  }, [activeJourney]);

  // Filter flows
  const visibleFlows = useMemo(() => {
    if (activeJourney) return journeyFlows;
    return FLOWS.filter((f) => visibleIds.has(f.from) && visibleIds.has(f.to));
  }, [activeJourney, journeyFlows, visibleIds]);

  // Connected nodes for hover highlight
  const connectedIds = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const ids = new Set<string>([hoveredNode]);
    FLOWS.forEach((f) => {
      if (f.from === hoveredNode) ids.add(f.to);
      if (f.to === hoveredNode) ids.add(f.from);
    });
    return ids;
  }, [hoveredNode]);

  // Pan handlers
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  }, [pan]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handlePanEnd = useCallback(() => setIsPanning(false), []);

  // Draw right-angle connector
  const drawConnector = (fromNode: SystemNode, toNode: SystemNode, color: string, dashed?: boolean) => {
    const x1 = fromNode.x + 60; const y1 = fromNode.y + 25;
    const x2 = toNode.x + 60; const y2 = toNode.y + 25;
    const midX = (x1 + x2) / 2;
    return (
      <path key={`${fromNode.id}-${toNode.id}`}
        d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth={1.5}
        strokeDasharray={dashed ? '4 4' : 'none'}
        opacity={0.6}
        style={{ transition: 'stroke 200ms, opacity 200ms' }} />
    );
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/tools')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Systems Map</span>
        <BurgerButton />
      </header>

      {/* Controls bar */}
      <div style={{ position: 'fixed', top: 86, left: 0, right: 0, zIndex: 35, background: 'var(--bg-primary)', padding: '8px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.1)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Layer filters */}
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>Layers:</span>
        <FilterPill label="All" active={activeLayer === 'all'} onClick={() => setActiveLayer('all')} color="#000" />
        {(Object.entries(LAYERS) as [Layer, { label: string; color: string }][]).map(([key, info]) => (
          <FilterPill key={key} label={info.label} active={activeLayer === key} onClick={() => setActiveLayer(key === activeLayer ? 'all' : key)} color={OS_LAYER_COLORS[key]} />
        ))}

        <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />

        {/* Journey overlays */}
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>Journeys:</span>
        {(Object.entries(JOURNEYS) as [JourneyKey, { label: string; color: string }][]).slice(0, 5).map(([key, journey]) => (
          <FilterPill key={key} label={journey.label} active={activeJourney === key} onClick={() => setActiveJourney(activeJourney === key ? null : key)} color={journey.color} />
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', width: 28, height: 28, cursor: 'pointer', fontFamily: "'Owners Wide', sans-serif", fontSize: '14px' }}>-</button>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, minWidth: '30px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', width: 28, height: 28, cursor: 'pointer', fontFamily: "'Owners Wide', sans-serif", fontSize: '14px' }}>+</button>
          <button onClick={() => { setZoom(0.75); setPan({ x: 0, y: 0 }); }} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.3, background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>

      {/* Map canvas */}
      <div
        style={{ flex: 1, overflow: 'hidden', marginTop: '130px', cursor: isPanning ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', position: 'relative', width: '1600px', height: '1000px' }}>
          {/* Connectors */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {visibleFlows.map((flow) => {
              const from = NODES.find((n) => n.id === flow.from);
              const to = NODES.find((n) => n.id === flow.to);
              if (!from || !to) return null;
              const isHighlighted = connectedIds.has(flow.from) && connectedIds.has(flow.to);
              const journeyColor = activeJourney ? JOURNEYS[activeJourney]?.color ?? '#D7ABC5' : OS_LAYER_COLORS[from.layer];
              return drawConnector(from, to, isHighlighted ? '#D7ABC5' : journeyColor, flow.dashed);
            })}
          </svg>

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const color = OS_LAYER_COLORS[node.layer];
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode === node.id;
            const isInJourney = activeJourney ? journeyNodeIds.has(node.id) : true;
            const dimmed = activeJourney && !isInJourney;

            return (
              <div key={node.id}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(isSelected ? null : node); }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: 'absolute', left: node.x, top: node.y,
                  width: 120, padding: '8px 10px',
                  background: isSelected ? color : 'var(--bg-primary)',
                  border: `1.5px solid ${isHovered || isSelected ? color : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 150ms',
                  opacity: dimmed ? 0.2 : (node.building ? 0.6 : 1),
                  zIndex: isSelected ? 10 : 1,
                }}>
                <div className="flex items-center gap-1" style={{ marginBottom: '4px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  {node.building && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '7px', opacity: 0.5, textTransform: 'uppercase' }}>Building</span>}
                </div>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', lineHeight: 1.2, display: 'block', color: isSelected ? '#000' : 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#EAF2D7', borderRadius: '10.258px', padding: '20px 24px', maxWidth: '600px', width: 'calc(100% - 48px)', zIndex: 30 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: OS_LAYER_COLORS[selectedNode.layer] }} />
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{selectedNode.label.replace('\n', ' ')}</span>
            </div>
            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EAF2D7', fontSize: '16px', opacity: 0.5 }}>&times;</button>
          </div>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>
            {LAYERS[selectedNode.layer].label} · {selectedNode.type}
          </span>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.6, margin: '0 0 12px 0', opacity: 0.7 }}>{selectedNode.desc}</p>
          <div className="flex gap-4">
            {selectedNode.feeds.length > 0 && (
              <div>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>Feeds →</span>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', display: 'block', marginTop: '2px', opacity: 0.5 }}>
                  {selectedNode.feeds.map((id) => NODES.find((n) => n.id === id)?.label.replace('\n', ' ')).filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {selectedNode.fedBy.length > 0 && (
              <div>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>← Fed by</span>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', display: 'block', marginTop: '2px', opacity: 0.5 }}>
                  {selectedNode.fedBy.map((id) => NODES.find((n) => n.id === id)?.label.replace('\n', ' ')).filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterPill: React.FC<{ label: string; active: boolean; onClick: () => void; color: string }> = ({ label, active, onClick, color }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '0.5px', textTransform: 'uppercase',
    padding: '3px 10px', borderRadius: '75.641px', cursor: 'pointer',
    border: active ? `1.5px solid ${color}` : '1px solid rgba(0,0,0,0.1)',
    background: active ? `${color}20` : 'transparent',
    color: active ? color : 'var(--text-primary)',
    opacity: active ? 1 : 0.5,
  }}>{label}</button>
);

export default SystemsMapPage;
