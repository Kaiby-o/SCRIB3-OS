import React from 'react';
import styles from './ModuleFrame.module.css';

interface ModuleFrameProps {
  children?: React.ReactNode;
  direction?: 'left' | 'right';
  style?: React.CSSProperties;
  className?: string;
  screenRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ModuleFrame({
  children,
  direction = 'left',
  style,
  className = '',
  screenRef
}: ModuleFrameProps) {
  return (
    <div className={`${styles.frame} ${className}`} style={style}>
      {/* Corner screws */}
      <div className={`${styles.screw} ${styles.screwTL}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwTR}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwBL}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwBR}`} aria-hidden="true" />

      {/* Connector strip on joining edge */}
      {direction === 'left' && (
        <div className={styles.connectorLeft} aria-hidden="true" />
      )}
      {direction === 'right' && (
        <div className={styles.connectorRight} aria-hidden="true" />
      )}

      {/* Module screen */}
      <div className={`${styles.moduleScreen} module-screen`} ref={screenRef}>
        {children}
      </div>
    </div>
  );
}
