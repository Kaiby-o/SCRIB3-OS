import React from 'react';

interface PillNavProps {
  items: string[];
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const PillNav: React.FC<PillNavProps> = ({ items, activeItem, onItemClick }) => {
  return (
    <nav className="flex items-center gap-2">
      {items.map((item) => {
        const isActive = item === activeItem;
        return (
          <button
            key={item}
            onClick={() => onItemClick?.(item)}
            className="rounded-pill text-pill-nav px-5 py-2 transition-colors duration-200"
            style={{
              border: '0.784px solid var(--border-default)',
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#000000' : 'var(--text-primary)',
            }}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
};

export default PillNav;
