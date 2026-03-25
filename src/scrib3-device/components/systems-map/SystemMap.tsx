import { useState, useRef, useCallback, useEffect } from "react";
import type { JourneyKey, StakeholderKey, Layer, NodeType, SystemNode, Flow, JourneyPhase } from "./data/types.ts";
import { NODE_TYPES, LAYERS, NODES, FLOWS, JOURNEYS, JOURNEY_PHASES, STAKEHOLDERS, STAKEHOLDER_DATA } from "./data/index.ts";
import NodeTypeIcon from "./NodeTypeIcon.tsx";

export default function SystemMap() {
  const [activeLayer, setActiveLayer] = useState<Layer | null>(null);
  const [activeJourney, setActiveJourney] = useState<JourneyKey | null>(null);
  const [activeType, setActiveType] = useState<NodeType | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.5);
  const [seqMode, setSeqMode] = useState(false);
  const [activeStakeholder, setActiveStakeholder] = useState<StakeholderKey | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const journeyNodeIds = activeJourney ? new Set(JOURNEYS[activeJourney].nodes) : null;
  const journeyFlowPairs = activeJourney
    ? new Set(JOURNEYS[activeJourney].flows.map(f => `${f.from}\u2192${f.to}`))
    : null;

  const visibleNodes = activeLayer ? NODES.filter(n => n.layer === activeLayer) : NODES;
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleFlows = FLOWS.filter(f => visibleIds.has(f.from) && visibleIds.has(f.to));
  const getNode = (id: string): SystemNode | undefined => NODES.find(n => n.id === id);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === "svg") {
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);
  const handleMouseUp = useCallback(() => setDragging(false), []);
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);
  useEffect(() => {
    const el = svgRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", handleWheel); };
  }, [handleWheel]);

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null;

  interface SeqLayoutResult {
    journey: typeof JOURNEYS[JourneyKey];
    phases: JourneyPhase[];
    color: string;
    phaseW: number;
    nodeW: number;
    nodeH: number;
    headerH: number;
    padX: number;
    nodePos: Record<string, { x: number; y: number }>;
    svgW: number;
    svgH: number;
    seqFlows: Flow[];
    stakeholderPhaseData: typeof STAKEHOLDER_DATA[JourneyKey] | null;
    ownedNodeIds: Set<string> | null;
  }

  const seqLayout: SeqLayoutResult | null = (seqMode && activeJourney && JOURNEY_PHASES[activeJourney]) ? (() => {
    const journey = JOURNEYS[activeJourney];
    const phases = JOURNEY_PHASES[activeJourney];
    const color = (activeStakeholder && STAKEHOLDERS[activeStakeholder])
      ? STAKEHOLDERS[activeStakeholder].color
      : journey.color;
    const phaseW = 220, nodeW = 120, nodeH = 48, nodeGapY = 72;
    const headerH = 60, padX = 32, padY = 20;
    const nodePos: Record<string, { x: number; y: number }> = {};
    phases.forEach((phase, pi) => {
      const baseX = padX + pi * phaseW + (phaseW - nodeW) / 2;
      phase.nodes.forEach((_nid, ni) => {
        nodePos[_nid] = { x: baseX, y: headerH + padY + ni * nodeGapY };
      });
    });
    const maxNodes = Math.max(...phases.map(p => p.nodes.length));
    const svgW = phases.length * phaseW + 2 * padX;
    const svgH = headerH + padY + maxNodes * nodeGapY + padY;
    const seqFlows = journey.flows.filter(f => nodePos[f.from] && nodePos[f.to]);
    const stakeholderPhaseData = (activeStakeholder && STAKEHOLDER_DATA[activeJourney]) ? STAKEHOLDER_DATA[activeJourney] : null;
    const ownedNodeIds = stakeholderPhaseData
      ? new Set(stakeholderPhaseData.flatMap(p => (activeStakeholder && p[activeStakeholder]?.nodes) || []))
      : null;
    return { journey, phases, color, phaseW, nodeW, nodeH, headerH, padX, nodePos, svgW, svgH, seqFlows, stakeholderPhaseData, ownedNodeIds };
  })() : null;

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#0D0D0D", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#E8E8E8" }}>

      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#555" }}>SCRIB3</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", color: "#fff" }}>SYSTEMS MAP</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "#444", marginRight: 2 }}>LAYER:</span>
          <button onClick={() => { setActiveLayer(null); setActiveJourney(null); setActiveType(null); }} style={{ padding: "4px 10px", borderRadius: 3, border: "1px solid", borderColor: !activeLayer && !activeJourney && !activeType ? "#fff" : "#2a2a2a", background: !activeLayer && !activeJourney && !activeType ? "#fff" : "transparent", color: !activeLayer && !activeJourney && !activeType ? "#000" : "#666", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em" }}>ALL</button>
          {(Object.entries(LAYERS) as [Layer, typeof LAYERS[Layer]][]).map(([key, val]) => (
            <button key={key} onClick={() => { setActiveLayer(activeLayer === key ? null : key); setActiveJourney(null); setActiveType(null); }} style={{ padding: "4px 10px", borderRadius: 3, border: "1px solid", borderColor: activeLayer === key ? val.color : "#2a2a2a", background: activeLayer === key ? val.color : "transparent", color: activeLayer === key ? "#000" : val.color, fontSize: 10, cursor: "pointer", letterSpacing: "0.08em", fontWeight: 600 }}>{val.label.toUpperCase()}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "#222", margin: "0 4px" }}/>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={{ width: 26, height: 26, borderRadius: 3, border: "1px solid #2a2a2a", background: "#1a1a1a", color: "#888", fontSize: 15, cursor: "pointer" }}>+</button>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} style={{ width: 26, height: 26, borderRadius: 3, border: "1px solid #2a2a2a", background: "#1a1a1a", color: "#888", fontSize: 15, cursor: "pointer" }}>{"\u2212"}</button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(0.5); }} style={{ padding: "0 8px", height: 26, borderRadius: 3, border: "1px solid #2a2a2a", background: "#1a1a1a", color: "#666", fontSize: 9, cursor: "pointer", letterSpacing: "0.1em" }}>RESET</button>
        </div>
      </div>

      {/* Journey filter row */}
      <div style={{ padding: "6px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", gap: 6, alignItems: "center", background: "#0e0e0e", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#444", marginRight: 2, letterSpacing: "0.1em" }}>JOURNEY:</span>
        {(Object.entries(JOURNEYS) as [JourneyKey, typeof JOURNEYS[JourneyKey]][]).map(([key, val]) => {
          const isActive = activeJourney === key;
          return (
            <button key={key} onClick={() => { setActiveJourney(isActive ? null : key); setActiveLayer(null); setActiveType(null); setSeqMode(false); setActiveStakeholder(null); }} style={{ padding: "3px 10px", borderRadius: 3, border: "1px solid", borderColor: isActive ? val.color : "#222", background: isActive ? val.color + "20" : "transparent", color: isActive ? val.color : "#484848", fontSize: 10, cursor: "pointer", letterSpacing: "0.06em", fontWeight: isActive ? 700 : 400, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? val.color : "#333", display: "inline-block", flexShrink: 0 }}/>
              {val.label.toUpperCase()}
            </button>
          );
        })}
        {activeJourney && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.08em" }}>{JOURNEYS[activeJourney].nodes.length} NODES</span>
            <button onClick={() => { setSeqMode(m => !m); setActiveStakeholder(null); }} style={{ padding: "3px 12px", borderRadius: 3, border: "1px solid", borderColor: seqMode ? JOURNEYS[activeJourney].color : "#2a2a2a", background: seqMode ? JOURNEYS[activeJourney].color + "20" : "transparent", color: seqMode ? JOURNEYS[activeJourney].color : "#555", fontSize: 9, cursor: "pointer", letterSpacing: "0.12em", fontWeight: seqMode ? 700 : 400 }}>
              {seqMode ? "\u25C0 MAP" : "SEQUENCE \u25B6"}
            </button>
          </div>
        )}
      </div>

      {/* Stakeholder selector -- only in sequence view */}
      {seqMode && activeJourney && (
        <div style={{ padding: "6px 20px", borderBottom: "1px solid #111", display: "flex", gap: 5, alignItems: "center", background: "#060606", flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: "#333", marginRight: 4, letterSpacing: "0.12em", flexShrink: 0 }}>STAKEHOLDER:</span>
          {(Object.entries(STAKEHOLDERS) as [StakeholderKey, typeof STAKEHOLDERS[StakeholderKey]][]).filter(([key]) => {
            const journeyData = STAKEHOLDER_DATA[activeJourney];
            return journeyData && journeyData.some(phase => (phase[key]?.nodes?.length ?? 0) > 0);
          }).map(([key, val]) => {
            const isActive = activeStakeholder === key;
            return (
              <button key={key} onClick={() => setActiveStakeholder(isActive ? null : key)}
                style={{ padding: "3px 9px", borderRadius: 3, border: "1px solid", borderColor: isActive ? val.color : "#1e1e1e", background: isActive ? val.color + "20" : "transparent", color: isActive ? val.color : "#383838", fontSize: 9, cursor: "pointer", letterSpacing: "0.05em", fontWeight: isActive ? 700 : 400, transition: "all 0.12s" }}>
                {val.label.toUpperCase()}
              </button>
            );
          })}
          {activeStakeholder && <span style={{ fontSize: 8, color: "#2a2a2a", marginLeft: 4, letterSpacing: "0.08em" }}>Click again to clear</span>}
        </div>
      )}

      {/* Legend row */}
      <div style={{ padding: "5px 20px", borderBottom: "1px solid #111", display: "flex", gap: 16, alignItems: "center", background: "#080808", flexWrap: "wrap" }}>
        {(Object.entries(LAYERS) as [Layer, typeof LAYERS[Layer]][]).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 1, background: val.color }}/>
            <span style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em" }}>{val.label.toUpperCase()}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 12, background: "#1a1a1a" }}/>
        {(Object.entries(NODE_TYPES) as [NodeType, typeof NODE_TYPES[NodeType]][]).map(([key, val]) => {
          const isActive = activeType === key;
          const count = NODES.filter(n => n.type === key).length;
          return (
            <button key={key} onClick={() => { setActiveType(isActive ? null : key); setActiveLayer(null); setActiveJourney(null); }}
              style={{ display: "flex", alignItems: "center", gap: 4, background: isActive ? "#1e1e1e" : "none", border: isActive ? "1px solid #444" : "1px solid transparent", borderRadius: 3, cursor: "pointer", padding: "2px 6px", transition: "all 0.15s" }}>
              <svg width="14" height="14" viewBox="-7 -7 14 14">
                <NodeTypeIcon type={key} x={0} y={0} color={isActive ? "#fff" : "#555"}/>
              </svg>
              <span style={{ fontSize: 9, color: isActive ? "#ccc" : "#3a3a3a", letterSpacing: "0.08em" }}>{val.label.toUpperCase()}</span>
              {isActive && <span style={{ fontSize: 8, color: "#555", marginLeft: 1 }}>{count}</span>}
            </button>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 8 }}>
          <svg width="20" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#444" strokeWidth="1" strokeDasharray="3,2"/></svg>
          <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.08em" }}>FUTURE</span>
        </div>
        <span style={{ fontSize: 9, color: "#2a2a2a", marginLeft: "auto" }}>Scroll zoom · Drag pan · Click node · Click icon to filter type</span>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {seqLayout ? (
          <div style={{ flex: 1, overflow: "auto", background: "#0a0a0a" }}>
            <svg width={seqLayout.svgW} height={seqLayout.svgH} style={{ display: "block" }}>
              <defs>
                <marker id="seq-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={seqLayout.color}/>
                </marker>
                <marker id="seq-arrow-dim" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill="#252525"/>
                </marker>
              </defs>
              {seqLayout.phases.map((phase, pi) => (
                <g key={pi}>
                  <rect x={seqLayout.padX + pi * seqLayout.phaseW} y={0} width={seqLayout.phaseW} height={seqLayout.svgH} fill={seqLayout.color} fillOpacity={pi % 2 === 0 ? 0.05 : 0.02} stroke="none"/>
                  {pi > 0 && <line x1={seqLayout.padX + pi * seqLayout.phaseW} y1={0} x2={seqLayout.padX + pi * seqLayout.phaseW} y2={seqLayout.svgH} stroke={seqLayout.color} strokeOpacity={0.1} strokeWidth={1}/>}
                  <text x={seqLayout.padX + pi * seqLayout.phaseW + seqLayout.phaseW / 2} y={28} textAnchor="middle" fontSize={10} fill={seqLayout.color} fillOpacity={0.85} fontFamily="'DM Mono','Courier New',monospace" letterSpacing="0.15em" fontWeight={700}>{phase.label.toUpperCase()}</text>
                  <text x={seqLayout.padX + pi * seqLayout.phaseW + seqLayout.phaseW / 2} y={44} textAnchor="middle" fontSize={7} fill={seqLayout.color} fillOpacity={0.3} fontFamily="'DM Mono','Courier New',monospace" letterSpacing="0.06em">{`PHASE ${pi + 1} OF ${seqLayout.phases.length}`}</text>
                </g>
              ))}
              <line x1={seqLayout.padX} y1={seqLayout.headerH} x2={seqLayout.svgW - seqLayout.padX} y2={seqLayout.headerH} stroke={seqLayout.color} strokeOpacity={0.15} strokeWidth={1}/>
              {seqLayout.seqFlows.map((flow, i) => {
                const from = seqLayout.nodePos[flow.from];
                const to = seqLayout.nodePos[flow.to];
                if (!from || !to) return null;
                const fromPi = seqLayout.phases.findIndex(p => p.nodes.includes(flow.from));
                const toPi = seqLayout.phases.findIndex(p => p.nodes.includes(flow.to));
                const fromOwned = !seqLayout.ownedNodeIds || seqLayout.ownedNodeIds.has(flow.from);
                const toOwned = !seqLayout.ownedNodeIds || seqLayout.ownedNodeIds.has(flow.to);
                const bothOwned = fromOwned && toOwned;
                let d: string;
                let dashed = false;
                if (fromPi < toPi) {
                  const x1 = from.x + seqLayout.nodeW, y1 = from.y + seqLayout.nodeH / 2;
                  const x2 = to.x, y2 = to.y + seqLayout.nodeH / 2;
                  const mx = (x1 + x2) / 2;
                  d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
                } else if (fromPi === toPi) {
                  const x1 = from.x + seqLayout.nodeW * 0.8, y1 = from.y + seqLayout.nodeH;
                  const x2 = to.x + seqLayout.nodeW * 0.8, y2 = to.y;
                  const offset = 28;
                  d = `M${x1},${y1} C${x1 + offset},${(y1 + y2) / 2} ${x2 + offset},${(y1 + y2) / 2} ${x2},${y2}`;
                } else {
                  const x1 = from.x + seqLayout.nodeW / 2, y1 = from.y;
                  const x2 = to.x + seqLayout.nodeW / 2, y2 = to.y;
                  d = `M${x1},${y1} C${x1},${seqLayout.headerH - 8} ${x2},${seqLayout.headerH - 8} ${x2},${y2}`;
                  dashed = true;
                }
                return <path key={i} d={d} fill="none" stroke={bothOwned ? seqLayout.color : "#222"} strokeWidth={bothOwned ? 1.5 : 1} strokeOpacity={bothOwned ? 0.5 : 0.2} strokeDasharray={dashed ? "4,3" : undefined} markerEnd={bothOwned ? "url(#seq-arrow)" : "url(#seq-arrow-dim)"}/>;
              })}
              {Object.entries(seqLayout.nodePos).map(([nid, pos]) => {
                const node = NODES.find(n => n.id === nid);
                if (!node) return null;
                const layer = LAYERS[node.layer];
                const lines = node.label.split("\n");
                const isSelected = selected === nid;
                const isOwned = !seqLayout.ownedNodeIds || seqLayout.ownedNodeIds.has(nid);
                const c = isOwned ? seqLayout.color : "#333";
                const textFill = isSelected ? "#000" : isOwned ? "#fff" : "#3a3a3a";
                const nodeOpacity = isOwned ? 1 : 0.3;
                return (
                  <g key={nid} transform={`translate(${pos.x}, ${pos.y})`} style={{ cursor: "pointer", opacity: nodeOpacity }} onClick={(e) => { e.stopPropagation(); setSelected(selected === nid ? null : nid); }}>
                    <rect x={-2} y={-2} width={seqLayout.nodeW + 4} height={seqLayout.nodeH + 4} rx={7} fill="none" stroke={c} strokeWidth={1} opacity={isSelected ? 0.8 : 0.3}/>
                    <rect x={0} y={0} width={seqLayout.nodeW} height={seqLayout.nodeH} rx={5} fill={isSelected ? c : c + "18"} stroke={isSelected ? c : c + "55"} strokeWidth={isSelected ? 1.5 : 1}/>
                    {!isSelected && <rect x={0} y={0} width={3} height={seqLayout.nodeH} rx={2} fill={isOwned ? layer.color : "#2a2a2a"} opacity={0.8}/>}
                    <svg x={103} y={5} width={14} height={14} viewBox="-7 -7 14 14">
                      <NodeTypeIcon type={node.type} x={0} y={0} color={isSelected ? "#00000088" : c + "99"}/>
                    </svg>
                    {node.building && <text x={60} y={9} fontSize={6} fill={layer.color + "77"} textAnchor="middle" fontFamily="monospace" letterSpacing="0.1em">BUILDING</text>}
                    {node.deprecated && <text x={60} y={9} fontSize={6} fill="#3a3a3a" textAnchor="middle" fontFamily="monospace" letterSpacing="0.1em">DEPRECATED</text>}
                    {lines.map((line, li) => (
                      <text key={li} x={58} y={(node.building || node.deprecated) ? (lines.length === 1 ? 32 : 23 + li * 13) : (lines.length === 1 ? 28 : 19 + li * 13)} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={textFill} fontFamily="'DM Mono','Courier New',monospace" letterSpacing="0.03em">{line}</text>
                    ))}
                  </g>
                );
              })}
            </svg>
            {/* Per-phase stakeholder consideration cards */}
            {seqLayout.stakeholderPhaseData && activeStakeholder && (
              <div style={{ display: "flex", width: seqLayout.svgW, minWidth: seqLayout.svgW, borderTop: `1px solid ${seqLayout.color}22` }}>
                {seqLayout.phases.map((_, pi) => {
                  const phData = seqLayout.stakeholderPhaseData?.[pi]?.[activeStakeholder];
                  const hasContent = phData?.role || (phData?.considerations?.length ?? 0) > 0;
                  return (
                    <div key={pi} style={{ width: seqLayout.phaseW, flexShrink: 0, padding: "14px 16px", background: pi % 2 === 0 ? seqLayout.color + "06" : "transparent", borderRight: pi < seqLayout.phases.length - 1 ? `1px solid ${seqLayout.color}12` : "none" }}>
                      {hasContent ? (
                        <>
                          {phData?.role && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 7, color: seqLayout.color, letterSpacing: "0.15em", marginBottom: 4, opacity: 0.7 }}>YOUR ROLE</div>
                              <div style={{ fontSize: 10, color: "#ccc", fontWeight: 700, lineHeight: 1.4 }}>{phData.role}</div>
                            </div>
                          )}
                          {(phData?.considerations?.length ?? 0) > 0 && (
                            <div>
                              <div style={{ fontSize: 7, color: "#333", letterSpacing: "0.15em", marginBottom: 6 }}>KEY CONSIDERATIONS</div>
                              {phData?.considerations.map((item, ci) => (
                                <div key={ci} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "flex-start" }}>
                                  <span style={{ color: seqLayout.color, opacity: 0.45, fontSize: 8, flexShrink: 0, marginTop: 2 }}>{"\u2014"}</span>
                                  <span style={{ fontSize: 9, color: "#5a5a5a", lineHeight: 1.55 }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: 8, color: "#1e1e1e", fontStyle: "italic", letterSpacing: "0.06em", paddingTop: 4 }}>No active role in this phase</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <svg ref={svgRef} width="100%" height="100%" style={{ cursor: dragging ? "grabbing" : "grab", display: "block" }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <defs>
              <marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="#2e2e2e"/>
              </marker>
              {(Object.entries(LAYERS) as [Layer, typeof LAYERS[Layer]][]).map(([key, val]) => (
                <marker key={key} id={`arrow-${key}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={val.color + "aa"}/>
                </marker>
              ))}
              {(Object.entries(JOURNEYS) as [JourneyKey, typeof JOURNEYS[JourneyKey]][]).map(([key, val]) => (
                <marker key={key} id={`arrow-j-${key}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={val.color}/>
                </marker>
              ))}
            </defs>

            <g transform={`translate(${pan.x + 40}, ${pan.y + 40}) scale(${zoom})`}>
              {/* Flows */}
              {visibleFlows.map((flow, i) => {
                const from = getNode(flow.from);
                const to = getNode(flow.to);
                if (!from || !to) return null;
                const isNodeSelected = selected && (selected === flow.from || selected === flow.to);
                const fromLayer = from.layer;
                const layerColor = LAYERS[fromLayer]?.color || "#333";
                const isJourneyFlow = journeyFlowPairs && journeyFlowPairs.has(`${flow.from}\u2192${flow.to}`);
                const journeyColor = activeJourney ? JOURNEYS[activeJourney].color : null;
                const x1 = from.x + 60, y1 = from.y + 24;
                const x2 = to.x + 60, y2 = to.y + 24;
                const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                let stroke = "#1e1e1e", sw = 1, opacity = 0.7, marker = "arrow";
                if (activeJourney) {
                  if (isJourneyFlow) { stroke = journeyColor!; sw = 2.5; opacity = 1; marker = `arrow-j-${activeJourney}`; }
                  else { stroke = "#161616"; opacity = 0.25; }
                } else if (isNodeSelected) { stroke = layerColor; sw = 2; opacity = 0.9; marker = `arrow-${fromLayer}`; }
                return (
                  <path key={i} d={`M${x1},${y1} Q${mx},${y1} ${mx},${my} Q${mx},${y2} ${x2},${y2}`}
                    fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray={flow.dashed ? "5,4" : undefined}
                    strokeOpacity={opacity} markerEnd={`url(#${marker})`}/>
                );
              })}

              {/* Nodes */}
              {visibleNodes.map(node => {
                const layer = LAYERS[node.layer];
                const isSelected = selected === node.id;
                const isConnected = selected && FLOWS.some(f => (f.from === selected && f.to === node.id) || (f.to === selected && f.from === node.id));
                const isInJourney = journeyNodeIds && journeyNodeIds.has(node.id);
                const isMatchingType = activeType ? node.type === activeType : true;
                const journeyColor = activeJourney ? JOURNEYS[activeJourney].color : null;
                const typeHighlightColor = "#ffffff";
                const isDimmed = (selected && !isSelected && !isConnected) || (activeJourney && !isInJourney) || (activeType && !isMatchingType);
                const lines = node.label.split("\n");
                const borderColor = node.deprecated ? "#333" : isSelected ? layer.color : (activeType && isMatchingType) ? typeHighlightColor : isInJourney && activeJourney ? journeyColor! : isConnected ? layer.color : node.building ? layer.color + "55" : "#252525";
                const fillColor = isSelected ? layer.color : (activeType && isMatchingType) ? "#252525" : isInJourney && activeJourney ? journeyColor + "18" : "#181818";
                const typeColor = isSelected ? "#00000088" : isDimmed ? "#252525" : (activeType && isMatchingType) ? typeHighlightColor : isInJourney && activeJourney ? journeyColor + "cc" : layer.color + "99";
                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`} style={{ cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); setSelected(selected === node.id ? null : node.id); }}>
                    {/* Glow for journey */}
                    {isInJourney && activeJourney && !isDimmed && (
                      <rect x={-2} y={-2} width={124} height={52} rx={7} fill="none" stroke={journeyColor!} strokeWidth={1} opacity={0.3}/>
                    )}
                    {/* Glow for type filter */}
                    {activeType && isMatchingType && !isDimmed && (
                      <rect x={-2} y={-2} width={124} height={52} rx={7} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.15}/>
                    )}
                    <rect x={0} y={0} width={120} height={48} rx={5} fill={fillColor}
                      stroke={borderColor} strokeWidth={isSelected || (isInJourney && activeJourney) ? 1.5 : 1}
                      strokeDasharray={node.deprecated ? "4,3" : node.building ? "4,3" : undefined}
                      opacity={isDimmed ? 0.15 : 1}/>
                    {/* Left accent bar */}
                    {!isSelected && <rect x={0} y={0} width={3} height={48} rx={2} fill={isInJourney && activeJourney ? journeyColor! : layer.color} opacity={isDimmed ? 0.08 : isInJourney && activeJourney ? 0.9 : 0.6}/>}
                    {/* Type icon -- top right */}
                    <svg x={103} y={5} width={14} height={14} viewBox="-7 -7 14 14" opacity={isDimmed ? 0.15 : 1}>
                      <NodeTypeIcon type={node.type} x={0} y={0} color={typeColor}/>
                    </svg>
                    {/* Status badge */}
                    {node.deprecated && <text x={60} y={9} fontSize={6} fill="#3a3a3a" textAnchor="middle" fontFamily="monospace" letterSpacing="0.1em">DEPRECATED</text>}
                    {node.building && <text x={60} y={9} fontSize={6} fill={layer.color + "77"} textAnchor="middle" fontFamily="monospace" letterSpacing="0.1em">BUILDING</text>}
                    {/* Label */}
                    {lines.map((line, li) => (
                      <text key={li} x={58} y={node.deprecated || node.building ? (lines.length === 1 ? 32 : 23 + li * 13) : (lines.length === 1 ? 28 : 19 + li * 13)}
                        textAnchor="middle" fontSize={9.5} fontWeight={isSelected || (isInJourney && activeJourney) ? 700 : 400}
                        fill={isSelected ? "#000" : isDimmed ? "#252525" : isInJourney && activeJourney ? "#fff" : "#bbb"}
                        fontFamily="'DM Mono','Courier New',monospace" letterSpacing="0.03em">{line}</text>
                    ))}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        )}

        {/* Detail panel */}
        <div style={{ width: selectedNode ? 300 : 0, transition: "width 0.2s ease", overflow: "hidden", borderLeft: "1px solid #1a1a1a", background: "#0e0e0e", flexShrink: 0 }}>
          {selectedNode && (
            <div style={{ width: 300, padding: 20, overflowY: "auto", maxHeight: "100%" }}>
              {/* Layer + type */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: "0.15em", color: LAYERS[selectedNode.layer]?.color }}>{LAYERS[selectedNode.layer]?.label.toUpperCase()}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="14" height="14" viewBox="-7 -7 14 14">
                    <NodeTypeIcon type={selectedNode.type} x={0} y={0} color={LAYERS[selectedNode.layer]?.color}/>
                  </svg>
                  <span style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em" }}>{NODE_TYPES[selectedNode.type]?.label.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}>{selectedNode.label.replace("\n", " ")}</div>

              {/* Journey tags */}
              {(() => {
                const memberOf = (Object.entries(JOURNEYS) as [JourneyKey, typeof JOURNEYS[JourneyKey]][]).filter(([, j]) => j.nodes.includes(selectedNode.id));
                return memberOf.length > 0 ? (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                    {memberOf.map(([key, j]) => (
                      <span key={key} onClick={() => { setActiveJourney(activeJourney === key ? null : key); setActiveLayer(null); }} style={{ padding: "2px 7px", borderRadius: 2, background: j.color + "12", border: `1px solid ${j.color}44`, fontSize: 8, color: j.color, cursor: "pointer", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: j.color, display: "inline-block" }}/>
                        {j.label.toUpperCase()}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Status */}
              {(selectedNode.deprecated || selectedNode.building) && (
                <div style={{ padding: "5px 8px", borderRadius: 3, marginBottom: 12, background: "#111", border: `1px solid ${selectedNode.deprecated ? "#2a2a2a" : LAYERS[selectedNode.layer]?.color + "33"}`, fontSize: 9, color: selectedNode.deprecated ? "#444" : LAYERS[selectedNode.layer]?.color, letterSpacing: "0.1em" }}>
                  {selectedNode.deprecated ? "\u26A0 DEPRECATED" : "\u26A1 BUILDING"}
                </div>
              )}

              <p style={{ fontSize: 11, color: "#777", lineHeight: 1.7, marginBottom: 18 }}>{selectedNode.desc}</p>

              {FLOWS.filter(f => f.to === selectedNode.id && visibleIds.has(f.from)).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.12em", marginBottom: 6 }}>RECEIVES FROM</div>
                  {FLOWS.filter(f => f.to === selectedNode.id && visibleIds.has(f.from)).map(f => {
                    const n = getNode(f.from);
                    return n ? (
                      <div key={f.from} onClick={() => setSelected(f.from)} style={{ padding: "4px 8px", borderRadius: 2, marginBottom: 3, background: "#141414", cursor: "pointer", border: `1px solid ${LAYERS[n.layer]?.color}22`, fontSize: 10, color: LAYERS[n.layer]?.color, display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width="10" height="10" viewBox="-5 -5 10 10"><NodeTypeIcon type={n.type} x={0} y={0} color={LAYERS[n.layer]?.color}/></svg>
                        <span style={{ opacity: 0.4 }}>{"\u2190"}</span> {n.label.replace("\n", " ")}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              {FLOWS.filter(f => f.from === selectedNode.id && visibleIds.has(f.to)).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.12em", marginBottom: 6 }}>FEEDS INTO</div>
                  {FLOWS.filter(f => f.from === selectedNode.id && visibleIds.has(f.to)).map(f => {
                    const n = getNode(f.to);
                    return n ? (
                      <div key={f.to} onClick={() => setSelected(f.to)} style={{ padding: "4px 8px", borderRadius: 2, marginBottom: 3, background: "#141414", cursor: "pointer", border: `1px solid ${LAYERS[n.layer]?.color}22`, fontSize: 10, color: LAYERS[n.layer]?.color, display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width="10" height="10" viewBox="-5 -5 10 10"><NodeTypeIcon type={n.type} x={0} y={0} color={LAYERS[n.layer]?.color}/></svg>
                        <span style={{ opacity: 0.4 }}>{"\u2192"}</span> {n.label.replace("\n", " ")}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <button onClick={() => setSelected(null)} style={{ marginTop: 8, width: "100%", padding: "7px", background: "transparent", border: "1px solid #1e1e1e", color: "#333", fontSize: 9, cursor: "pointer", borderRadius: 3, letterSpacing: "0.1em" }}>CLOSE {"\u2715"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
