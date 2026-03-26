import React, { useState } from 'react';

interface ModulePanelProps {
  label: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const ModulePanel: React.FC<ModulePanelProps> = ({
  label,
  children,
  style,
  className = '',
}) => {
  const [toast, setToast] = useState(false);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 1500);
  };

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        background: 'var(--bg-surface, rgba(234, 242, 215, 0.2))',
        border: '0.733px solid var(--border-default)',
        borderRadius: '10.258px',
        padding: '24px',
        position: 'relative',
        ...style,
      }}
    >
      {/* Header row: label + icons */}
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <span
          className="font-owners uppercase"
          style={{
            fontSize: '12px',
            letterSpacing: '1px',
            opacity: 0.6,
            color: 'var(--text-primary)',
          }}
        >
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Resize icon */}
          <button onClick={showToast} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.25, transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.25')} aria-label="Resize module">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 9L5 13M1 5L9 13M1 1L13 13" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
          {/* Close icon */}
          <button onClick={showToast} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.25, transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.25')} aria-label="Close module">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="var(--text-primary)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 8, right: 60, background: '#000', color: '#EAF2D7',
          fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px',
          textTransform: 'uppercase', padding: '4px 12px', borderRadius: '75.641px',
          zIndex: 10, whiteSpace: 'nowrap',
        }}>
          Coming Soon
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {children ?? (
          <div className="flex items-center justify-center h-full">
            <span
              className="font-owners uppercase"
              style={{
                fontSize: '12px',
                letterSpacing: '1px',
                opacity: 0.3,
                color: 'var(--text-primary)',
              }}
            >
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulePanel;
