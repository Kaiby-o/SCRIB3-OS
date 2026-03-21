import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';
import AvatarPreview from '../components/AvatarPreview';
import {
  type AvatarConfig,
  type HairStyle,
  type EyeStyle,
  type OutfitStyle,
  type Accessory,
  type PantsStyle,
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  PANTS_COLORS,
  HAIR_STYLES,
  EYE_STYLES,
  OUTFIT_STYLES,
  ACCESSORIES,
  PANTS_STYLES,
  seededAvatarConfig,
} from '../components/virtual-office/game/systems/AvatarConfig';

type Tab = 'skin' | 'hair' | 'eyes' | 'outfit' | 'pants' | 'accessory';

const TABS: { key: Tab; label: string }[] = [
  { key: 'skin', label: 'SKIN' },
  { key: 'hair', label: 'HAIR' },
  { key: 'eyes', label: 'EYES' },
  { key: 'outfit', label: 'OUTFIT' },
  { key: 'pants', label: 'PANTS' },
  { key: 'accessory', label: 'ACC' },
];

export default function AvatarCreatorPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const userId = profile?.id ?? 'local';
  const username = profile?.username ?? 'Player';

  const [config, setConfig] = useState<AvatarConfig>(() => {
    const saved = profile && (profile as Record<string, unknown>).avatar_config;
    if (saved && typeof saved === 'object') return saved as AvatarConfig;
    return seededAvatarConfig(userId);
  });

  const [activeTab, setActiveTab] = useState<Tab>('skin');
  const [saving, setSaving] = useState(false);

  const update = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ avatar_config: config })
        .eq('id', userId);
      navigate('/');
    } catch (err) {
      console.error('Failed to save avatar:', err);
    }
    setSaving(false);
  };

  const handleRandomize = () => {
    const randomId = Math.random().toString(36).slice(2);
    setConfig(seededAvatarConfig(randomId));
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={titleStyle}>CHARACTER CREATION</span>
        <span style={subtitleStyle}>{username}</span>
      </div>

      {/* Main content area */}
      <div style={contentStyle}>
        {/* Preview column */}
        <div style={previewColumnStyle}>
          <div style={previewFrameStyle}>
            <AvatarPreview
              userId={userId}
              username={username}
              config={config}
              scale={6}
              animate={true}
            />
          </div>

          {/* Direction previews */}
          <div style={directionRowStyle}>
            {['FRONT', 'LEFT', 'RIGHT', 'BACK'].map((label, i) => (
              <div key={label} style={dirPreviewStyle}>
                <AvatarPreview
                  userId={userId}
                  username={username}
                  config={config}
                  scale={2}
                  animate={false}
                />
                <span style={dirLabelStyle}>{label}</span>
              </div>
            ))}
          </div>

          <div style={buttonRowStyle}>
            <button onClick={handleRandomize} style={secondaryBtnStyle}>
              RANDOMIZE
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={primaryBtnStyle}
            >
              {saving ? 'SAVING...' : 'SAVE & ENTER'}
            </button>
          </div>
        </div>

        {/* Customization column */}
        <div style={customizeColumnStyle}>
          {/* Tabs */}
          <div style={tabRowStyle}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...tabStyle,
                  ...(activeTab === tab.key ? activeTabStyle : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={tabContentStyle}>
            {activeTab === 'skin' && (
              <Section title="SKIN TONE">
                <ColorGrid
                  colors={SKIN_TONES}
                  selected={SKIN_TONES[config.skinTone]}
                  onSelect={(_, i) => update('skinTone', i)}
                  size={36}
                />
              </Section>
            )}

            {activeTab === 'hair' && (
              <>
                <Section title="STYLE">
                  <OptionGrid
                    options={HAIR_STYLES}
                    selected={config.hairStyle}
                    onSelect={(key) => update('hairStyle', key as HairStyle)}
                  />
                </Section>
                <Section title="COLOR">
                  <ColorGrid
                    colors={HAIR_COLORS}
                    selected={config.hairColor}
                    onSelect={(c) => update('hairColor', c)}
                  />
                </Section>
              </>
            )}

            {activeTab === 'eyes' && (
              <Section title="EYE STYLE">
                <OptionGrid
                  options={EYE_STYLES}
                  selected={config.eyeStyle}
                  onSelect={(key) => update('eyeStyle', key as EyeStyle)}
                />
              </Section>
            )}

            {activeTab === 'outfit' && (
              <>
                <Section title="STYLE">
                  <OptionGrid
                    options={OUTFIT_STYLES}
                    selected={config.outfitStyle}
                    onSelect={(key) => update('outfitStyle', key as OutfitStyle)}
                  />
                </Section>
                <Section title="COLOR">
                  <ColorGrid
                    colors={OUTFIT_COLORS}
                    selected={config.outfitColor}
                    onSelect={(c) => update('outfitColor', c)}
                  />
                </Section>
              </>
            )}

            {activeTab === 'pants' && (
              <>
                <Section title="STYLE">
                  <OptionGrid
                    options={PANTS_STYLES}
                    selected={config.pantsStyle}
                    onSelect={(key) => update('pantsStyle', key as PantsStyle)}
                  />
                </Section>
                <Section title="COLOR">
                  <ColorGrid
                    colors={PANTS_COLORS}
                    selected={config.pantsColor}
                    onSelect={(c) => update('pantsColor', c)}
                  />
                </Section>
              </>
            )}

            {activeTab === 'accessory' && (
              <Section title="ACCESSORY">
                <OptionGrid
                  options={ACCESSORIES}
                  selected={config.accessory}
                  onSelect={(key) => update('accessory', key as Accessory)}
                />
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Skip link */}
      <button onClick={() => navigate('/')} style={skipStyle}>
        SKIP FOR NOW →
      </button>
    </div>
  );
}

// ── Sub-components ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={sectionTitleStyle}>{title}</div>
      {children}
    </div>
  );
}

function ColorGrid({
  colors,
  selected,
  onSelect,
  size = 28,
}: {
  colors: string[];
  selected: string;
  onSelect: (color: string, index: number) => void;
  size?: number;
}) {
  return (
    <div style={gridStyle}>
      {colors.map((color, i) => (
        <button
          key={color}
          onClick={() => onSelect(color, i)}
          style={{
            width: size,
            height: size,
            background: color,
            border: selected === color ? '2px solid #FFF' : '2px solid transparent',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: selected === color ? '1px solid rgba(255,255,255,0.3)' : 'none',
            outlineOffset: '2px',
            transition: 'border 150ms',
          }}
        />
      ))}
    </div>
  );
}

function OptionGrid({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div style={gridStyle}>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          style={{
            ...optionBtnStyle,
            ...(selected === opt.key ? selectedOptionStyle : {}),
          }}
        >
          {opt.label}
        </button>
      ))}
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
  transition: 'background 200ms',
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

const customizeColumnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '320px',
  maxWidth: '460px',
};

const tabRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  marginBottom: '20px',
  flexWrap: 'wrap',
};

const tabStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '4px',
  color: '#4A5568',
  fontFamily: "'OwnersWide', 'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.15em',
  padding: '8px 14px',
  cursor: 'pointer',
  transition: 'all 150ms',
};

const activeTabStyle: React.CSSProperties = {
  background: 'rgba(66, 153, 225, 0.15)',
  borderColor: 'rgba(66, 153, 225, 0.4)',
  color: '#63B3ED',
};

const tabContentStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '8px',
  padding: '20px',
  minHeight: '300px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '9px',
  letterSpacing: '0.2em',
  color: '#4A5568',
  marginBottom: '10px',
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const optionBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  color: '#A0AEC0',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  padding: '6px 12px',
  cursor: 'pointer',
  transition: 'all 150ms',
};

const selectedOptionStyle: React.CSSProperties = {
  background: 'rgba(66, 153, 225, 0.2)',
  borderColor: 'rgba(66, 153, 225, 0.5)',
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
  transition: 'color 200ms',
};
