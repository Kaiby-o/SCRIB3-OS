import styles from './IndicatorLights.module.css';

interface IndicatorLightsProps {
  state: 'off' | 'standby' | 'active' | 'error';
  label?: string;
}

export default function IndicatorLights({ state, label }: IndicatorLightsProps) {
  return (
    <div className={styles.housing} title={label}>
      <div className={`${styles.led} ${styles[state]}`} aria-label={label ?? state} />
    </div>
  );
}
