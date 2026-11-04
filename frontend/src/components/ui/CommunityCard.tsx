import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Users, ArrowRight } from 'lucide-react';

export interface CommunityCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  accentColor?: 'blue' | 'yellow' | 'pink' | 'purple' | 'orange';
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  id,
  name,
  category,
  description,
  memberCount,
  accentColor = 'blue',
  onJoin,
  onView,
  className = '',
}) => {
  return (
    <Card surface="white" interactive className={`cc-community-card ${className}`}>
      {/* Category strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-3)',
        }}
      >
        <Badge variant={accentColor} size="sm" sticker rotate="left">
          {category}
        </Badge>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-ink-muted)',
          }}
        >
          <Users size={14} />
          <span>{memberCount.toLocaleString()} Members</span>
        </div>
      </div>

      {/* Community Title */}
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-card)',
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-ink-muted)',
          marginTop: 'var(--space-2)',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.9em',
        }}
      >
        {description}
      </p>

      {/* Footer Actions */}
      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-3)',
          borderTop: 'var(--border-thin) solid var(--color-ink-black)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => onView?.(id)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--color-ink-black)',
            textDecoration: 'underline',
          }}
        >
          Details <ArrowRight size={13} />
        </button>

        <Button
          variant="yellow"
          size="sm"
          onClick={() => onJoin?.(id)}
        >
          Join Society
        </Button>
      </div>
    </Card>
  );
};
