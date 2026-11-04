import React from 'react';
import { Badge, type BadgeProps } from '../ui/Badge';

export interface PageHeaderProps {
  title: string;
  description?: string;
  tagline?: string;
  badgeText?: string;
  badgeVariant?: BadgeProps['variant'];
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  tagline,
  badgeText,
  badgeVariant = 'yellow',
  action,
  className = '',
}) => {
  return (
    <div
      className={`cc-page-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        paddingBottom: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        borderBottom: 'var(--border-thick) solid var(--color-ink-black)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {tagline && (
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-electric-blue)',
              }}
            >
              {tagline}
            </span>
          )}
          {badgeText && (
            <Badge variant={badgeVariant} size="sm" sticker rotate="left">
              {badgeText}
            </Badge>
          )}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-page)',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginTop: 'var(--space-2)',
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              color: 'var(--color-ink-muted)',
              marginTop: 'var(--space-2)',
              maxWidth: '680px',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
};

