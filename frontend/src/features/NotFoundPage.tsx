import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-cream)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '520px' }}>
        <Badge variant="pink" size="lg" sticker rotate="left" style={{ marginBottom: 'var(--space-3)' }}>
          404 • ROUTE LOST
        </Badge>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4.5rem',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            margin: 'var(--space-2) 0',
          }}
        >
          NOT FOUND
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-ink-muted)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Looks like this quad doesn't exist on Campus Connect yet. Let's get you back to class!
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
          <Link to="/app" style={{ textDecoration: 'none' }}>
            <Button variant="yellow" size="lg" icon={<Home size={18} />}>
              Campus Hub
            </Button>
          </Link>
          <Link to="/app/discover" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="lg" icon={<Compass size={18} />}>
              Discover Students
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
