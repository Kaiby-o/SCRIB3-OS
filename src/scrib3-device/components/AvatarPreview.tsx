import { useRef, useEffect } from 'react';
import type { LegacyAvatarConfig } from './virtual-office/game/systems/AvatarConfig';
import { generateAvatarCanvas } from './virtual-office/game/systems/AvatarGenerator';

interface AvatarPreviewProps {
  userId: string;
  username: string;
  config: LegacyAvatarConfig;
  scale?: number;
  animate?: boolean;
}

/**
 * Renders a scaled, optionally animated pixel-art avatar preview.
 * Shows the front-facing direction at the given scale.
 * If animate=true, cycles through all 4 directions with an idle bob.
 */
export default function AvatarPreview({
  userId,
  username,
  config,
  scale = 4,
  animate = true,
}: AvatarPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const spritesheet = generateAvatarCanvas(userId, username, config);
    const directions = [0, 1, 0, 2, 0, 3]; // front, left, front, right, front, back
    let animId: number;

    const draw = () => {
      tickRef.current++;

      // Change direction every 60 frames (~1s at 60fps)
      if (animate && tickRef.current % 60 === 0) {
        frameRef.current = (frameRef.current + 1) % directions.length;
      }

      const dir = animate ? directions[frameRef.current] : 0;
      const bobY = animate ? Math.sin(tickRef.current * 0.08) * 1.5 : 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw scaled sprite
      ctx.drawImage(
        spritesheet,
        dir * 32, 0, 32, 32,          // Source
        0, bobY * scale, 32 * scale, 32 * scale, // Dest
      );

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [userId, username, config, scale, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={32 * scale}
      height={32 * scale + 8}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  );
}
