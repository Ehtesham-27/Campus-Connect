import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    collegeEmail: '',
    password: '',
    confirmPassword: '',
    college: '',
    course: '',
    branch: '',
    yearOrSemester: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: formData.fullName,
        collegeEmail: formData.collegeEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        college: formData.college,
        course: formData.course,
        branch: formData.branch,
        yearOrSemester: formData.yearOrSemester,
      });
      navigate('/app');
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: string[] };
      const message =
        error.message ||
        (error.errors && error.errors.join(' ')) ||
        'Registration failed. Please check your information.';
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
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Badge variant="yellow" size="sm" sticker rotate="left" style={{ marginBottom: 'var(--space-2)' }}>
            STUDENT ONBOARDING
          </Badge>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            CREATE STUDENT ACCOUNT
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-ink-muted)',
            }}
          >
            JOIN YOUR CAMPUS COMMUNITY IN SECONDS
          </p>
        </div>

        <Card surface="white">
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="cc-input"
                placeholder="e.g. Alex Sharma"
                required
                disabled={isSubmitting}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                College Email (.edu / college domain) *
              </label>
              <input
                type="email"
                className="cc-input"
                placeholder="alex.sharma@dtu.ac.in"
                required
                disabled={isSubmitting}
                value={formData.collegeEmail}
                onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  className="cc-input"
                  placeholder="••••••••••••"
                  required
                  disabled={isSubmitting}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="cc-input"
                  placeholder="••••••••••••"
                  required
                  disabled={isSubmitting}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                College / University *
              </label>
              <input
                type="text"
                className="cc-input"
                placeholder="e.g. Delhi Technological University"
                required
                disabled={isSubmitting}
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Course / Degree *
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. B.Tech"
                  required
                  disabled={isSubmitting}
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Branch / Department
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. Computer Science"
                  disabled={isSubmitting}
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Academic Year / Semester
              </label>
              <input
                type="text"
                className="cc-input"
                placeholder="e.g. 3rd Year (Semester 5)"
                disabled={isSubmitting}
                value={formData.yearOrSemester}
                onChange={(e) => setFormData({ ...formData, yearOrSemester: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              disabled={isSubmitting}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              style={{ marginTop: 'var(--space-3)' }}
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
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
              Already registered?{' '}
              <Link
                to="/login"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: 'var(--color-ink-black)',
                  textDecoration: 'underline',
                }}
              >
                Log in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
