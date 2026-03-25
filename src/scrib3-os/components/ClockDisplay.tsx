import React, { useState, useEffect } from 'react';

const ClockDisplay: React.FC = () => {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setTime(formatTime(new Date()));

      const interval = setInterval(() => {
        setTime(formatTime(new Date()));
      }, 60_000);

      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <span className="text-time" style={{ color: 'var(--text-primary)' }}>
      {time}
    </span>
  );
};

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default ClockDisplay;
