import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user.role?.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: string[] };
      const message = error.message || (error.errors && error.errors[0]) || 'Failed to sign in. Please verify your credentials.';
      setErrorMessage(message);
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
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Badge variant="yellow" size="sm" sticker rotate="left" style={{ marginBottom: 'var(--space-2)' }}>
            STUDENT PORTAL
          </Badge>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            CAMPUS CONNECT
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-ink-muted)',
              letterSpacing: '0.04em',
            }}
          >
            YOUR CAMPUS. YOUR PEOPLE. YOUR OPPORTUNITIES.
          </p>
        </div>

        {/* Login Card */}
        <Card surface="white">
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              marginBottom: 'var(--space-1)',
            }}
          >
            Sign in to your account
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--color-ink-muted)',
              marginBottom: 'var(--space-5)',
            }}
          >
            Enter your college email to access your campus community.
          </p>

          {errorMessage && (
            <div
              style={{
                backgroundColor: '#FBEBEB',
                border: '2px solid var(--color-error)',
                boxShadow: '3px 3px 0px var(--color-error)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: 'var(--space-1)',
                }}
              >
                College Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="cc-input"
                  placeholder="student@college.edu"
                  required
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    color: 'var(--color-electric-blue)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="cc-input"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              style={{ marginTop: 'var(--space-2)' }}
            >
              {isSubmitting ? 'Signing In...' : 'Enter Campus Hub'}
            </Button>
          </form>

          <div
            style={{
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              borderTop: 'var(--border-thin) solid var(--color-ink-black)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
              New to Campus Connect?{' '}
              <Link
                to="/register"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: 'var(--color-ink-black)',
                  textDecoration: 'underline',
                }}
              >
                Register as a Student
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
