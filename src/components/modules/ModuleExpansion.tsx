import { useEffect, useRef } from 'react';
import React from 'react';
import { useModulesStore } from '../../store/modules.store';

interface ModuleExpansionProps {
  moduleId: string;
  direction: 'left' | 'right';
  zIndex?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const EASING_EMERGE = 'cubic-bezier(0.25, 0.0, 0.1, 1.0)';
const EASING_SEAT = 'cubic-bezier(0.0, 0.0, 0.2, 1.4)';

async function modulePowerOn(moduleEl: HTMLElement) {
  const screen = moduleEl.querySelector('.module-screen') as HTMLElement | null;
  if (!screen) return;
  screen.animate([
    { clipPath: 'inset(50% 0 50% 0)', opacity: '0.3', filter: 'brightness(2)' },
    { clipPath: 'inset(30% 0 30% 0)', opacity: '0.7', filter: 'brightness(1.5)', offset: 0.3 },
    { clipPath: 'inset(0% 0 0% 0)', opacity: '1', filter: 'brightness(1)' }
  ], {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  });
  await new Promise(r => setTimeout(r, 250));
}

export default function ModuleExpansion({
  moduleId,
  direction,
  zIndex = 80,
  children,
  style,
  className = ''
}: ModuleExpansionProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isActive = useModulesStore(s => s.activeModules.includes(moduleId));
  const prevActiveRef = useRef(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (isActive && !prevActiveRef.current) {
      // Emerge sequence
      const dockedX = direction === 'left' ? 'translateX(calc(100% - 8px))' : 'translateX(calc(-100% + 8px))';
      const overshootX = direction === 'left' ? 'translateX(-12px)' : 'translateX(12px)';

      el.style.transform = dockedX;
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.zIndex = String(zIndex);
      el.style.willChange = 'transform, opacity';

      const travelDuration = 420 * 0.8; // 336ms
      const snapDuration = 420 * 0.2;   // 84ms

      const travel = el.animate([
        { transform: dockedX, opacity: '0' },
        { transform: overshootX, opacity: '1', offset: 0.3 },
        { transform: overshootX, opacity: '1' }
      ], {
        duration: travelDuration,
        easing: EASING_EMERGE,
        fill: 'forwards'
      });

      travel.finished.then(() => {
        const snap = el.animate([
          { transform: overshootX },
          { transform: 'translateX(0)' }
        ], {
          duration: snapDuration,
          easing: EASING_SEAT,
          fill: 'forwards'
        });

        snap.finished.then(() => {
          el.style.pointerEvents = 'auto';
          el.style.willChange = 'auto';
          modulePowerOn(el);
        });
      });
    } else if (!isActive && prevActiveRef.current) {
      // Retract
      el.style.pointerEvents = 'none';
      el.style.willChange = 'transform, opacity';
      const retractTarget = direction === 'left'
        ? 'translateX(calc(100% - 8px))'
        : 'translateX(calc(-100% + 8px))';

      const retract = el.animate([
        { transform: 'translateX(0)', opacity: '1' },
        { opacity: '0.6', offset: 0.7 },
        { transform: retractTarget, opacity: '0' }
      ], {
        duration: 320,
        easing: 'cubic-bezier(0.7, 0.0, 1.0, 0.8)',
        fill: 'forwards'
      });

      retract.finished.then(() => {
        el.style.willChange = 'auto';
      });
    }

    prevActiveRef.current = isActive;
  }, [isActive]);

  // Docked initial state
  const dockedTransform = direction === 'left'
    ? 'translateX(calc(100% - 8px))'
    : 'translateX(calc(-100% + 8px))';

  return (
    <div
      ref={panelRef}
      className={className}
      style={{
        transform: dockedTransform,
        opacity: 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        ...(direction === 'left' ? { right: 'calc(100% - 2px)' } : { left: 'calc(100% - 2px)' }),
        zIndex,
        ...style
      }}
    >
      {children}
    </div>
  );
}
