import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface CartridgeInsertHandle {
  insert: (cardEl: HTMLElement, slotEl: HTMLElement) => Promise<void>;
  reject: (cardEl: HTMLElement) => Promise<void>;
}

const CartridgeInsert = forwardRef<CartridgeInsertHandle>((_, ref) => {
  const animatingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    insert: async (cardEl: HTMLElement, slotEl: HTMLElement) => {
      if (animatingRef.current) return;
      animatingRef.current = true;

      const slotRect = slotEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();

      const targetY = slotRect.top - cardRect.bottom + slotRect.height;
      const targetX = (slotRect.left + slotRect.width / 2) - (cardRect.left + cardRect.width / 2);

      cardEl.style.willChange = 'transform, opacity';

      // Phase 1: 600ms travel
      await cardEl.animate([
        { transform: 'translateX(0) translateY(0)' },
        {
          transform: `translateX(${targetX}px) translateY(${targetY * 0.3}px)`,
          offset: 0.3
        },
        { transform: `translateX(${targetX}px) translateY(${targetY * 0.7}px)` }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      }).finished;

      // Phase 2: 300ms resistance
      await cardEl.animate([
        { transform: `translateX(${targetX}px) translateY(${targetY * 0.7}px)` },
        { transform: `translateX(${targetX}px) translateY(${targetY * 0.95}px)` }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.6, 0.0, 0.8, 1.0)',
        fill: 'forwards'
      }).finished;

      // Phase 3: 200ms seat with overshoot
      await cardEl.animate([
        { transform: `translateX(${targetX}px) translateY(${targetY * 0.95}px)` },
        { transform: `translateX(${targetX}px) translateY(${targetY + 4}px)` },
        { transform: `translateX(${targetX}px) translateY(${targetY}px)` }
      ], {
        duration: 200,
        easing: 'cubic-bezier(0.0, 0.0, 0.2, 1.4)',
        fill: 'forwards'
      }).finished;

      slotEl.classList.add('slot--occupied');
      cardEl.style.willChange = 'auto';
      animatingRef.current = false;
    },

    reject: async (cardEl: HTMLElement) => {
      if (animatingRef.current) return;
      animatingRef.current = true;

      cardEl.style.willChange = 'transform, opacity';

      await cardEl.animate([
        { transform: 'translateX(0) translateY(0)' },
        { transform: 'translateX(0) translateY(20px)', offset: 0.1 },
        { transform: 'translateX(0) translateY(-80px)', offset: 0.5 },
        { transform: 'translateX(0) translateY(-60px)', offset: 0.7 },
        { transform: 'translateX(0) translateY(-80px)', offset: 0.8 },
        { transform: 'translateX(0) translateY(0)' }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
        fill: 'forwards'
      }).finished;

      cardEl.style.willChange = 'auto';
      animatingRef.current = false;
    }
  }));

  return null;
});

CartridgeInsert.displayName = 'CartridgeInsert';
export default CartridgeInsert;
