import React from 'react';
import { useNavOverlay } from './NavOverlay';

/** Burger menu button — place in any page header. Requires NavOverlayProvider ancestor. */
const BurgerButton: React.FC = () => {
  const nav = useNavOverlay();
  return (
    <button onClick={nav.open} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexShrink: 0 }} aria-label="Open menu">
      <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
        <path d="M42.5 33.7998H13.5V31.8662H42.5V33.7998ZM42.5 24.1338H13.5V22.2002H42.5V24.1338Z" fill="var(--text-primary)" />
      </svg>
    </button>
  );
};

export default BurgerButton;
