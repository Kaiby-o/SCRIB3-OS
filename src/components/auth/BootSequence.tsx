import { useEffect, useRef, useState } from 'react';
import styles from './BootSequence.module.css';

interface BootSequenceProps {
  role: string;
  onComplete: () => void;
}

export default function BootSequence({ role, onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const BOOT_LINES = [
    'SCRIB3-OS v1.0.0',
    'INITIALIZING HARDWARE INTERFACES...',
    'MEMORY CHECK: 65536K OK',
    'LOADING OPERATOR PROFILE...',
    'PROFILE AUTHENTICATED',
    `ACCESS LEVEL: ${role}`,
    'ESTABLISHING NETWORK LINK...',
    'LINK ESTABLISHED',
    'LOADING MODULES...',
    'MOD-01 TASKS............... OK',
    'SYSTEM READY',
  ];

  useEffect(() => {
    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    const startTime = Date.now();
    const MIN_DURATION = 3500; // 3.5s minimum

    const typeChar = () => {
      if (cancelled) return;
      const line = BOOT_LINES[lineIndex];
      if (charIndex < line.length) {
        const jitter = Math.floor(Math.random() * 20) - 10; // ±10ms
        setCurrentLine(line.slice(0, charIndex + 1));
        charIndex++;
        setTimeout(typeChar, 35 + jitter);
      } else {
        // Line complete — move to next
        setLines(prev => [...prev, line]);
        setCurrentLine('');
        charIndex = 0;
        lineIndex++;
        if (lineIndex >= BOOT_LINES.length) {
          setDone(true);
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, MIN_DURATION - elapsed);
          setTimeout(() => {
            if (!cancelled) onComplete();
          }, remaining + 400);
        } else {
          setTimeout(typeChar, 80);
        }
      }
    };

    setTimeout(typeChar, 200);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, currentLine]);

  return (
    <div className={styles.terminal} ref={containerRef}>
      {lines.map((line, i) => (
        <div key={i} className={styles.line}>{line}</div>
      ))}
      {!done && (
        <div className={styles.line}>
          {currentLine}
          <span className={styles.cursor}>█</span>
        </div>
      )}
    </div>
  );
}
