import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from './authApi';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Unable to request password recovery. Please try again.');
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
            ACCOUNT RECOVERY
          </Badge>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            FORGOT PASSWORD
          </h1>
        </div>

        <Card surface="white">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
              <div style={{ display: 'inline-flex', color: 'var(--color-success)', marginBottom: 'var(--space-3)' }}>
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                Request Submitted
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
                If an account exists for <strong>{email}</strong>, a recovery link has been dispatched to that address. Follow the instructions in the email to reset your credentials.
              </p>
              <div style={{ marginTop: 'var(--space-6)' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="md" icon={<ArrowLeft size={16} />}>
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Enter your verified college email address and we'll send you a password recovery link.
              </p>

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
                  College Email
                </label>
                <input
                  type="email"
                  className="cc-input"
                  placeholder="student@college.edu"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" size="md" disabled={isSubmitting} style={{ marginTop: 'var(--space-2)' }}>
                {isSubmitting ? 'Sending Request...' : 'Send Recovery Link'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-ink-black)',
                    textDecoration: 'underline',
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
