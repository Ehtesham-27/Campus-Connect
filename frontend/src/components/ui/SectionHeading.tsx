import React from 'react';
import { Badge, type BadgeProps } from './Badge';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: BadgeProps['variant'];
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'yellow',
  action,
  className = '',
}) => {
  return (
    <div
      className={`cc-section-heading ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-section)',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              fontWeight: 800,
            }}
          >
            {title}
          </h2>
          {badgeText && (
            <Badge variant={badgeVariant} size="sm" sticker rotate="right">
              {badgeText}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-ink-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && <div style={{ alignSelf: 'center' }}>{action}</div>}
    </div>
  );
};

