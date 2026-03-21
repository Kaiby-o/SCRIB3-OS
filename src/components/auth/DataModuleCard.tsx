import { useState, useRef } from 'react';
import styles from './DataModuleCard.module.css';

interface DataModuleCardProps {
  onSubmit: (handle: string, password: string) => void;
  error?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function DataModuleCard({ onSubmit, error, cardRef }: DataModuleCardProps) {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');

  const passwordRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, field: 'handle' | 'password') => {
    if (e.key === 'Enter') {
      if (field === 'handle') {
        passwordRef.current?.focus();
      } else {
        onSubmit(handle, password);
      }
    }
  };

  const handleGlobalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit(handle, password);
    }
  };

  return (
    <div className={styles.card} ref={cardRef} onKeyDown={handleGlobalKeyDown}>
      {/* Corner screws */}
      <div className={`${styles.screw} ${styles.screwTL}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwTR}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwBL}`} aria-hidden="true" />
      <div className={`${styles.screw} ${styles.screwBR}`} aria-hidden="true" />

      {/* Left contact strip */}
      <div className={styles.contacts} aria-hidden="true" />

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.connectorStrip} aria-hidden="true" />
        <div className={styles.barcodeStrip} aria-hidden="true" />

        <div className={styles.header}>
          <div className={styles.title}>SCRIB3 — OS</div>
          <div className={styles.subtitle}>DATA MODULE</div>
        </div>

        <div className={styles.fields}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>
              <span className={styles.fieldDot} />
              USERNAME
            </div>
            <input
              className={styles.fieldInput}
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              onKeyDown={e => handleKeyDown(e, 'handle')}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>
              <span className={styles.fieldDot} />
              PASSWORD
            </div>
            <input
              className={styles.fieldInput}
              type="password"
              ref={passwordRef}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => handleKeyDown(e, 'password')}
              autoComplete="current-password"
            />
          </div>

        </div>

        <div className={styles.errorText}>
          {error || ''}
        </div>
      </div>

      {/* Right grip tab */}
      <div className={styles.gripTab} aria-hidden="true" />
    </div>
  );
}
