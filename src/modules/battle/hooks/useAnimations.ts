// ===== Battle Animations Hook =====
// All animations use Web Animations API and return Promises

import { useCallback, useRef } from 'react';

export function useAnimations() {
  const playerRef = useRef<HTMLDivElement>(null);
  const opponentRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const playIdle = useCallback((side: 'player' | 'opponent') => {
    const el = side === 'player' ? playerRef.current : opponentRef.current;
    if (!el) return;
    el.animate(
      [{ transform: 'translateY(0px)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0px)' }],
      { duration: 1800, iterations: Infinity, easing: 'ease-in-out' }
    );
  }, []);

  const playAttack = useCallback(async (side: 'player' | 'opponent') => {
    const el = side === 'player' ? playerRef.current : opponentRef.current;
    if (!el) return;
    const dir = side === 'player' ? 80 : -80;
    await el.animate(
      [{ transform: 'translateX(0px)' }, { transform: `translateX(${dir}px)` }, { transform: 'translateX(0px)' }],
      { duration: 400, easing: 'ease-out' }
    ).finished;
  }, []);

  const playHit = useCallback(async (side: 'player' | 'opponent') => {
    const el = side === 'player' ? playerRef.current : opponentRef.current;
    if (!el) return;
    await el.animate(
      [
        { filter: 'brightness(1)', opacity: 1 }, { filter: 'brightness(3)', opacity: 0 },
        { filter: 'brightness(1)', opacity: 1 }, { filter: 'brightness(3)', opacity: 0 },
        { filter: 'brightness(1)', opacity: 1 },
      ],
      { duration: 300 }
    ).finished;
  }, []);

  const playFaint = useCallback(async (side: 'player' | 'opponent') => {
    const el = side === 'player' ? playerRef.current : opponentRef.current;
    if (!el) return;
    await el.animate(
      [{ transform: 'translateY(0px)', opacity: 1 }, { transform: 'translateY(60px)', opacity: 0 }],
      { duration: 700, fill: 'forwards', easing: 'ease-in' }
    ).finished;
  }, []);

  const playScreenFlash = useCallback(async (color: string = '#D7ABC5') => {
    const el = screenRef.current;
    if (!el) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:absolute;inset:0;background:${color};opacity:0;pointer-events:none;z-index:100;`;
    el.appendChild(overlay);
    await overlay.animate(
      [{ opacity: 0 }, { opacity: 0.6 }, { opacity: 0 }],
      { duration: 200 }
    ).finished;
    overlay.remove();
  }, []);

  const playEnter = useCallback(async (side: 'player' | 'opponent') => {
    const el = side === 'player' ? playerRef.current : opponentRef.current;
    if (!el) return;
    const from = side === 'player' ? -200 : 200;
    await el.animate(
      [{ transform: `translateX(${from}px)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
      { duration: 500, easing: 'ease-out', fill: 'forwards' }
    ).finished;
  }, []);

  return { playerRef, opponentRef, screenRef, playIdle, playAttack, playHit, playFaint, playScreenFlash, playEnter };
}

// Status visual filters applied directly to sprite style
export const STATUS_FILTERS: Record<string, string> = {
  burn:       'hue-rotate(20deg) saturate(2) brightness(1.1)',
  sleep:      'grayscale(0.7) brightness(0.7)',
  paralysis:  'hue-rotate(50deg) saturate(1.5)',
  confusion:  'hue-rotate(280deg) saturate(1.3)',
  silenced:   'grayscale(0.4) brightness(0.85)',
  in_embargo: 'brightness(0.6) contrast(1.2)',
};
