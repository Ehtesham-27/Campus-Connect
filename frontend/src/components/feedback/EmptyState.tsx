import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  badgeText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  badgeText = 'CAMPUS RADAR',
  className = '',
}) => {
  return (
    <Card
      surface="cream"
      className={`cc-empty-state ${className}`}
      style={{
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
      }}
    >
      {badgeText && (
        <Badge variant="yellow" size="sm" sticker rotate="left" style={{ marginBottom: 'var(--space-3)' }}>
          {badgeText}
        </Badge>
      )}

      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bright-yellow)',
          border: 'var(--border-thick) solid var(--color-ink-black)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-ink-black)',
          margin: 'var(--space-2) auto var(--space-4) auto',
        }}
      >
        {icon || <Sparkles size={30} />}
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-card)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-ink-muted)',
          maxWidth: '440px',
          marginTop: 'var(--space-2)',
          marginBottom: actionText ? 'var(--space-5)' : 0,
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Card>
  );
};

