import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';

/* ─── Manifest types ─── */
interface BodyEntry { id: string; file: string; label: string }
interface EyeEntry  { id: string; file: string; label: string }
interface VariantEntry { id: string; file: string; colorIndex: number }
interface OutfitStyle  { style: number; label: string; variants: VariantEntry[] }
interface HairStyle    { style: number; label: string; variants: VariantEntry[] }
interface AccStyle     { style: number; name: string;  variants: VariantEntry[] }
interface Manifest {
  bodies: BodyEntry[];
  eyes: EyeEntry[];
  outfits: OutfitStyle[];
  hairstyles: HairStyle[];
  accessories: AccStyle[];
}

/* ─── Selection state ─── */
interface Selections {
  body: string;            // id
  eyes: string;            // id
  outfitStyle: number;     // style number
  outfitColor: number;     // colorIndex
  hairStyle: number;       // style number
  hairColor: number;       // colorIndex
  accessories: { style: number; color: number }[];
}

/* ─── Constants ─── */
const LAYER_BASE = '/assets/office/character-layers/';
const MANIFEST_URL = LAYER_BASE + 'manifest.json';

// Walk-cycle region: top-left 96x128 of each full spritesheet
const WALK_COLS = 3;
const WALK_ROWS = 4;
const FRAME_W = 32;
const FRAME_H = 32;
const SHEET_W = WALK_COLS * FRAME_W;  // 96
const SHEET_H = WALK_ROWS * FRAME_H;  // 128

const TABS = ['BODY', 'EYES', 'OUTFIT', 'HAIR', 'ACCESSORIES'] as const;
type Tab = typeof TABS[number];

/* ─── Helpers ─── */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function findFile(manifest: Manifest, id: string): string | null {
  for (const b of manifest.bodies) if (b.id === id) return b.file;
  for (const e of manifest.eyes) if (e.id === id) return e.file;
  for (const o of manifest.outfits) for (const v of o.variants) if (v.id === id) return v.file;
  for (const h of manifest.hairstyles) for (const v of h.variants) if (v.id === id) return v.file;
  for (const a of manifest.accessories) for (const v of a.variants) if (v.id === id) return v.file;
  return null;
}

function getOutfitId(manifest: Manifest, style: number, color: number): string {
  const s = manifest.outfits.find(o => o.style === style);
  const v = s?.variants.find(v => v.colorIndex === color);
  return v?.id ?? '';
}

function getHairId(manifest: Manifest, style: number, color: number): string {
  const s = manifest.hairstyles.find(h => h.style === style);
  const v = s?.variants.find(v => v.colorIndex === color);
  return v?.id ?? '';
}

function getAccId(manifest: Manifest, style: number, color: number): string {
  const s = manifest.accessories.find(a => a.style === style);
  const v = s?.variants.find(v => v.colorIndex === color);
  return v?.id ?? '';
}

/* ─── Image cache ─── */
const imageCache = new Map<string, HTMLImageElement>();

async function getCachedImage(file: string): Promise<HTMLImageElement> {
  if (imageCache.has(file)) return imageCache.get(file)!;
  const img = await loadImage(LAYER_BASE + file);
  imageCache.set(file, img);
  return img;
}

/* ─── Compositor ─── */
/**
 * Composite all selected layers into a single-frame preview (32x32)
 * and tile it into a 96x128 walk sheet format for Phaser compatibility.
 * Since the full animation sheets don't follow RPG Maker layout,
 * we use the front-idle frame (0,0) for all 12 cells.
 */
async function compositeWalkSheet(
  manifest: Manifest,
  sel: Selections,
): Promise<HTMLCanvasElement> {
  // First, composite a single 32x32 frame from all layers
  const frame = document.createElement('canvas');
  frame.width = FRAME_W;
  frame.height = FRAME_H;
  const fCtx = frame.getContext('2d')!;
  fCtx.imageSmoothingEnabled = false;

  const layerFiles = getLayerFileList(manifest, sel);

  for (const file of layerFiles) {
    try {
      const img = await getCachedImage(file);
      // Extract the front-idle frame at (0, 0)
      fCtx.drawImage(img, 0, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
    } catch {
      // Skip failed layers
    }
  }

  // Now tile into a 96x128 sheet (3 cols × 4 rows) so Phaser can use it
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_W;
  canvas.height = SHEET_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < WALK_ROWS; row++) {
    for (let col = 0; col < WALK_COLS; col++) {
      ctx.drawImage(frame, col * FRAME_W, row * FRAME_H);
    }
  }

  return canvas;
}

/** Get all layer files in official compositing order */
function getLayerFileList(manifest: Manifest, sel: Selections): string[] {
  const files: string[] = [];

  const bodyFile = findFile(manifest, sel.body);
  if (bodyFile) files.push(bodyFile);

  const eyeFile = findFile(manifest, sel.eyes);
  if (eyeFile) files.push(eyeFile);

  const outfitId = getOutfitId(manifest, sel.outfitStyle, sel.outfitColor);
  const outfitFile = findFile(manifest, outfitId);
  if (outfitFile) files.push(outfitFile);

  const hairId = getHairId(manifest, sel.hairStyle, sel.hairColor);
  const hairFile = findFile(manifest, hairId);
  if (hairFile) files.push(hairFile);

  for (const acc of sel.accessories) {
    const accId = getAccId(manifest, acc.style, acc.color);
    const accFile = findFile(manifest, accId);
    if (accFile) files.push(accFile);
  }

  return files;
}

/* ─── Layer Preview: draws a single frame from a layer spritesheet ─── */
// @ts-expect-error preserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _LayerPreview({
  file,
  scale = 2.5,
  col = 1,
  row = 0,
}: {
  file: string;
  scale?: number;
  col?: number;
  row?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = LAYER_BASE + file;
    img.onload = () => {
      ctx.drawImage(
        img,
        col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H,
        0, 0, FRAME_W * scale, FRAME_H * scale,
      );
    };
  }, [file, scale, col, row]);

  return (
    <canvas
      ref={canvasRef}
      width={FRAME_W * scale}
      height={FRAME_H * scale}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  );
}

/* ─── Composited Preview: draws multiple layers on one canvas ─── */
function CompositedPreview({
  manifest,
  selections,
  scale = 5,
  direction = 0,
  animate = true,
}: {
  manifest: Manifest;
  selections: Selections;
  scale?: number;
  direction?: number;
  animate?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(false);

  const getLayerFiles = useCallback(() => {
    return getLayerFileList(manifest, selections);
  }, [manifest, selections]);

  useEffect(() => {
    let cancelled = false;
    loadedRef.current = false;

    const files = getLayerFiles();
    Promise.all(files.map(f => getCachedImage(f))).then(imgs => {
      if (cancelled) return;
      imagesRef.current = imgs;
      loadedRef.current = true;
    });

    return () => { cancelled = true; };
  }, [getLayerFiles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    let animId: number;
    let frame = 0;
    let tick = 0;

    const draw = () => {
      tick++;
      if (animate && tick % 12 === 0) {
        frame = (frame + 1) % WALK_COLS;
      }

      const col = animate ? frame : 0;
      const row = direction;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (loadedRef.current) {
        for (const img of imagesRef.current) {
          ctx.drawImage(
            img,
            col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H,
            0, 0, FRAME_W * scale, FRAME_H * scale,
          );
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [scale, direction, animate, getLayerFiles]);

  return (
    <canvas
      ref={canvasRef}
      width={FRAME_W * scale}
      height={FRAME_H * scale}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  );
}

/* ─── Multi-layer preview for single frame (used in grids) ─── */
function MultiLayerPreview({
  files,
  scale = 2.5,
  col = 1,
  row = 0,
}: {
  files: string[];
  scale?: number;
  col?: number;
  row?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Promise.all(files.map(f => getCachedImage(f))).then(imgs => {
      for (const img of imgs) {
        ctx.drawImage(
          img,
          col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H,
          0, 0, FRAME_W * scale, FRAME_H * scale,
        );
      }
    });
  }, [files, scale, col, row]);

  return (
    <canvas
      ref={canvasRef}
      width={FRAME_W * scale}
      height={FRAME_H * scale}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                    MAIN COMPONENT                              */
/* ═══════════════════════════════════════════════════════════════ */

export default function AvatarCreatorPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const username = profile?.username ?? 'Player';

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [tab, setTab] = useState<Tab>('BODY');
  const [saving, setSaving] = useState(false);

  // Selections
  const [sel, setSel] = useState<Selections>({
    body: 'body-01',
    eyes: 'eyes-01',
    outfitStyle: 1,
    outfitColor: 1,
    hairStyle: 1,
    hairColor: 1,
    accessories: [],
  });

  // Load manifest
  useEffect(() => {
    fetch(MANIFEST_URL)
      .then(r => r.json())
      .then((m: Manifest) => {
        setManifest(m);

        // Load saved config if exists
        const saved = profile?.avatar_config as Record<string, unknown> | null | undefined;
        if (saved && saved.body && typeof saved.body === 'string') {
          setSel({
            body: (saved.body as string) || 'body-01',
            eyes: (saved.eyes as string) || 'eyes-01',
            outfitStyle: parseStyleFromId(saved.outfit as string, 'outfit') || 1,
            outfitColor: parseColorFromId(saved.outfit as string) || 1,
            hairStyle: parseStyleFromId(saved.hairstyle as string, 'hair') || 1,
            hairColor: parseColorFromId(saved.hairstyle as string) || 1,
            accessories: Array.isArray(saved.accessories)
              ? (saved.accessories as string[]).map(id => ({
                  style: parseStyleFromId(id, 'acc') || 1,
                  color: parseColorFromId(id) || 1,
                }))
              : [],
          });
        }
      })
      .catch(err => console.error('Failed to load manifest:', err));
  }, [profile]);

  const handleSave = async () => {
    if (!manifest) return;
    setSaving(true);
    console.log('[AvatarCreator] handleSave started');
    try {
      console.log('[AvatarCreator] Step 1: Compositing walk sheet...');
      const sheet = await compositeWalkSheet(manifest, sel);
      const compositedSheet = sheet.toDataURL('image/png');
      console.log('[AvatarCreator] Step 1 done. Sheet size:', compositedSheet.length, 'chars');

      const config = {
        body: sel.body,
        eyes: sel.eyes,
        outfit: getOutfitId(manifest, sel.outfitStyle, sel.outfitColor),
        hairstyle: getHairId(manifest, sel.hairStyle, sel.hairColor),
        accessories: sel.accessories.map(a => getAccId(manifest, a.style, a.color)),
        compositedSheet,
      };
      console.log('[AvatarCreator] Step 2: Config built. body:', config.body, 'eyes:', config.eyes);

      // Save to Supabase if logged in
      if (profile?.id) {
        console.log('[AvatarCreator] Step 3: Saving to Supabase for user', profile.id);
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_config: config })
          .eq('id', profile.id);
        if (error) {
          console.warn('[AvatarCreator] Supabase save warning:', error.message);
        } else {
          console.log('[AvatarCreator] Step 3 done: Supabase save successful');
        }
      } else {
        console.log('[AvatarCreator] Step 3: No profile.id, skipping Supabase save');
      }

      // Update local state regardless of DB save or profile state
      console.log('[AvatarCreator] Step 4: Updating local auth store');
      if (profile) {
        useAuthStore.setState({
          profile: { ...profile, avatar_config: config as unknown as import('../components/virtual-office/game/systems/AvatarConfig').AvatarConfig },
        });
      }

      // Navigate to office (always, even if profile is null)
      console.log('[AvatarCreator] Step 5: Navigating to office');
      window.location.href = '/device?view=office';
    } catch (err) {
      console.error('[AvatarCreator] Failed to save avatar:', err);
      // Still navigate even if save fails
      console.log('[AvatarCreator] Navigating to office despite error');
      window.location.href = '/device?view=office';
    }
    setSaving(false);
  };

  const handleRandomize = () => {
    if (!manifest) return;
    const rInt = (max: number) => Math.floor(Math.random() * max);
    const rStyle = <T extends { style: number; variants: { colorIndex: number }[] }>(arr: T[]) => {
      const s = arr[rInt(arr.length)];
      return { style: s.style, color: s.variants[rInt(s.variants.length)].colorIndex };
    };

    const outR = rStyle(manifest.outfits);
    const hairR = rStyle(manifest.hairstyles);

    // Random 0-2 accessories
    const accCount = rInt(3);
    const accIndices = new Set<number>();
    while (accIndices.size < accCount && accIndices.size < manifest.accessories.length) {
      accIndices.add(rInt(manifest.accessories.length));
    }
    const accs = [...accIndices].map(i => {
      const a = manifest.accessories[i];
      return { style: a.style, color: a.variants[rInt(a.variants.length)].colorIndex };
    });

    setSel({
      body: manifest.bodies[rInt(manifest.bodies.length)].id,
      eyes: manifest.eyes[rInt(manifest.eyes.length)].id,
      outfitStyle: outR.style,
      outfitColor: outR.color,
      hairStyle: hairR.style,
      hairColor: hairR.color,
      accessories: accs,
    });
  };

  if (!manifest) {
    return (
      <div style={pageStyle}>
        <span style={{ color: 'rgba(234, 242, 215, 0.5)', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
          LOADING CHARACTER DATA...
        </span>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header — VirtualOffice top-bar style */}
      <div style={headerStyle}>
        <button onClick={() => navigate('/device')} style={backBtnStyle}>&larr; BACK</button>
        <span style={titleStyle}>CHARACTER CREATOR</span>
        <span style={subtitleStyle}>{username}</span>
      </div>

      {/* Main content */}
      <div style={contentStyle}>
        {/* Left: Preview */}
        <div style={previewColumnStyle}>
          <div style={previewFrameStyle}>
            <CompositedPreview manifest={manifest} selections={sel} scale={8} direction={0} animate />
          </div>
          <span style={avatarNameStyle}>{username}</span>

          <div style={buttonRowStyle}>
            <button onClick={handleRandomize} style={secondaryBtnStyle}>RANDOMIZE</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
              {saving ? 'SAVING...' : 'SAVE & ENTER'}
            </button>
          </div>
        </div>

        {/* Right: Tabs */}
        <div style={panelColumnStyle}>
          {/* Tab bar */}
          <div style={tabBarStyle}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  ...tabStyle,
                  ...(tab === t ? activeTabStyle : {}),
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={tabContentStyle}>
            {tab === 'BODY' && (
              <BodyTab manifest={manifest} sel={sel} setSel={setSel} />
            )}
            {tab === 'EYES' && (
              <EyesTab manifest={manifest} sel={sel} setSel={setSel} />
            )}
            {tab === 'OUTFIT' && (
              <OutfitTab manifest={manifest} sel={sel} setSel={setSel} />
            )}
            {tab === 'HAIR' && (
              <HairTab manifest={manifest} sel={sel} setSel={setSel} />
            )}
            {tab === 'ACCESSORIES' && (
              <AccessoriesTab manifest={manifest} sel={sel} setSel={setSel} />
            )}
          </div>
        </div>
      </div>

      {/* Back button moved to header */}
    </div>
  );
}

/* ─── Parse helpers for loading saved config ─── */
function parseStyleFromId(id: string | undefined, prefix: string): number {
  if (!id) return 0;
  // e.g. "outfit-05-02" → 5, "hair-12-04" → 12, "acc-03-01" → 3
  const re = new RegExp(`^${prefix}-(\\d+)-(\\d+)$`);
  const m = id.match(re);
  return m ? parseInt(m[1], 10) : 0;
}

function parseColorFromId(id: string | undefined): number {
  if (!id) return 0;
  const m = id.match(/-(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

/* ═══════════════════════════════════════════════════════════════ */
/*                         TAB PANELS                             */
/* ═══════════════════════════════════════════════════════════════ */

interface TabProps {
  manifest: Manifest;
  sel: Selections;
  setSel: React.Dispatch<React.SetStateAction<Selections>>;
}

const SKIN_COLORS: Record<string, string> = {
  'body-01': '#F5D0A9',
  'body-02': '#E8B88A',
  'body-03': '#D4A574',
  'body-04': '#C68642',
  'body-05': '#A0693E',
  'body-06': '#7A4B2E',
  'body-07': '#5C3A1E',
  'body-08': '#F0B4C8',
  'body-09': '#D8C8E0',
};

function BodyTab({ manifest, sel, setSel }: TabProps) {
  return (
    <>
      <div style={sectionLabelStyle}>SKIN TONE</div>
      <div style={gridStyle}>
        {manifest.bodies.map(b => {
          const swatchColor = SKIN_COLORS[b.id] || '#888888';
          return (
            <button
              key={b.id}
              onClick={() => setSel(s => ({ ...s, body: b.id }))}
              style={{
                ...cardStyle,
                ...(sel.body === b.id ? selectedCardStyle : {}),
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: swatchColor,
                border: sel.body === b.id ? '2px solid #D7ABC5' : '2px solid rgba(234, 242, 215, 0.15)',
                boxSizing: 'border-box' as const,
              }} />
              <span style={cardLabelStyle}>{b.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

const EYE_DECORATORS = ['◆', '◇', '●', '○', '★', '☆', '▲'];

function EyesTab({ manifest, sel, setSel }: TabProps) {
  return (
    <>
      <div style={sectionLabelStyle}>EYE STYLE</div>
      <div style={gridStyle}>
        {manifest.eyes.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setSel(s => ({ ...s, eyes: e.id }))}
            style={{
              ...cardStyle,
              ...(sel.eyes === e.id ? selectedCardStyle : {}),
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(234, 242, 215, 0.04)',
              borderRadius: 8,
              fontSize: '18px',
              color: sel.eyes === e.id ? '#D7ABC5' : 'rgba(234, 242, 215, 0.5)',
            }}>
              <span>{EYE_DECORATORS[i % EYE_DECORATORS.length]}</span>
            </div>
            <span style={cardLabelStyle}>Style {i + 1}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function OutfitTab({ manifest, sel, setSel }: TabProps) {
  const bodyFile = findFile(manifest, sel.body) || '';
  const selectedStyle = manifest.outfits.find(o => o.style === sel.outfitStyle);

  return (
    <>
      <div style={sectionLabelStyle}>OUTFIT STYLE</div>
      <div style={gridStyle}>
        {manifest.outfits.map(o => {
          const previewFile = o.variants[0]?.file || '';
          return (
            <button
              key={o.style}
              onClick={() => setSel(s => ({ ...s, outfitStyle: o.style, outfitColor: o.variants[0]?.colorIndex || 1 }))}
              style={{
                ...cardStyle,
                ...(sel.outfitStyle === o.style ? selectedCardStyle : {}),
              }}
            >
              <MultiLayerPreview files={bodyFile ? [bodyFile, previewFile] : [previewFile]} scale={3} />
              <span style={cardLabelStyle}>{o.label}</span>
            </button>
          );
        })}
      </div>

      {selectedStyle && selectedStyle.variants.length > 1 && (
        <>
          <div style={{ ...sectionLabelStyle, marginTop: '16px' }}>COLOR VARIANT</div>
          <div style={colorGridStyle}>
            {selectedStyle.variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSel(s => ({ ...s, outfitColor: v.colorIndex }))}
                style={{
                  ...colorCardStyle,
                  ...(sel.outfitColor === v.colorIndex ? selectedCardStyle : {}),
                }}
              >
                <MultiLayerPreview files={bodyFile ? [bodyFile, v.file] : [v.file]} scale={3} />
                <span style={cardLabelStyle}>{v.colorIndex}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function HairTab({ manifest, sel, setSel }: TabProps) {
  const bodyFile = findFile(manifest, sel.body) || '';
  const outfitId = getOutfitId(manifest, sel.outfitStyle, sel.outfitColor);
  const outfitFile = findFile(manifest, outfitId) || '';
  const baseLayers = [bodyFile, outfitFile].filter(Boolean);

  const selectedStyle = manifest.hairstyles.find(h => h.style === sel.hairStyle);

  return (
    <>
      <div style={sectionLabelStyle}>HAIRSTYLE</div>
      <div style={gridStyle}>
        {manifest.hairstyles.map(h => {
          const previewFile = h.variants[0]?.file || '';
          return (
            <button
              key={h.style}
              onClick={() => setSel(s => ({ ...s, hairStyle: h.style, hairColor: h.variants[0]?.colorIndex || 1 }))}
              style={{
                ...cardStyle,
                ...(sel.hairStyle === h.style ? selectedCardStyle : {}),
              }}
            >
              <MultiLayerPreview files={[...baseLayers, previewFile]} scale={3} />
              <span style={cardLabelStyle}>{h.label}</span>
            </button>
          );
        })}
      </div>

      {selectedStyle && selectedStyle.variants.length > 1 && (
        <>
          <div style={{ ...sectionLabelStyle, marginTop: '16px' }}>HAIR COLOR</div>
          <div style={colorGridStyle}>
            {selectedStyle.variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSel(s => ({ ...s, hairColor: v.colorIndex }))}
                style={{
                  ...colorCardStyle,
                  ...(sel.hairColor === v.colorIndex ? selectedCardStyle : {}),
                }}
              >
                <MultiLayerPreview files={[...baseLayers, v.file]} scale={3} />
                <span style={cardLabelStyle}>{v.colorIndex}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ─── Accessory conflict groups ─── */
const ACC_HEAD_SLOT = new Set([4, 5, 6, 7, 8, 11, 18, 19]);
const ACC_FACE_SLOT = new Set([15, 16, 17]);
const ACC_BODY_SLOT = new Set([3]);
// MISC (1, 2, 9, 10, 12, 13, 14) can stack freely

function getAccSlot(style: number): 'HEAD' | 'FACE' | 'BODY' | 'MISC' {
  if (ACC_HEAD_SLOT.has(style)) return 'HEAD';
  if (ACC_FACE_SLOT.has(style)) return 'FACE';
  if (ACC_BODY_SLOT.has(style)) return 'BODY';
  return 'MISC';
}

function AccessoriesTab({ manifest, sel, setSel }: TabProps) {
  const bodyFile = findFile(manifest, sel.body) || '';
  const outfitId = getOutfitId(manifest, sel.outfitStyle, sel.outfitColor);
  const outfitFile = findFile(manifest, outfitId) || '';
  const hairId = getHairId(manifest, sel.hairStyle, sel.hairColor);
  const hairFile = findFile(manifest, hairId) || '';
  const eyeFile = findFile(manifest, sel.eyes) || '';
  const baseLayers = [bodyFile, outfitFile, hairFile, eyeFile].filter(Boolean);

  const isAccSelected = (style: number) => sel.accessories.some(a => a.style === style);
  const getAccColor = (style: number) => sel.accessories.find(a => a.style === style)?.color;

  const toggleAcc = (style: number, color: number) => {
    setSel(s => {
      // If already selected, deselect it
      if (s.accessories.some(a => a.style === style)) {
        return { ...s, accessories: s.accessories.filter(a => a.style !== style) };
      }

      // Check conflict groups: HEAD, FACE, BODY are exclusive within their slot
      const slot = getAccSlot(style);
      let filtered = s.accessories;
      if (slot !== 'MISC') {
        // Remove any existing accessory from the same slot
        const slotSet = slot === 'HEAD' ? ACC_HEAD_SLOT : slot === 'FACE' ? ACC_FACE_SLOT : ACC_BODY_SLOT;
        filtered = s.accessories.filter(a => !slotSet.has(a.style));
      }

      return { ...s, accessories: [...filtered, { style, color }] };
    });
  };

  const setAccColor = (style: number, color: number) => {
    setSel(s => ({
      ...s,
      accessories: s.accessories.map(a => a.style === style ? { ...a, color } : a),
    }));
  };

  // Find the currently expanded accessory (first selected one or null)
  const expandedStyle = sel.accessories.length > 0 ? sel.accessories[sel.accessories.length - 1].style : null;
  const expandedAcc = expandedStyle ? manifest.accessories.find(a => a.style === expandedStyle) : null;

  return (
    <>
      <div style={sectionLabelStyle}>ACCESSORIES (toggle multiple)</div>
      <div style={gridStyle}>
        {manifest.accessories.map(a => {
          const previewFile = a.variants[0]?.file || '';
          const selected = isAccSelected(a.style);
          return (
            <button
              key={a.style}
              onClick={() => toggleAcc(a.style, a.variants[0]?.colorIndex || 1)}
              style={{
                ...cardStyle,
                ...(selected ? selectedCardStyle : {}),
              }}
            >
              <MultiLayerPreview files={[...baseLayers, previewFile]} scale={3} />
              <span style={cardLabelStyle}>{a.name}</span>
              {selected && <span style={checkStyle}>&#10003;</span>}
            </button>
          );
        })}
      </div>

      {expandedAcc && expandedAcc.variants.length > 1 && (
        <>
          <div style={{ ...sectionLabelStyle, marginTop: '16px' }}>
            {expandedAcc.name.toUpperCase()} COLOR
          </div>
          <div style={colorGridStyle}>
            {expandedAcc.variants.map(v => (
              <button
                key={v.id}
                onClick={() => setAccColor(expandedAcc.style, v.colorIndex)}
                style={{
                  ...colorCardStyle,
                  ...(getAccColor(expandedAcc.style) === v.colorIndex ? selectedCardStyle : {}),
                }}
              >
                <MultiLayerPreview files={[...baseLayers, v.file]} scale={3} />
                <span style={cardLabelStyle}>{v.colorIndex}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                          STYLES                                */
/* ═══════════════════════════════════════════════════════════════ */

const pageStyle: React.CSSProperties = {
  width: '100vw',
  minHeight: '100vh',
  background: '#0D0D1A',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontFamily: "'Owners Wide', sans-serif",
  color: '#EAF2D7',
  padding: '0 20px 32px',
  boxSizing: 'border-box',
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  background: 'rgba(234, 242, 215, 0.04)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(234, 242, 215, 0.08)',
  marginBottom: '24px',
  position: 'relative',
};

const backBtnStyle: React.CSSProperties = {
  position: 'absolute',
  left: '16px',
  background: 'rgba(234, 242, 215, 0.04)',
  border: '1px solid rgba(234, 242, 215, 0.08)',
  borderRadius: '75.641px',
  color: '#EAF2D7',
  fontFamily: "'Owners Wide', sans-serif",
  fontSize: '10px',
  letterSpacing: '0.1em',
  padding: '6px 16px',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.22, 0.61, 0.36, 1)',
};

const titleStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Kaio', sans-serif",
  fontWeight: 800,
  fontSize: '16px',
  letterSpacing: '0.15em',
  color: '#EAF2D7',
  textTransform: 'uppercase',
  fontFeatureSettings: "'ordn' 1, 'dlig' 1",
};

const subtitleStyle: React.CSSProperties = {
  display: 'none',
};

const avatarNameStyle: React.CSSProperties = {
  fontFamily: "'Kaio', sans-serif",
  fontWeight: 800,
  fontSize: '13px',
  letterSpacing: '0.1em',
  color: 'rgba(234, 242, 215, 0.5)',
  textTransform: 'uppercase',
  fontFeatureSettings: "'ordn' 1, 'dlig' 1",
  marginTop: '-4px',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  gap: '40px',
  maxWidth: '1100px',
  width: '100%',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const previewColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  minWidth: '220px',
};

const previewFrameStyle: React.CSSProperties = {
  background: 'rgba(234, 242, 215, 0.04)',
  border: '1px solid rgba(234, 242, 215, 0.08)',
  borderRadius: '10.258px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
};

const primaryBtnStyle: React.CSSProperties = {
  background: '#D7ABC5',
  border: 'none',
  borderRadius: '75.641px',
  color: '#000000',
  fontFamily: "'Owners Wide', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.15em',
  padding: '10px 24px',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.22, 0.61, 0.36, 1)',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'rgba(234, 242, 215, 0.04)',
  border: '1px solid rgba(234, 242, 215, 0.08)',
  borderRadius: '75.641px',
  color: '#EAF2D7',
  fontFamily: "'Owners Wide', sans-serif",
  fontSize: '10px',
  letterSpacing: '0.1em',
  padding: '10px 16px',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.22, 0.61, 0.36, 1)',
};

const panelColumnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '400px',
  maxWidth: '600px',
  display: 'flex',
  flexDirection: 'column',
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '2px',
  marginBottom: '12px',
  borderBottom: '1px solid rgba(234, 242, 215, 0.08)',
  paddingBottom: '0',
};

const tabStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: 'rgba(234, 242, 215, 0.3)',
  fontFamily: "'Owners Wide', sans-serif",
  fontSize: '9px',
  letterSpacing: '0.15em',
  padding: '8px 12px',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.22, 0.61, 0.36, 1)',
};

const activeTabStyle: React.CSSProperties = {
  color: '#D7ABC5',
  borderBottomColor: '#D7ABC5',
};

const tabContentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 260px)',
  paddingRight: '4px',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: 'rgba(234, 242, 215, 0.5)',
  fontFamily: "'Kaio', sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase',
  fontFeatureSettings: "'ordn' 1, 'dlig' 1",
  marginBottom: '10px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: '6px',
};

const colorGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: '6px',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(234, 242, 215, 0.04)',
  border: '2px solid rgba(234, 242, 215, 0.08)',
  borderRadius: '10.258px',
  padding: '6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3px',
  cursor: 'pointer',
  transition: 'all 300ms cubic-bezier(0.22, 0.61, 0.36, 1)',
  position: 'relative',
};

const colorCardStyle: React.CSSProperties = {
  ...cardStyle,
  padding: '4px',
};

const selectedCardStyle: React.CSSProperties = {
  background: 'rgba(215, 171, 197, 0.1)',
  borderColor: '#D7ABC5',
  boxShadow: 'none',
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: '7px',
  letterSpacing: '0.1em',
  color: 'rgba(234, 242, 215, 0.5)',
  fontFamily: "'Owners Wide', sans-serif",
  textAlign: 'center',
  lineHeight: '1.2',
  maxWidth: '64px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const checkStyle: React.CSSProperties = {
  position: 'absolute',
  top: '2px',
  right: '4px',
  fontSize: '10px',
  color: '#D7ABC5',
};

// skipStyle removed — back button now in header
