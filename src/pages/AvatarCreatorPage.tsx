import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';

/** Available character spritesheets — matches BootScene keys */
const CHARACTERS = [
  { key: 'char-male-01', file: 'Male 01-1.png', label: 'Male 1' },
  { key: 'char-male-02', file: 'Male 02-1.png', label: 'Male 2' },
  { key: 'char-male-03', file: 'Male 03-1.png', label: 'Male 3' },
  { key: 'char-male-04', file: 'Male 04-1.png', label: 'Male 4' },
  { key: 'char-male-05', file: 'Male 05-1.png', label: 'Male 5' },
  { key: 'char-female-01', file: 'Female 01-1.png', label: 'Female 1' },
  { key: 'char-female-02', file: 'Female 02-1.png', label: 'Female 2' },
  { key: 'char-female-03', file: 'Female 03-1.png', label: 'Female 3' },
  { key: 'char-female-04', file: 'Female 04-1.png', label: 'Female 4' },
  { key: 'char-female-05', file: 'Female 05-1.png', label: 'Female 5' },
];

/**
 * Renders an animated RPG-Maker-format spritesheet preview.
 * 96x128 sheet = 3 cols x 4 rows of 32x32 frames.
 * Row 0=down, 1=left, 2=right, 3=up.
 */
function SpritePreview({
  file,
  scale = 3,
  animate = true,
  direction = 0,
}: {
  file: string;
  scale?: number;
  animate?: boolean;
  direction?: number; // 0=down, 1=left, 2=right, 3=up
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = `/assets/office/characters/${file}`;

    let animId: number;
    let frame = 0;
    let tick = 0;

    const draw = () => {
      tick++;
      if (animate && tick % 12 === 0) {
        frame = (frame + 1) % 3;
      }

      const col = animate ? frame : 1; // middle frame when static
      const row = direction;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(
          img,
          col * 32, row * 32, 32, 32,
          0, 0, 32 * scale, 32 * scale,
        );
      }

      animId = requestAnimationFrame(draw);
    };

    img.onload = () => draw();
    if (img.complete) draw();

    return () => cancelAnimationFrame(animId);
  }, [file, scale, animate, direction]);

  return (
    <canvas
      ref={canvasRef}
      width={32 * scale}
      height={32 * scale}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  );
}

export default function AvatarCreatorPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const username = profile?.username ?? 'Player';

  // Load saved selection or default
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    const saved = profile && (profile as Record<string, unknown>).avatar_config;
    if (saved && typeof saved === 'object' && (saved as Record<string, unknown>).spriteKey) {
      return (saved as Record<string, unknown>).spriteKey as string;
    }
    return 'char-male-01';
  });

  const [saving, setSaving] = useState(false);

  const selectedChar = CHARACTERS.find(c => c.key === selectedKey) ?? CHARACTERS[0];

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = { spriteKey: selectedKey };
      await supabase
        .from('profiles')
        .update({ avatar_config: config })
        .eq('id', profile?.id ?? '');

      if (profile) {
        useAuthStore.setState({
          profile: { ...profile, avatar_config: config },
        });
      }

      navigate('/');
    } catch (err) {
      console.error('Failed to save avatar:', err);
    }
    setSaving(false);
  };

  const handleRandomize = () => {
    const idx = Math.floor(Math.random() * CHARACTERS.length);
    setSelectedKey(CHARACTERS[idx].key);
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={titleStyle}>CHARACTER SELECTION</span>
        <span style={subtitleStyle}>{username}</span>
      </div>

      {/* Main content */}
      <div style={contentStyle}>
        {/* Large preview */}
        <div style={previewColumnStyle}>
          <div style={previewFrameStyle}>
            <SpritePreview file={selectedChar.file} scale={6} animate={true} direction={0} />
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
                <SpritePreview file={selectedChar.file} scale={2.5} animate={true} direction={dir} />
                <span style={dirLabelStyle}>{label}</span>
              </div>
            ))}
          </div>

          <div style={buttonRowStyle}>
            <button onClick={handleRandomize} style={secondaryBtnStyle}>
              RANDOMIZE
            </button>
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
              {saving ? 'SAVING...' : 'SAVE & ENTER'}
            </button>
          </div>
        </div>

        {/* Character grid */}
        <div style={gridColumnStyle}>
          <div style={sectionTitleStyle}>SELECT YOUR CHARACTER</div>
          <div style={charGridStyle}>
            {CHARACTERS.map(char => (
              <button
                key={char.key}
                onClick={() => setSelectedKey(char.key)}
                style={{
                  ...charCardStyle,
                  ...(selectedKey === char.key ? selectedCardStyle : {}),
                }}
              >
                <SpritePreview file={char.file} scale={2.5} animate={selectedKey === char.key} direction={0} />
                <span style={charLabelStyle}>{char.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => navigate('/')} style={skipStyle}>
        SKIP FOR NOW →
      </button>
    </div>
  );
}

// ── Styles ──

const pageStyle: React.CSSProperties = {
  width: '100vw',
  minHeight: '100vh',
  background: '#1A1A2E',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontFamily: "'JetBrains Mono', monospace",
  color: '#E2E8F0',
  padding: '40px 20px',
  boxSizing: 'border-box',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
};

const titleStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'OwnersWide', 'JetBrains Mono', monospace",
  fontSize: '18px',
  letterSpacing: '0.3em',
  color: '#A0AEC0',
  marginBottom: '8px',
};

const subtitleStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#4A5568',
  letterSpacing: '0.15em',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  gap: '48px',
  maxWidth: '900px',
  width: '100%',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const previewColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
};

const previewFrameStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const directionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
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

const gridColumnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '320px',
  maxWidth: '460px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: '#4A5568',
  marginBottom: '16px',
};

const charGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '8px',
};

const charCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '2px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  transition: 'all 150ms',
};

const selectedCardStyle: React.CSSProperties = {
  background: 'rgba(66, 153, 225, 0.15)',
  borderColor: 'rgba(66, 153, 225, 0.5)',
  boxShadow: '0 0 12px rgba(66, 153, 225, 0.2)',
};

const charLabelStyle: React.CSSProperties = {
  fontSize: '8px',
  letterSpacing: '0.1em',
  color: '#A0AEC0',
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
