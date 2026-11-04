import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Ban, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminStudentItem } from './adminApi';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await adminApi.getStudents({
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setStudents(data.students);
      setTotalCount(data.total);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to load students.' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleToggleStatus = async (student: AdminStudentItem) => {
    const nextStatus = student.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionText = nextStatus === 'SUSPENDED' ? 'suspend' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} access for ${student.fullName}?`)) {
      return;
    }

    try {
      await adminApi.updateStudentStatus(student.id, nextStatus);
      setFeedback({
        type: 'success',
        message: `Account for ${student.fullName} has been set to ${nextStatus}.`,
      });
      fetchStudents();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to update student account status.' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <Badge variant="yellow" size="sm" sticker rotate="left">
            ADMINISTRATION
          </Badge>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginTop: 'var(--space-2)', color: '#ffffff' }}>
            STUDENT ACCOUNT MANAGEMENT
          </h1>
          <p style={{ color: 'var(--color-ink-subtle)', fontSize: '0.9rem', marginTop: '4px' }}>
            Inspect registered student profiles, verify college enrollments, and moderate access.
          </p>
        </div>

        <Button variant="yellow" size="sm" icon={<RefreshCw size={14} />} onClick={fetchStudents}>
          Refresh
        </Button>
      </div>

      {feedback && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-thick) solid var(--color-ink-black)',
            backgroundColor: feedback.type === 'success' ? 'var(--color-bright-yellow)' : 'var(--color-hot-pink)',
            color: feedback.type === 'success' ? 'var(--color-ink-black)' : 'var(--color-white)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-ink-muted)',
            }}
          />
          <input
            type="text"
            className="cc-input"
            placeholder="Search student by name, email, department, college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: '#ffffff', color: 'var(--color-primary-text)', paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.5rem 0.9rem',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-thick) solid var(--color-ink-black)',
                cursor: 'pointer',
                backgroundColor: statusFilter === st ? 'var(--color-bright-yellow)' : '#102A43',
                color: statusFilter === st ? 'var(--color-primary-text)' : '#ffffff',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Students Management Table Card */}
      {isLoading ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: '#102A43', color: '#ffffff' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-3) auto', color: 'var(--color-bright-yellow)' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Loading student directory...</p>
        </Card>
      ) : students.length === 0 ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-10)', backgroundColor: '#102A43', color: 'var(--color-ink-subtle)' }}>
          No students matching search filter.
        </Card>
      ) : (
        <div>
          <div style={{ marginBottom: 'var(--space-2)', fontSize: '0.8rem', color: 'var(--color-ink-subtle)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Showing {students.length} of {totalCount} registered students
          </div>
          <Card surface="white" style={{ color: 'var(--color-ink-black)', padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-cream)', borderBottom: 'var(--border-thick) solid var(--color-ink-black)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Student Identity</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>College Email</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Degree & Department</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      {student.fullName}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary-text)', display: 'block' }}>{student.college}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace' }}>{student.email}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {student.course} {student.branch ? `• ${student.branch}` : ''}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary-text)', display: 'block' }}>{student.academicYear}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant={student.accountStatus === 'ACTIVE' ? 'yellow' : 'pink'} size="sm">
                        {student.accountStatus}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Button
                        variant={student.accountStatus === 'ACTIVE' ? 'outline' : 'yellow'}
                        size="sm"
                        icon={student.accountStatus === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        onClick={() => handleToggleStatus(student)}
                      >
                        {student.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </div>
      )}
    </div>
  );
};
