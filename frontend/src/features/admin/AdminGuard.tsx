import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard enforces that administrative routes are not casually browsable
 * by unauthenticated or student sessions.
 * Note: Frontend route guards do NOT replace backend API authorization.
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show neutral loading state while session verification completes
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A1C2E',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          letterSpacing: '0.05em',
        }}
      >
        VERIFYING ADMINISTRATOR PRIVILEGES...
      </div>
    );
  }

  // Strictly verify authenticated user object carries an ADMIN role
  const isAdminAuthenticated = Boolean(user && user.role?.toUpperCase() === 'ADMIN');

  if (!isAdminAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A1C2E',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <Badge variant="yellow" size="lg" sticker rotate="left" style={{ marginBottom: 'var(--space-3)' }}>
            403 • ACCESS RESTRICTED
          </Badge>

          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#102A43',
              border: '2.5px solid #ffffff',
              boxShadow: '4px 4px 0px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'var(--space-2) auto var(--space-4) auto',
              color: 'var(--color-bright-yellow)',
            }}
          >
            <ShieldAlert size={36} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              margin: '0 0 var(--space-2) 0',
            }}
          >
            ADMIN ACCESS REQUIRED
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#9FB3C8',
              lineHeight: 1.5,
              marginBottom: 'var(--space-6)',
            }}
          >
            The administrative console is strictly reserved for verified university staff and authorized moderators. In accordance with the Campus Connect security model, administrator privileges cannot be granted through student registration or self-switching.
          </p>

          <Card surface="white" style={{ color: 'var(--color-ink-black)', textAlign: 'left', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
              <Lock size={16} color="var(--color-ink-black)" />
              <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>
                Security Specification Rule:
              </strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.45 }}>
              All administrative operations must be independently authenticated and authorized by the backend Express middleware. Client-side state changes cannot bypass backend security.
            </p>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Link to="/app" style={{ textDecoration: 'none' }}>
              <Button variant="yellow" size="md" icon={<ArrowLeft size={16} />}>
                Return to Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
