import React from 'react';
import styles from './DeviceShell.module.css';
import ScreenArea from './ScreenArea';
import IndicatorLights from './IndicatorLights';
import HardwareToggle from './HardwareToggle';

interface DeviceShellProps {
  children?: React.ReactNode;
  slotRef?: React.RefObject<HTMLDivElement | null>;
}

export default function DeviceShell({ children, slotRef }: DeviceShellProps) {
  return (
    <div className={styles.chassis}>
      {/* Corner screws */}
      <div className={`${styles.screw} ${styles.screwTL}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwTR}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwBL}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwBR}`} aria-hidden="true" />

      {/* Top bar with card slot */}
      <div className={styles.topBar}>
        <div className={styles.cardSlot} ref={slotRef} aria-label="Card slot">
          <div className={styles.cardSlotGold} />
        </div>
      </div>

      {/* Body row */}
      <div className={styles.bodyRow}>
        {/* Left panel: LEDs + toggle */}
        <div className={styles.leftPanel}>
          <div className={styles.ledRow}>
            <IndicatorLights state="active" />
            <IndicatorLights state="standby" />
          </div>
          <div className={styles.toggleHolder}>
            <HardwareToggle />
          </div>
        </div>

        {/* Screen area */}
        <div className={styles.screenSlot}>
          <ScreenArea>
            {children}
          </ScreenArea>
        </div>

        {/* Right panel: speaker grille */}
        <div className={styles.rightPanel}>
          <div className={styles.speakerGrille} />
          <div className={styles.grilleDot}>
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom rail */}
      <div className={styles.bottomRail}>
        <span className={styles.scrib3Label}>SCRIB3 — OS</span>
        <div className={styles.barcode} aria-hidden="true" />
      </div>
    </div>
  );
}
