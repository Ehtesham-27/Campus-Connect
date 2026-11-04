import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, XCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminReportItem } from './adminApi';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await adminApi.getReports({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setReports(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to load moderation reports.' });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    const notes = window.prompt(`Enter resolution notes for marking this report ${status}:`, '');
    if (notes === null) return; // User cancelled prompt

    try {
      await adminApi.updateReport(id, { status, resolutionNotes: notes });
      setFeedback({ type: 'success', message: `Report marked as ${status}.` });
      fetchReports();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to update report status.' });
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
            COMMUNITY SAFETY & REPORTS
          </h1>
          <p style={{ color: 'var(--color-ink-subtle)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review flagged accounts, reported feed notices, and policy violation submissions.
          </p>
        </div>

        <Button variant="yellow" size="sm" icon={<RefreshCw size={14} />} onClick={fetchReports}>
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
            {feedback.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-5)' }}>
        {['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'].map((st) => (
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

      {isLoading ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: '#102A43', color: '#ffffff' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-3) auto', color: 'var(--color-bright-yellow)' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Loading moderation reports...</p>
        </Card>
      ) : reports.length === 0 ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-10)', backgroundColor: '#102A43', color: 'var(--color-ink-subtle)' }}>
          No moderation reports filed for this status filter.
        </Card>
      ) : (
        <Card surface="white" style={{ color: 'var(--color-ink-black)', padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream)', borderBottom: 'var(--border-thick) solid var(--color-ink-black)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Target Type & Subject</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Reason & Details</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Reported By</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>
                      <Badge variant="pink" size="sm">{rep.targetType}</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)', display: 'block', marginTop: '0.2rem' }}>
                        {rep.targetTitle || `ID: ${rep.targetId.slice(-6)}`}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block' }}>{rep.reason}</strong>
                      {rep.details && <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)' }}>{rep.details}</span>}
                      {rep.resolutionNotes && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                          Resolved note: {rep.resolutionNotes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-secondary-text)' }}>
                      {rep.reporter?.fullName || 'Anonymous'}
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-subtle)', display: 'block' }}>
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant={rep.status === 'RESOLVED' ? 'yellow' : rep.status === 'DISMISSED' ? 'blue' : 'pink'} size="sm">
                        {rep.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {rep.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<ShieldCheck size={13} />}
                            onClick={() => handleUpdateStatus(rep.id, 'RESOLVED')}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<XCircle size={13} />}
                            onClick={() => handleUpdateStatus(rep.id, 'DISMISSED')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-subtle)' }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
