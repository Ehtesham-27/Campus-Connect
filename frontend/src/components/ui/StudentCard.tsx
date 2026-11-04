import React from 'react';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { UserPlus, Check, Clock } from 'lucide-react';

export interface StudentCardProps {
  id: string;
  fullName: string;
  course: string;
  branch?: string;
  yearOrSemester: string;
  bio?: string;
  profileImageUrl?: string;
  interests?: string[];
  skills?: string[];
  connectionStatus?: 'none' | 'pending' | 'connected';
  onConnect?: (id: string) => void;
  className?: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  id,
  fullName,
  course,
  branch,
  yearOrSemester,
  bio,
  profileImageUrl,
  interests = [],
  skills = [],
  connectionStatus = 'none',
  onConnect,
  className = '',
}) => {
  return (
    <Card surface="white" interactive className={`cc-student-card ${className}`}>
      {/* Top Header with Avatar & Details */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <Avatar
          src={profileImageUrl}
          initials={fullName}
          size="lg"
          shape="rounded"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-card)',
              fontWeight: 800,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {fullName}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-ink-muted)',
              marginTop: '2px',
            }}
          >
            {course} {branch ? `• ${branch}` : ''} • {yearOrSemester}
          </p>
        </div>
      </div>

      {/* Short Bio */}
      {bio && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-ink-black)',
            marginTop: 'var(--space-3)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {bio}
        </p>
      )}

      {/* Skills & Interest Tags */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-1)',
          marginTop: 'var(--space-4)',
        }}
      >
        {skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="yellow" size="sm" withShadow={false}>
            {skill}
          </Badge>
        ))}
        {interests.slice(0, 2).map((interest) => (
          <Badge key={interest} variant="cream" size="sm" withShadow={false}>
            {interest}
          </Badge>
        ))}
      </div>

      {/* Action Footer */}
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
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-ink-subtle)',
          }}
        >
          ID #{id.slice(-4)}
        </span>

        {connectionStatus === 'connected' ? (
          <Button variant="outline" size="sm" disabled icon={<Check size={14} />}>
            Connected
          </Button>
        ) : connectionStatus === 'pending' ? (
          <Button variant="outline" size="sm" disabled icon={<Clock size={14} />}>
            Requested
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus size={14} />}
            onClick={() => onConnect?.(id)}
          >
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
};

