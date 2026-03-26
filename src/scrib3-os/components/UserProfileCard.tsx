import React from 'react';

interface UserProfileCardProps {
  name: string;
  role: string;
  avatarUrl?: string;
  xp?: number;
  maxXp?: number;
  onExpand?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  role,
  avatarUrl,
  xp = 0,
  maxXp = 100,
  onExpand,
}) => {
  const xpPercent = maxXp > 0 ? Math.min((xp / maxXp) * 100, 100) : 0;

  return (
    <div
      className="flex items-center gap-3"
      style={{
        background: '#000000',
        borderRadius: '75.641px',
        padding: '12px 20px',
      }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#333',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-off-white text-xs font-kaio uppercase">
            {name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span
          className="font-kaio uppercase leading-tight truncate"
          style={{
            fontWeight: 900,
            fontSize: '15px',
            color: '#EAF2D7',
          }}
        >
          {name}
        </span>
        <span
          className="font-owners uppercase leading-tight truncate"
          style={{
            fontSize: '12px',
            color: 'rgba(234, 242, 215, 0.6)',
          }}
        >
          {role}
        </span>

        {/* XP Bar */}
        <div
          style={{
            border: '0.911px solid #EAF2D7',
            borderRadius: '36px',
            height: '4px',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#EAF2D7',
              height: '100%',
              width: `${xpPercent}%`,
              borderRadius: '36px',
              transition: 'width 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          />
        </div>
      </div>

      {/* Play / Expand Button */}
      <button
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '0.911px solid #EAF2D7',
          background: 'transparent',
          color: '#EAF2D7',
        }}
        onClick={onExpand}
        aria-label="Expand profile"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M4 2.5L8 6L4 9.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default UserProfileCard;
