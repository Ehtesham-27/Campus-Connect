import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { authApi } from './authApi';
import { useAuth } from './AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { refreshUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Missing password reset token. Please use the link sent to your email.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token,
        newPassword: password,
      });
      setIsSuccess(true);
      await refreshUser();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Badge variant="yellow" size="sm" sticker rotate="left" style={{ marginBottom: 'var(--space-2)' }}>
            PASSWORD RESET
          </Badge>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            SET NEW PASSWORD
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-ink-muted)',
            }}
          >
            CHOOSE A STRONG, SECURE PASSWORD
          </p>
        </div>

        <Card surface="white">
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
              <div style={{ display: 'inline-flex', color: 'var(--color-success)', marginBottom: 'var(--space-3)' }}>
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                Password Updated!
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--color-ink-muted)',
                  marginTop: 'var(--space-2)',
                  lineHeight: 1.45,
                }}
              >
                Your password has been securely updated and your session has been activated.
              </p>
              <div style={{ marginTop: 'var(--space-6)' }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  onClick={() => navigate('/app')}
                >
                  Enter Campus Portal
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {!token && (
                <div
                  style={{
                    backgroundColor: '#FBEBEB',
                    border: '2px solid var(--color-error)',
                    boxShadow: '3px 3px 0px var(--color-error)',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={18} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-error)', margin: 0, fontWeight: 600 }}>
                    No reset token found in URL. Please click the link received in your email.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div
                  style={{
                    backgroundColor: '#FBEBEB',
                    border: '2px solid var(--color-error)',
                    boxShadow: '3px 3px 0px var(--color-error)',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={18} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-error)', margin: 0, fontWeight: 600 }}>
                    {errorMessage}
                  </p>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  className="cc-input"
                  placeholder="••••••••••••"
                  required
                  disabled={isSubmitting || !token}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  className="cc-input"
                  placeholder="••••••••••••"
                  required
                  disabled={isSubmitting || !token}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || !token}
                icon={<KeyRound size={16} />}
                style={{ marginTop: 'var(--space-2)' }}
              >
                {isSubmitting ? 'Updating Password...' : 'Reset Password'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
                <Link
                  to="/login"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-ink-black)',
                    textDecoration: 'underline',
                  }}
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

