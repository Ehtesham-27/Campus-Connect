import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar, Briefcase, ExternalLink, AlertCircle } from 'lucide-react';

export interface OpportunityCardProps {
  id: string;
  title: string;
  type: 'Internship' | 'Hackathon' | 'Workshop' | 'Competition' | 'Scholarship' | string;
  organiser: string;
  deadline: string;
  eligibility?: string;
  isClosingSoon?: boolean;
  onView?: (id: string) => void;
  className?: string;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  id,
  title,
  type,
  organiser,
  deadline,
  eligibility,
  isClosingSoon = false,
  onView,
  className = '',
}) => {
  const getTypeVariant = (t: string) => {
    switch (t.toLowerCase()) {
      case 'hackathon':
        return 'orange';
      case 'internship':
        return 'blue';
      case 'scholarship':
        return 'yellow';
      case 'workshop':
        return 'purple';
      default:
        return 'pink';
    }
  };

  return (
    <Card surface="white" interactive className={`cc-opportunity-card ${className}`}>
      {/* Top Metadata */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <Badge variant={getTypeVariant(type)} size="sm" sticker rotate="right">
          {type}
        </Badge>

        {isClosingSoon ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'var(--color-vivid-orange)',
              textTransform: 'uppercase',
            }}
          >
            <AlertCircle size={13} /> Closing Soon
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--color-ink-muted)',
            }}
          >
            <Calendar size={13} /> {deadline}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-card)',
          fontWeight: 800,
          lineHeight: 1.25,
          color: 'var(--color-ink-black)',
        }}
      >
        {title}
      </h3>

      {/* Organiser */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-ink-muted)',
          marginTop: 'var(--space-1)',
        }}
      >
        <Briefcase size={13} />
        <span>Organised by: <strong>{organiser}</strong></span>
      </div>

      {/* Eligibility */}
      {eligibility && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-ink-black)',
            marginTop: 'var(--space-3)',
            background: 'var(--color-cream)',
            padding: '0.35rem 0.65rem',
            border: 'var(--border-thin) solid var(--color-ink-black)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          Eligibility: {eligibility}
        </p>
      )}

      {/* Footer */}
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
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--color-ink-subtle)',
          }}
        >
          Verified Campus Opp
        </span>

        <Button
          variant="outline"
          size="sm"
          icon={<ExternalLink size={13} />}
          onClick={() => onView?.(id)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

