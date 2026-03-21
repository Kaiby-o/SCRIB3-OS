import { useState } from 'react';
import styles from './HardwareToggle.module.css';

export default function HardwareToggle() {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const next = !isOn;
    setIsOn(next);
    if (next) {
      document.documentElement.style.setProperty('--phosphor-green', 'var(--phosphor-amber)');
      document.documentElement.style.setProperty('--crt-green', 'var(--crt-amber)');
      document.documentElement.classList.add('amber-mode');
    } else {
      document.documentElement.style.removeProperty('--phosphor-green');
      document.documentElement.style.removeProperty('--crt-green');
      document.documentElement.classList.remove('amber-mode');
    }
  };

  return (
    <div
      className={`${styles.toggle} ${isOn ? styles.on : ''}`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isOn}
      aria-label="PHOSPHOR MODE"
      title={isOn ? 'AMBER' : 'GREEN'}
    />
  );
}
