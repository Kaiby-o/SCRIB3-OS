import React from 'react';
import styles from './ScreenArea.module.css';

interface ScreenAreaProps {
  children?: React.ReactNode;
}

export default function ScreenArea({ children }: ScreenAreaProps) {
  return (
    <div className={styles.bezel}>
      <div className={styles.screen}>
        {/* CRT overlay layers */}
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.noise} aria-hidden="true" />
        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
