/**
 * OrgBrand — Embossed icon + wordmark for the clean UI.
 *
 * Displays the organisation's branding with a neumorphic emboss effect.
 * - TEAM / CONTRACTOR roles → Scrib3 icon + wordmark
 * - CLIENT role → org-provided assets (falls back to Scrib3 if none)
 *
 * The SVGs are rendered as <img> tags with CSS filter to create
 * the embossed/debossed look against the neumorphic surface.
 */
import { useAuthStore } from '../store/auth.store';
import scrib3Icon     from '../assets/images/scrib3-icon.svg';
import scrib3Wordmark from '../assets/images/scrib3-wordmark.svg';

interface OrgBrandProps {
  hwMode: 'dark' | 'light';
  /** Optional override icon URL (for client portals) */
  iconSrc?: string;
  /** Optional override wordmark URL (for client portals) */
  wordmarkSrc?: string;
  /** Layout variant */
  layout?: 'horizontal' | 'stacked';
  /** Size multiplier (default 1) */
  scale?: number;
}

export default function OrgBrand({
  hwMode,
  iconSrc,
  wordmarkSrc,
  layout = 'horizontal',
  scale = 1,
}: OrgBrandProps) {
  const role = useAuthStore(s => s.role);

  // Client role uses org assets if provided, otherwise falls back to Scrib3
  const isClientWithBranding = role === 'CLIENT' && (iconSrc || wordmarkSrc);
  const icon     = isClientWithBranding && iconSrc     ? iconSrc     : scrib3Icon;
  const wordmark = isClientWithBranding && wordmarkSrc ? wordmarkSrc : scrib3Wordmark;

  const isDark = hwMode === 'dark';

  // Emboss effect: on light surfaces the SVG appears as a subtle darker impression,
  // on dark surfaces it appears as a subtle lighter impression.
  // The SVGs are black fill, so we invert + control opacity for the effect.
  const embossFilter = isDark
    ? 'brightness(0) invert(1) opacity(0.08)'
    : 'brightness(0) opacity(0.06)';

  const iconHeight = 28 * scale;
  const wordmarkHeight = 18 * scale;
  const gap = layout === 'stacked' ? 6 * scale : 10 * scale;

  return (
    <div style={{
      display:        'flex',
      flexDirection:  layout === 'stacked' ? 'column' : 'row',
      alignItems:     'center',
      gap:            `${gap}px`,
      userSelect:     'none',
      pointerEvents:  'none',
    }}>
      <img
        src={icon}
        alt=""
        draggable={false}
        style={{
          height: `${iconHeight}px`,
          width:  'auto',
          filter: embossFilter,
          transition: 'filter 300ms',
        }}
      />
      <img
        src={wordmark}
        alt=""
        draggable={false}
        style={{
          height: `${wordmarkHeight}px`,
          width:  'auto',
          filter: embossFilter,
          transition: 'filter 300ms',
        }}
      />
    </div>
  );
}
