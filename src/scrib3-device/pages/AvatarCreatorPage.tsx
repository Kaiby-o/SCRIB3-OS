import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────
interface VariantEntry { id: string; file: string; colorIndex: number }
interface StyleEntry { style: number; label?: string; name?: string; variants: VariantEntry[] }
interface SimpleEntry { id: string; file: string; label: string }
interface Manifest {
  bodies: SimpleEntry[];
  eyes: SimpleEntry[];
  outfits: StyleEntry[];
  hairstyles: StyleEntry[];
  accessories: StyleEntry[];
}

interface Selections {
  body: string;
  eyes: string;
  outfitStyle: number;
  outfitColor: number;
  hairStyle: number;
  hairColor: number;
  accessories: { style: number; color: number }[];
}

// ─── Constants ─────────────────────────────────────────────────────
const LAYER_BASE = '/assets/office/character-layers/';
const FRAME = 32;

// Spritesheet layout (Modern Interiors LimeZu pack):
// Row 0, col 0 = front idle, col 1 = right idle, col 2 = back idle, col 3 = left idle

// ─── Image cache ───────────────────────────────────────────────────
const cache = new Map<string, HTMLImageElement>();

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function getImg(file: string): Promise<HTMLImageElement> {
  if (cache.has(file)) return cache.get(file)!;
  const img = await loadImg(LAYER_BASE + file);
  cache.set(file, img);
  return img;
}

// ─── Manifest helpers ──────────────────────────────────────────────
function findFile(m: Manifest, id: string): string | null {
  for (const b of m.bodies) if (b.id === id) return b.file;
  for (const e of m.eyes) if (e.id === id) return e.file;
  for (const o of m.outfits) for (const v of o.variants) if (v.id === id) return v.file;
  for (const h of m.hairstyles) for (const v of h.variants) if (v.id === id) return v.file;
  for (const a of m.accessories) for (const v of a.variants) if (v.id === id) return v.file;
  return null;
}

function variantId(styles: StyleEntry[], style: number, color: number): string {
  const s = styles.find(x => x.style === style);
  return s?.variants.find(v => v.colorIndex === color)?.id ?? '';
}

function layerFiles(m: Manifest, sel: Selections): string[] {
  const out: string[] = [];
  const add = (id: string) => { const f = findFile(m, id); if (f) out.push(f); };
  add(sel.body);
  add(sel.eyes);
  add(variantId(m.outfits, sel.outfitStyle, sel.outfitColor));
  add(variantId(m.hairstyles, sel.hairStyle, sel.hairColor));
  for (const a of sel.accessories) add(variantId(m.accessories, a.style, a.color));
  return out;
}

// ─── Canvas compositing ────────────────────────────────────────────
async function compositeFrame(
  canvas: HTMLCanvasElement, files: string[],
  srcCol: number, srcRow: number, scale: number,
) {
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const f of files) {
    try {
      const img = await getImg(f);
      ctx.drawImage(img, srcCol * FRAME, srcRow * FRAME, FRAME, FRAME, 0, 0, FRAME * scale, FRAME * scale);
    } catch { /* skip broken layers */ }
  }
}

async function buildWalkSheet(m: Manifest, sel: Selections): Promise<HTMLCanvasElement> {
  const files = layerFiles(m, sel);
  const imgs: HTMLImageElement[] = [];
  for (const f of files) { try { imgs.push(await getImg(f)); } catch { /* skip */ } }

  const c = document.createElement('canvas');
  c.width = 96; c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // Row 0 of source: col0=front, col1=right, col2=back, col3=left
  // Target: row0=down, row1=left, row2=right, row3=up
  const srcCols = [0, 3, 1, 2]; // front, left, right, back
  for (let r = 0; r < 4; r++) {
    for (let c2 = 0; c2 < 3; c2++) {
      for (const img of imgs) {
        ctx.drawImage(img, srcCols[r] * FRAME, 0, FRAME, FRAME, c2 * FRAME, r * FRAME, FRAME, FRAME);
      }
    }
  }
  return c;
}

// ─── Preview Components ────────────────────────────────────────────
function Preview({ files, scale }: { files: string[]; scale: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Use a string key so React detects file list changes
  const key = files.join('|');

  useEffect(() => {
    if (ref.current) compositeFrame(ref.current, files, 0, 0, scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, scale]);

  return <canvas ref={ref} width={FRAME * scale} height={FRAME * scale} style={{ imageRendering: 'pixelated' }} />;
}

function Thumb({ files }: { files: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = files.join('|');
  useEffect(() => {
    if (ref.current) compositeFrame(ref.current, files, 0, 0, 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <canvas ref={ref} width={64} height={64} style={{ imageRendering: 'pixelated' }} />;
}

// ─── Parse saved config ────────────────────────────────────────────
function pStyle(id: string | undefined, pfx: string): number {
  if (!id) return 0;
  const m = id.match(new RegExp(`^${pfx}-(\\d+)-(\\d+)$`));
  return m ? parseInt(m[1]) : 0;
}
function pColor(id: string | undefined): number {
  if (!id) return 0;
  const m = id.match(/-(\d+)$/);
  return m ? parseInt(m[1]) : 0;
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
export default function AvatarCreatorPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [tab, setTab] = useState('BODY');
  const [saving, setSaving] = useState(false);
  const [sel, setSel] = useState<Selections>({
    body: 'body-01', eyes: 'eyes-01', outfitStyle: 1, outfitColor: 1,
    hairStyle: 1, hairColor: 1, accessories: [],
  });

  useEffect(() => {
    fetch(LAYER_BASE + 'manifest.json').then(r => r.json()).then((m: Manifest) => {
      setManifest(m);
      const s = profile?.avatar_config as Record<string, unknown> | null;
      if (s?.body && typeof s.body === 'string') {
        setSel({
          body: s.body as string, eyes: (s.eyes as string) || 'eyes-01',
          outfitStyle: pStyle(s.outfit as string, 'outfit') || 1,
          outfitColor: pColor(s.outfit as string) || 1,
          hairStyle: pStyle(s.hairstyle as string, 'hair') || 1,
          hairColor: pColor(s.hairstyle as string) || 1,
          accessories: Array.isArray(s.accessories)
            ? (s.accessories as string[]).map(id => ({ style: pStyle(id, 'acc') || 1, color: pColor(id) || 1 }))
            : [],
        });
      }
    }).catch(console.error);
  }, [profile]);

  const save = async () => {
    if (!manifest) return;
    setSaving(true);
    try {
      const sheet = await buildWalkSheet(manifest, sel);
      const cfg = {
        body: sel.body, eyes: sel.eyes,
        outfit: variantId(manifest.outfits, sel.outfitStyle, sel.outfitColor),
        hairstyle: variantId(manifest.hairstyles, sel.hairStyle, sel.hairColor),
        accessories: sel.accessories.map(a => variantId(manifest.accessories, a.style, a.color)),
        compositedSheet: sheet.toDataURL('image/png'),
      };
      if (profile?.id) await supabase.from('profiles').update({ avatar_config: cfg }).eq('id', profile.id);
      if (profile) useAuthStore.setState({ profile: { ...profile, avatar_config: cfg as never } });
    } catch (e) { console.error('Save failed:', e); }
    window.location.href = '/office';
  };

  const randomize = () => {
    if (!manifest) return;
    const ri = (n: number) => Math.floor(Math.random() * n);
    const rs = (a: StyleEntry[]) => { const s = a[ri(a.length)]; return { style: s.style, color: s.variants[ri(s.variants.length)].colorIndex }; };
    const o = rs(manifest.outfits), h = rs(manifest.hairstyles);
    setSel({ body: manifest.bodies[ri(manifest.bodies.length)].id, eyes: manifest.eyes[ri(manifest.eyes.length)].id,
      outfitStyle: o.style, outfitColor: o.color, hairStyle: h.style, hairColor: h.color, accessories: [] });
  };

  if (!manifest) return <div style={S.page}><span style={{ color: '#555' }}>Loading...</span></div>;

  const files = layerFiles(manifest, sel);
  const bf = findFile(manifest, sel.body) || '';

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate('/office')} style={S.backBtn}>&larr; Back</button>
        <span style={S.title}>Character Creator</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={S.layout}>
        {/* Preview */}
        <div style={S.previewCol}>
          <div style={S.previewBox}>
            <Preview files={files} scale={4} />
          </div>
          <span style={S.name}>{profile?.username ?? 'Player'}</span>
          <div style={S.btnRow}>
            <button onClick={randomize} style={S.btn2}>Randomize</button>
            <button onClick={save} disabled={saving} style={S.btn1}>{saving ? 'Saving...' : 'Save & Enter'}</button>
          </div>
        </div>

        {/* Panel */}
        <div style={S.panel}>
          <div style={S.tabBar}>
            {['BODY','EYES','OUTFIT','HAIR','ACC'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabOn : {}) }}>{t}</button>
            ))}
          </div>
          <div style={S.content}>
            {tab === 'BODY' && <Grid>{manifest.bodies.map(b =>
              <Card key={b.id} on={sel.body === b.id} click={() => setSel(s => ({ ...s, body: b.id }))}>
                <Thumb files={[b.file]} /><L>{b.label}</L>
              </Card>
            )}</Grid>}

            {tab === 'EYES' && <Grid>{manifest.eyes.map(e =>
              <Card key={e.id} on={sel.eyes === e.id} click={() => setSel(s => ({ ...s, eyes: e.id }))}>
                <Thumb files={bf ? [bf, e.file] : [e.file]} /><L>{e.label}</L>
              </Card>
            )}</Grid>}

            {tab === 'OUTFIT' && <OutfitPanel manifest={manifest} sel={sel} setSel={setSel} bf={bf} />}
            {tab === 'HAIR' && <HairPanel manifest={manifest} sel={sel} setSel={setSel} bf={bf} />}
            {tab === 'ACC' && <AccPanel manifest={manifest} sel={sel} setSel={setSel} bf={bf} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab panels ────────────────────────────────────────────────────
function OutfitPanel({ manifest, sel, setSel, bf }: { manifest: Manifest; sel: Selections; setSel: React.Dispatch<React.SetStateAction<Selections>>; bf: string }) {
  const cur = manifest.outfits.find(o => o.style === sel.outfitStyle);
  return <>
    <Lbl>Style</Lbl>
    <Grid>{manifest.outfits.map(o =>
      <Card key={o.style} on={sel.outfitStyle === o.style}
        click={() => setSel(s => ({ ...s, outfitStyle: o.style, outfitColor: o.variants[0]?.colorIndex || 1 }))}>
        <Thumb files={bf ? [bf, o.variants[0]?.file || ''] : [o.variants[0]?.file || '']} />
        <L>{o.label}</L>
      </Card>
    )}</Grid>
    {cur && cur.variants.length > 1 && <>
      <Lbl>Color</Lbl>
      <Grid>{cur.variants.map(v =>
        <Card key={v.id} on={sel.outfitColor === v.colorIndex}
          click={() => setSel(s => ({ ...s, outfitColor: v.colorIndex }))}>
          <Thumb files={bf ? [bf, v.file] : [v.file]} /><L>{v.colorIndex}</L>
        </Card>
      )}</Grid>
    </>}
  </>;
}

function HairPanel({ manifest, sel, setSel, bf }: { manifest: Manifest; sel: Selections; setSel: React.Dispatch<React.SetStateAction<Selections>>; bf: string }) {
  const of2 = findFile(manifest, variantId(manifest.outfits, sel.outfitStyle, sel.outfitColor)) || '';
  const base = [bf, of2].filter(Boolean);
  const cur = manifest.hairstyles.find(h => h.style === sel.hairStyle);
  return <>
    <Lbl>Style</Lbl>
    <Grid>{manifest.hairstyles.map(h =>
      <Card key={h.style} on={sel.hairStyle === h.style}
        click={() => setSel(s => ({ ...s, hairStyle: h.style, hairColor: h.variants[0]?.colorIndex || 1 }))}>
        <Thumb files={[...base, h.variants[0]?.file || '']} /><L>{h.label}</L>
      </Card>
    )}</Grid>
    {cur && cur.variants.length > 1 && <>
      <Lbl>Color</Lbl>
      <Grid>{cur.variants.map(v =>
        <Card key={v.id} on={sel.hairColor === v.colorIndex}
          click={() => setSel(s => ({ ...s, hairColor: v.colorIndex }))}>
          <Thumb files={[...base, v.file]} /><L>{v.colorIndex}</L>
        </Card>
      )}</Grid>
    </>}
  </>;
}

function AccPanel({ manifest, sel, setSel, bf }: { manifest: Manifest; sel: Selections; setSel: React.Dispatch<React.SetStateAction<Selections>>; bf: string }) {
  const of2 = findFile(manifest, variantId(manifest.outfits, sel.outfitStyle, sel.outfitColor)) || '';
  const hf = findFile(manifest, variantId(manifest.hairstyles, sel.hairStyle, sel.hairColor)) || '';
  const ef = findFile(manifest, sel.eyes) || '';
  const base = [bf, of2, hf, ef].filter(Boolean);
  const has = (s: number) => sel.accessories.some(a => a.style === s);
  return <>
    <Lbl>Toggle</Lbl>
    <Grid>{manifest.accessories.map(a =>
      <Card key={a.style} on={has(a.style)} click={() => setSel(s => {
        if (s.accessories.some(x => x.style === a.style))
          return { ...s, accessories: s.accessories.filter(x => x.style !== a.style) };
        return { ...s, accessories: [...s.accessories, { style: a.style, color: a.variants[0]?.colorIndex || 1 }] };
      })}>
        <Thumb files={[...base, a.variants[0]?.file || '']} /><L>{a.name}</L>
      </Card>
    )}</Grid>
  </>;
}

// ─── Tiny helpers ──────────────────────────────────────────────────
function Grid({ children }: { children: React.ReactNode }) { return <div style={S.grid}>{children}</div>; }
function Card({ children, on, click }: { children: React.ReactNode; on: boolean; click: () => void }) {
  return <button onClick={click} style={{ ...S.card, borderColor: on ? '#D7ABC5' : 'rgba(255,255,255,0.06)', background: on ? 'rgba(215,171,197,0.1)' : 'rgba(255,255,255,0.02)' }}>{children}</button>;
}
function L({ children }: { children: React.ReactNode }) { return <span style={S.cardL}>{children}</span>; }
function Lbl({ children }: { children: React.ReactNode }) { return <div style={S.lbl}>{children}</div>; }

// ─── Styles ────────────────────────────────────────────────────────
const S = {
  page: { width: '100vw', minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', fontFamily: "'Owners Wide', sans-serif", color: '#EAF2D7' },
  header: { width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box' as const },
  backBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, color: '#EAF2D7', fontSize: 11, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  title: { fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: 15, textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  layout: { display: 'flex', gap: 36, padding: '20px', maxWidth: 960, width: '100%', flexWrap: 'wrap' as const, justifyContent: 'center' },
  previewCol: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 },
  previewBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 },
  name: { fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: 11, textTransform: 'uppercase' as const, opacity: 0.35, letterSpacing: '0.1em' } as React.CSSProperties,
  btnRow: { display: 'flex', gap: 8, marginTop: 4 },
  btn1: { background: '#D7ABC5', border: 'none', borderRadius: 999, color: '#000', fontSize: 11, fontWeight: 600, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  btn2: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, color: '#EAF2D7', fontSize: 10, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  panel: { flex: 1, minWidth: 320, maxWidth: 520, display: 'flex', flexDirection: 'column' as const },
  tabBar: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 12 },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'rgba(234,242,215,0.3)', fontSize: 10, letterSpacing: '0.1em', padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' as const } as React.CSSProperties,
  tabOn: { color: '#D7ABC5', borderBottomColor: '#D7ABC5' },
  content: { flex: 1, overflowY: 'auto' as const, maxHeight: 'calc(100vh - 180px)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 6, marginBottom: 14 },
  card: { border: '2px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 5, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s' } as React.CSSProperties,
  cardL: { fontSize: 8, opacity: 0.4, letterSpacing: '0.05em', textTransform: 'uppercase' as const, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '100%' } as React.CSSProperties,
  lbl: { fontSize: 9, letterSpacing: '0.12em', opacity: 0.35, marginBottom: 6, textTransform: 'uppercase' as const, fontWeight: 600 } as React.CSSProperties,
};
