import type { NodeType } from "./data/types.ts";

interface NodeTypeIconProps {
  type: NodeType;
  x: number;
  y: number;
  color: string;
}

export default function NodeTypeIcon({ type, x, y, color }: NodeTypeIconProps) {
  const s = 7;
  switch(type) {
    case "platform":  // Square
      return <rect x={x-s/2} y={y-s/2} width={s} height={s} fill={color} opacity={0.9} rx={1}/>;
    case "process":   // Diamond
      return <polygon points={`${x},${y-s} ${x+s},${y} ${x},${y+s} ${x-s},${y}`} fill={color} opacity={0.9}/>;
    case "database":  // Cylinder (two ellipses + rect)
      return <g>
        <ellipse cx={x} cy={y-3} rx={s/2} ry={2} fill={color} opacity={0.9}/>
        <rect x={x-s/2} y={y-3} width={s} height={6} fill={color} opacity={0.7}/>
        <ellipse cx={x} cy={y+3} rx={s/2} ry={2} fill={color} opacity={0.9}/>
      </g>;
    case "ai":        // Hexagon
      return <polygon points={`${x},${y-s} ${x+s*0.866},${y-s*0.5} ${x+s*0.866},${y+s*0.5} ${x},${y+s} ${x-s*0.866},${y+s*0.5} ${x-s*0.866},${y-s*0.5}`} fill={color} opacity={0.9}/>;
    case "comms":     // Circle
      return <circle cx={x} cy={y} r={s/2} fill={color} opacity={0.9}/>;
    default:
      return <rect x={x-s/2} y={y-s/2} width={s} height={s} fill={color} opacity={0.7} rx={1}/>;
  }
}
