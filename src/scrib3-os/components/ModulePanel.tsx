import React from 'react';

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
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        background: 'var(--bg-surface, rgba(234, 242, 215, 0.2))',
        border: '0.733px solid var(--border-default)',
        borderRadius: '10.258px',
        padding: '24px',
        ...style,
      }}
    >
      {/* Label */}
      <span
        className="font-owners uppercase"
        style={{
          fontSize: '12px',
          letterSpacing: '1px',
          opacity: 0.6,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}
      >
        {label}
      </span>

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
