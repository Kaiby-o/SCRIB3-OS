import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { bridge } from './PhaserBridge';
import { MultiplayerSystem } from './game/systems/MultiplayerSystem';
import { useAuthStore } from '../../store/auth.store';
import { useOfficeStore } from '../../store/office.store';
import ChatPanel from './ChatPanel';

interface VirtualOfficeProps {
  bgMode: 'dark' | 'light';
  onClose?: () => void;
  onEditAvatar?: () => void;
}

export default function VirtualOffice({ bgMode, onClose, onEditAvatar }: VirtualOfficeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const multiplayerRef = useRef<MultiplayerSystem | null>(null);
  const { profile } = useAuthStore();
  const interactionPrompt = useOfficeStore((s) => s.interactionPrompt);
  const onlineCount = useOfficeStore((s) => Object.keys(s.onlineUsers).length);
  const [sceneReady, setSceneReady] = useState(false);

  // Mount Phaser game
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Pass user info to Phaser via window (read by OfficeScene)
    (window as unknown as Record<string, unknown>).__OFFICE_USER__ = {
      userId: profile?.id ?? 'local',
      username: profile?.username ?? 'Player',
      avatarConfig: profile?.avatar_config ?? undefined,
    };

    const config = createGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    bridge.on('scene:ready', () => setSceneReady(true));

    return () => {
      bridge.removeAll();
      gameRef.current?.destroy(true);
      gameRef.current = null;
      delete (window as unknown as Record<string, unknown>).__OFFICE_USER__;
    };
  }, []);

  // Connect multiplayer after scene is ready
  useEffect(() => {
    if (!sceneReady || !profile) return;

    const mp = new MultiplayerSystem(profile.id, profile.username);
    multiplayerRef.current = mp;
    mp.connect();

    // Forward position updates to multiplayer
    const onMoved = (data: unknown) => {
      const { x, y, direction } = data as { x: number; y: number; direction: string };
      mp.broadcastPosition(x, y, direction);
    };
    bridge.on('player:moved', onMoved);

    // Forward chat sends to multiplayer
    const onChat = (msg: unknown) => {
      mp.broadcastChat(msg as string);
    };
    bridge.on('chat:send', onChat);

    return () => {
      bridge.off('player:moved', onMoved);
      bridge.off('chat:send', onChat);
      mp.disconnect();
      multiplayerRef.current = null;
    };
  }, [sceneReady, profile]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Phaser canvas container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          background: bgMode === 'dark' ? '#1A1A2E' : '#E8E0E0',
        }}
      />

      {/* Right-side vertical toolbar */}
      <div style={toolbarStyle}>
        {onClose && (
          <button
            onClick={onClose}
            style={toolbarBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            &larr; DEVICE
          </button>
        )}

        <div style={onlineBoxStyle}>
          <span style={dotStyle} />
          {onlineCount + 1} ONLINE
        </div>

        {onEditAvatar && (
          <button
            onClick={onEditAvatar}
            style={toolbarBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            EDIT AVATAR
          </button>
        )}

        {/* Chat toggle / panel injected here via ChatPanel's fixed positioning */}
      </div>

      {/* Interaction prompt */}
      {interactionPrompt && (
        <div style={promptStyle}>
          {interactionPrompt}
        </div>
      )}

      {/* Controls hint - bottom left */}
      <div style={controlsStyle}>
        WASD / ARROWS to move &middot; E to interact &middot; ENTER for chat
      </div>

      {/* Chat panel */}
      <ChatPanel />
    </div>
  );
}

/* ── Right-side vertical toolbar ── */
const TOOLBAR_WIDTH = '160px';

const toolbarStyle: React.CSSProperties = {
  position: 'fixed',
  top: '140px',           // Below minimap (minimap is ~120px + 10px margin)
  right: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: TOOLBAR_WIDTH,
  zIndex: 960,
};

const toolbarBtnStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(26, 26, 46, 0.85)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '4px',
  color: '#A0AEC0',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.12em',
  padding: '10px 12px',
  cursor: 'pointer',
  opacity: 0.7,
  transition: 'opacity 200ms',
  textAlign: 'center' as const,
};

const onlineBoxStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: 'rgba(26, 26, 46, 0.85)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '4px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.12em',
  color: '#A0AEC0',
  padding: '10px 12px',
  boxSizing: 'border-box' as const,
};

const dotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#48BB78',
  boxShadow: '0 0 6px rgba(72, 187, 120, 0.6)',
  flexShrink: 0,
};

const promptStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '60px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(26, 26, 46, 0.9)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '6px',
  padding: '10px 20px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
  color: '#E2E8F0',
  letterSpacing: '0.1em',
  zIndex: 950,
};

const controlsStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '9px',
  color: '#4A5568',
  letterSpacing: '0.1em',
  zIndex: 950,
};
