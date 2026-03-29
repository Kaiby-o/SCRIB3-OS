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

export default function VirtualOffice({ onClose, onEditAvatar }: VirtualOfficeProps) {
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

    const onMoved = (data: unknown) => {
      const { x, y, direction } = data as { x: number; y: number; direction: string };
      mp.broadcastPosition(x, y, direction);
    };
    bridge.on('player:moved', onMoved);

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
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000000' }}>
      {/* Phaser canvas */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* ── Top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 960,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '48px', padding: '0 16px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(234, 242, 215, 0.08)',
      }}>
        {/* Left: close */}
        {onClose && (
          <button onClick={onClose} style={navBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#EAF2D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Exit</span>
          </button>
        )}

        {/* Center: title + online */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', color: '#EAF2D7', textTransform: 'uppercase', letterSpacing: '1px' }}>
            SCRIB3 Office
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', color: 'rgba(234, 242, 215, 0.5)',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#48BB78', boxShadow: '0 0 6px rgba(72,187,120,0.5)', flexShrink: 0 }} />
            {onlineCount + 1} online
          </span>
        </div>

        {/* Right: avatar editor */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {onEditAvatar && (
            <button onClick={onEditAvatar} style={navBtnStyle}>
              <span>Edit Avatar</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Interaction prompt ── */}
      {interactionPrompt && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(234, 242, 215, 0.1)', borderRadius: '75.641px',
          padding: '10px 24px',
          fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', color: '#EAF2D7',
          letterSpacing: '0.5px', zIndex: 950,
          animation: 'fadeInUp 200ms ease-out',
        }}>
          {interactionPrompt}
        </div>
      )}

      {/* ── Controls hint ── */}
      <div style={{
        position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
        fontFamily: "'Owners Wide', sans-serif", fontSize: '10px',
        color: 'rgba(234, 242, 215, 0.25)', letterSpacing: '1px',
        textTransform: 'uppercase', zIndex: 950,
      }}>
        WASD to move &middot; E to interact &middot; 1-5 emotes &middot; Enter for chat
      </div>

      {/* ── Chat panel ── */}
      <ChatPanel />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'rgba(234, 242, 215, 0.06)',
  border: '1px solid rgba(234, 242, 215, 0.1)',
  borderRadius: '75.641px',
  padding: '6px 14px', cursor: 'pointer',
  fontFamily: "'Owners Wide', sans-serif", fontSize: '10px',
  letterSpacing: '1px', textTransform: 'uppercase',
  color: 'rgba(234, 242, 215, 0.7)',
  transition: 'all 150ms',
};
