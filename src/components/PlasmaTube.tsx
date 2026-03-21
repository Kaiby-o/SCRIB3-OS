import { useEffect, useRef } from 'react';

const W = 42;
const H = 165;

function drawLightning(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  depth: number,
  dark: boolean,
  blur: number,
) {
  if (depth === 0) {
    ctx.shadowBlur = blur;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const offset = (Math.random() * 2 - 1) * dist * 0.35;
  const nx = mx + offset;

  ctx.lineWidth = depth * 0.6 + 0.4;

  if (depth > 2) {
    ctx.strokeStyle = dark ? 'rgba(255,240,248,1.0)' : 'rgba(255,240,248,0.61)';
  } else {
    ctx.strokeStyle = dark ? 'rgba(215,171,197,1.0)' : 'rgba(215,171,197,0.54)';
  }

  drawLightning(ctx, x1, y1, nx, my, depth - 1, dark, blur);
  drawLightning(ctx, nx, my, x2, y2, depth - 1, dark, blur);

  // Branch — uses shadowBlur 12
  if (Math.random() < 0.4) {
    const angle = (Math.random() * 30 + 25) * (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 180);
    const len = dist * 0.45;
    const bx = nx + Math.sin(angle) * len;
    const by = my - Math.cos(angle) * len;
    drawLightning(ctx, nx, my, bx, by, depth - 1, dark, 12);
  }
}

export default function PlasmaTube({ bgMode }: { bgMode: 'dark' | 'light' }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const lastRef     = useRef<number>(0);
  const intervalRef = useRef<number>(200 + Math.random() * 100);

  const boltRef = useRef<{ x1: number; y1: number; x2: number; y2: number; depth: number; primary: boolean }[]>([]);

  const regen = () => {
    boltRef.current = [
      { x1: W / 2, y1: H - 4, x2: W / 2, y2: 4, depth: 5, primary: true },
      {
        x1: W / 2 + (Math.random() * 8 - 4),
        y1: H * (0.7 + Math.random() * 0.1),
        x2: W / 2 + (Math.random() * 8 - 4),
        y2: H * (0.02 + Math.random() * 0.06),
        depth: 4,
        primary: false,
      },
    ];
    intervalRef.current = 200 + Math.random() * 100;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Offscreen canvas for bloom pass
    const offscreen = document.createElement('canvas');
    offscreen.width  = W;
    offscreen.height = H;
    const octx = offscreen.getContext('2d')!;

    regen();

    const dark = bgMode === 'dark';

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);

      if (now - lastRef.current >= intervalRef.current) {
        regen();
        lastRef.current = now;
      }

      ctx.clearRect(0, 0, W, H);

      // Background glow
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   dark ? 'rgba(215,171,197,0.13)' : 'rgba(215,171,197,0.05)');
      grad.addColorStop(0.5, dark ? 'rgba(215,171,197,0.29)' : 'rgba(215,171,197,0.11)');
      grad.addColorStop(1,   dark ? 'rgba(215,171,197,0.13)' : 'rgba(215,171,197,0.05)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (dark) {
        ctx.shadowColor = '#D7ABC5';
      }

      // Draw primary bolt to offscreen canvas for bloom reuse
      const primary = boltRef.current.find(b => b.primary);
      if (primary) {
        octx.clearRect(0, 0, W, H);
        if (dark) {
          octx.shadowColor = '#D7ABC5';
          octx.shadowBlur  = 20;
        } else {
          octx.shadowBlur = 0;
        }
        drawLightning(octx, primary.x1, primary.y1, primary.x2, primary.y2, primary.depth, dark, 20);
        octx.shadowBlur = 0;

        // Normal pass — primary bolt
        ctx.drawImage(offscreen, 0, 0);

        // Bloom pass — redraw primary at 30% opacity with 'lighter' blend
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.3;
        ctx.drawImage(offscreen, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw secondary tendril directly
      const secondary = boltRef.current.find(b => !b.primary);
      if (secondary) {
        if (dark) ctx.shadowBlur = 12;
        drawLightning(ctx, secondary.x1, secondary.y1, secondary.x2, secondary.y2, secondary.depth, dark, 12);
      }

      ctx.shadowBlur = 0;

      // Soft edge fade — erase edges with destination-out gradients
      ctx.globalCompositeOperation = 'destination-out';
      const fadeH = H * 0.18;
      const fadeW = W * 0.18;

      const topFade = ctx.createLinearGradient(0, 0, 0, fadeH);
      topFade.addColorStop(0, 'rgba(0,0,0,1)');
      topFade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, W, fadeH);

      const botFade = ctx.createLinearGradient(0, H - fadeH, 0, H);
      botFade.addColorStop(0, 'rgba(0,0,0,0)');
      botFade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = botFade;
      ctx.fillRect(0, H - fadeH, W, fadeH);

      const leftFade = ctx.createLinearGradient(0, 0, fadeW, 0);
      leftFade.addColorStop(0, 'rgba(0,0,0,1)');
      leftFade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = leftFade;
      ctx.fillRect(0, 0, fadeW, H);

      const rightFade = ctx.createLinearGradient(W - fadeW, 0, W, 0);
      rightFade.addColorStop(0, 'rgba(0,0,0,0)');
      rightFade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = rightFade;
      ctx.fillRect(W - fadeW, 0, fadeW, H);

      ctx.globalCompositeOperation = 'source-over';
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bgMode]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        position:      'absolute',
        width:         '42px',
        height:        '165px',
        right:         '90px',
        top:           '180px',
        zIndex:        2,
        pointerEvents: 'none',
        borderRadius:  '9px',
      }}
    />
  );
}
