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
async function compositeWalkSheet(
  manifest: Manifest,
  sel: Selections,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_W;
  canvas.height = SHEET_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // Collect layer files in official render order: body, eyes, outfit, hairstyle, accessories
  const layerFiles: string[] = [];

  const bodyFile = findFile(manifest, sel.body);
  if (bodyFile) layerFiles.push(bodyFile);

  const eyeFile = findFile(manifest, sel.eyes);
  if (eyeFile) layerFiles.push(eyeFile);

  const outfitId = getOutfitId(manifest, sel.outfitStyle, sel.outfitColor);
  const outfitFile = findFile(manifest, outfitId);
  if (outfitFile) layerFiles.push(outfitFile);

  const hairId = getHairId(manifest, sel.hairStyle, sel.hairColor);
  const hairFile = findFile(manifest, hairId);
  if (hairFile) layerFiles.push(hairFile);

  for (const acc of sel.accessories) {
    const accId = getAccId(manifest, acc.style, acc.color);
    const accFile = findFile(manifest, accId);
    if (accFile) layerFiles.push(accFile);
  }

  // Load and draw each layer (extract top-left 96x128 region)
  for (const file of layerFiles) {
    try {
      const img = await getCachedImage(file);
      ctx.drawImage(img, 0, 0, SHEET_W, SHEET_H, 0, 0, SHEET_W, SHEET_H);
    } catch {
      // Skip failed layers
    }
  }

  return canvas;
}

/* ─── Layer Preview: draws a single frame from a layer spritesheet ─── */
function LayerPreview({
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

  // Build the layer file list
  const getLayerFiles = useCallback(() => {
    const files: string[] = [];
    const bodyFile = findFile(manifest, selections.body);
    if (bodyFile) files.push(bodyFile);

    const eyeFile = findFile(manifest, selections.eyes);
    if (eyeFile) files.push(eyeFile);

    const outfitId = getOutfitId(manifest, selections.outfitStyle, selections.outfitColor);
    const outfitFile = findFile(manifest, outfitId);
    if (outfitFile) files.push(outfitFile);

    const hairId = getHairId(manifest, selections.hairStyle, selections.hairColor);
    const hairFile = findFile(manifest, hairId);
    if (hairFile) files.push(hairFile);

    for (const acc of selections.accessories) {
      const accId = getAccId(manifest, acc.style, acc.color);
      const accFile = findFile(manifest, accId);
      if (accFile) files.push(accFile);
    }
    return files;
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
    if (!manifest || !profile) return;
    setSaving(true);
    try {
      const sheet = await compositeWalkSheet(manifest, sel);
      const compositedSheet = sheet.toDataURL('image/png');

      const config = {
        body: sel.body,
        eyes: sel.eyes,
        outfit: getOutfitId(manifest, sel.outfitStyle, sel.outfitColor),
        hairstyle: getHairId(manifest, sel.hairStyle, sel.hairColor),
        accessories: sel.accessories.map(a => getAccId(manifest, a.style, a.color)),
        compositedSheet,
      };

      await supabase
        .from('profiles')
        .update({ avatar_config: config })
        .eq('id', profile.id);

      useAuthStore.setState({
        profile: { ...profile, avatar_config: config as unknown as import('../components/virtual-office/game/systems/AvatarConfig').AvatarConfig },
      });

      // Register the texture with Phaser via window bridge
      const win = window as unknown as Record<string, unknown>;
      if (win.__PHASER_BRIDGE__) {
        const bridge = win.__PHASER_BRIDGE__ as { emit: (e: string, d: unknown) => void };
        const texCanvas = document.createElement('canvas');
        texCanvas.width = SHEET_W;
        texCanvas.height = SHEET_H;
        const tCtx = texCanvas.getContext('2d')!;
        tCtx.drawImage(sheet, 0, 0);
        bridge.emit('register:avatar', { key: 'custom-avatar', canvas: texCanvas });
      }

      navigate('/?view=office');
    } catch (err) {
      console.error('Failed to save avatar:', err);
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
        <span style={{ color: '#4A5568', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
          LOADING CHARACTER DATA...
        </span>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={titleStyle}>CHARACTER CREATOR</span>
        <span style={subtitleStyle}>{username}</span>
      </div>

      {/* Main content */}
      <div style={contentStyle}>
        {/* Left: Preview */}
        <div style={previewColumnStyle}>
          <div style={previewFrameStyle}>
            <CompositedPreview manifest={manifest} selections={sel} scale={6} direction={0} animate />
          </div>

          {/* Direction previews */}
          <div style={directionRowStyle}>
            {[
              { dir: 0, label: 'FRONT' },
              { dir: 1, label: 'LEFT' },
              { dir: 2, label: 'RIGHT' },
              { dir: 3, label: 'BACK' },
            ].map(({ dir, label }) => (
              <div key={label} style={dirPreviewStyle}>
                <CompositedPreview manifest={manifest} selections={sel} scale={2.5} direction={dir} animate />
                <span style={dirLabelStyle}>{label}</span>
              </div>
            ))}
          </div>

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

      <button onClick={() => navigate('/')} style={skipStyle}>SKIP FOR NOW &rarr;</button>
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

function BodyTab({ manifest, sel, setSel }: TabProps) {
  return (
    <>
      <div style={sectionLabelStyle}>SKIN TONE</div>
      <div style={gridStyle}>
        {manifest.bodies.map(b => (
          <button
            key={b.id}
            onClick={() => setSel(s => ({ ...s, body: b.id }))}
            style={{
              ...cardStyle,
              ...(sel.body === b.id ? selectedCardStyle : {}),
            }}
          >
            <LayerPreview file={b.file} scale={2.5} />
            <span style={cardLabelStyle}>{b.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function EyesTab({ manifest, sel, setSel }: TabProps) {
  // Show eyes composited on top of current body for better preview
  const bodyFile = findFile(manifest, sel.body) || '';
  return (
    <>
      <div style={sectionLabelStyle}>EYE STYLE</div>
      <div style={gridStyle}>
        {manifest.eyes.map(e => (
          <button
            key={e.id}
            onClick={() => setSel(s => ({ ...s, eyes: e.id }))}
            style={{
              ...cardStyle,
              ...(sel.eyes === e.id ? selectedCardStyle : {}),
            }}
          >
            <MultiLayerPreview files={bodyFile ? [bodyFile, e.file] : [e.file]} scale={2.5} />
            <span style={cardLabelStyle}>{e.label}</span>
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
              <MultiLayerPreview files={bodyFile ? [bodyFile, previewFile] : [previewFile]} scale={2} />
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
                <MultiLayerPreview files={bodyFile ? [bodyFile, v.file] : [v.file]} scale={2} />
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
              <MultiLayerPreview files={[...baseLayers, previewFile]} scale={2} />
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
                <MultiLayerPreview files={[...baseLayers, v.file]} scale={2} />
                <span style={cardLabelStyle}>{v.colorIndex}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
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
      if (s.accessories.some(a => a.style === style)) {
        return { ...s, accessories: s.accessories.filter(a => a.style !== style) };
      }
      return { ...s, accessories: [...s.accessories, { style, color }] };
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
              <MultiLayerPreview files={[...baseLayers, previewFile]} scale={2} />
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
                <MultiLayerPreview files={[...baseLayers, v.file]} scale={2} />
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
  background: '#1A1A2E',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontFamily: "'JetBrains Mono', monospace",
  color: '#E2E8F0',
  padding: '32px 20px',
  boxSizing: 'border-box',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
};

const titleStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'OwnersWide', 'JetBrains Mono', monospace",
  fontSize: '18px',
  letterSpacing: '0.3em',
  color: '#A0AEC0',
  marginBottom: '6px',
};

const subtitleStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#4A5568',
  letterSpacing: '0.15em',
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
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const directionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
};

const dirPreviewStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
};

const dirLabelStyle: React.CSSProperties = {
  fontSize: '8px',
  letterSpacing: '0.15em',
  color: '#4A5568',
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
};

const primaryBtnStyle: React.CSSProperties = {
  background: 'rgba(66, 153, 225, 0.25)',
  border: '1px solid rgba(66, 153, 225, 0.5)',
  borderRadius: '6px',
  color: '#63B3ED',
  fontFamily: "'OwnersWide', 'JetBrains Mono', monospace",
  fontSize: '11px',
  letterSpacing: '0.15em',
  padding: '10px 24px',
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#A0AEC0',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.1em',
  padding: '10px 16px',
  cursor: 'pointer',
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
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  paddingBottom: '0',
};

const tabStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: '#4A5568',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.15em',
  padding: '8px 12px',
  cursor: 'pointer',
  transition: 'all 150ms',
};

const activeTabStyle: React.CSSProperties = {
  color: '#63B3ED',
  borderBottomColor: '#63B3ED',
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
  color: '#4A5568',
  marginBottom: '10px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
  gap: '6px',
};

const colorGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
  gap: '6px',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '2px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3px',
  cursor: 'pointer',
  transition: 'all 150ms',
  position: 'relative',
};

const colorCardStyle: React.CSSProperties = {
  ...cardStyle,
  padding: '4px',
};

const selectedCardStyle: React.CSSProperties = {
  background: 'rgba(66, 153, 225, 0.15)',
  borderColor: 'rgba(66, 153, 225, 0.5)',
  boxShadow: '0 0 12px rgba(66, 153, 225, 0.2)',
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: '7px',
  letterSpacing: '0.1em',
  color: '#A0AEC0',
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
  color: '#63B3ED',
};

const skipStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  background: 'none',
  border: 'none',
  color: '#4A5568',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.1em',
  cursor: 'pointer',
};
