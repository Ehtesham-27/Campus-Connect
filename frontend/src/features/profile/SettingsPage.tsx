import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Key, Mail } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <PageHeader
        title="Account Settings"
        tagline="Preferences • Security"
        description="Configure your authenticated session credentials, verified college email, and platform settings."
        badgeText="SETTINGS"
        badgeVariant="yellow"
        action={
          <Button variant="yellow" size="sm" onClick={() => navigate('/app')}>
            Dashboard
          </Button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Email & Credentials Card */}
        <Card surface="white">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-3)' }}>
            <Key size={18} color="var(--color-electric-blue)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Credentials & College Identity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Verified College Email
              </label>
              <input
                type="text"
                className="cc-input"
                readOnly
                value={user?.email || 'student@campus.edu'}
                style={{ backgroundColor: 'var(--color-cream)', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
                Primary college email address associated with your enrolled institution.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Account Password
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-2)' }}>
                To change your password, request a secure single-use recovery token sent to your college inbox.
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={<Mail size={14} />}
                onClick={() => navigate('/forgot-password')}
              >
                Send Password Reset Email
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications Card */}
        <Card surface="white">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--color-vivid-orange)" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Notification Preferences
              </h3>
            </div>
            <Badge variant="cream" size="sm">
              SCHEDULED FOR FUTURE MILESTONE
            </Badge>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Real-time push and email notifications for incoming connection requests and application updates are scheduled for a future milestone in accordance with project scope.
          </p>

          <Button variant="outline" size="sm" disabled>
            Notifications Active by Default
          </Button>
        </Card>
      </div>
    </div>
  );
};
export default SettingsPage;
