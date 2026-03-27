import React from 'react';

interface ModulePanelProps {
  label: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onRemove?: () => void;
}

const ModulePanel: React.FC<ModulePanelProps> = ({
  label,
  children,
  style,
  className = '',
  onRemove,
}) => {

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        background: 'var(--bg-surface, rgba(234, 242, 215, 0.2))',
        border: '0.733px solid var(--border-default)',
        borderRadius: '10.258px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Header row: drag handle + label + controls */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        {/* Drag handle (left) */}
        <div className="flex items-center gap-2">
          <div className="module-drag-handle" style={{ cursor: 'grab', padding: '2px 4px', opacity: 0.2, transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.2')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="3" cy="3" r="1" fill="var(--text-primary)" />
              <circle cx="9" cy="3" r="1" fill="var(--text-primary)" />
              <circle cx="3" cy="9" r="1" fill="var(--text-primary)" />
              <circle cx="9" cy="9" r="1" fill="var(--text-primary)" />
            </svg>
          </div>
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
        </div>

        {/* Controls (right) */}
        <div className="flex items-center gap-2">
          {/* Resize indicator */}
          <div style={{ opacity: 0.15, padding: '2px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 9L9 1M5 9L9 5" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          {/* Close/remove button */}
          {onRemove && (
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.2, transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.2')} aria-label="Remove module">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="var(--text-primary)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1" style={{ overflow: 'auto' }}>
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
