import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Trash2, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminOpportunityItem } from './adminApi';

export const AdminOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<AdminOpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await adminApi.getOpportunities({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setOpportunities(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to load opportunities.' });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleVerify = async (id: string, title: string) => {
    try {
      await adminApi.verifyOpportunity(id);
      setFeedback({ type: 'success', message: `Opportunity "${title}" has been verified and published.` });
      fetchOpportunities();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to verify opportunity.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete opportunity "${title}"?`)) return;
    try {
      await adminApi.deleteOpportunity(id);
      setFeedback({ type: 'success', message: `Opportunity "${title}" deleted.` });
      fetchOpportunities();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to delete opportunity.' });
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
            OPPORTUNITY VERIFICATION & MANAGEMENT
          </h1>
          <p style={{ color: 'var(--color-ink-subtle)', fontSize: '0.9rem', marginTop: '4px' }}>
            Inspect, verify, and moderate internships, hackathons, seminars, and scholarships.
          </p>
        </div>

        <Button variant="yellow" size="sm" icon={<RefreshCw size={14} />} onClick={fetchOpportunities}>
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-5)' }}>
        {['ALL', 'VERIFIED', 'PENDING_VERIFICATION', 'CLOSED'].map((st) => (
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
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: '#102A43', color: '#ffffff' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-3) auto', color: 'var(--color-bright-yellow)' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Loading opportunities...</p>
        </Card>
      ) : opportunities.length === 0 ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-10)', backgroundColor: '#102A43', color: 'var(--color-ink-subtle)' }}>
          No opportunities found for this status.
        </Card>
      ) : (
        <Card surface="white" style={{ color: 'var(--color-ink-black)', padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream)', borderBottom: 'var(--border-thick) solid var(--color-ink-black)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Opportunity Title</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Type</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Organiser</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Deadline</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>
                      {opp.title}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary-text)', display: 'block', fontWeight: 400 }}>Eligibility: {opp.eligibility}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant="orange" size="sm">{opp.type}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{opp.organiser}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-secondary-text)' }}>{new Date(opp.deadline).toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant={opp.status === 'VERIFIED' ? 'yellow' : opp.status === 'PENDING_VERIFICATION' ? 'pink' : 'blue'} size="sm">
                        {opp.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {opp.status === 'PENDING_VERIFICATION' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle size={13} />}
                            onClick={() => handleVerify(opp.id, opp.title)}
                          >
                            Verify
                          </Button>
                        )}
                        <Button
                          variant="pink"
                          size="sm"
                          icon={<Trash2 size={13} />}
                          onClick={() => handleDelete(opp.id, opp.title)}
                        >
                          Delete
                        </Button>
                      </div>
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
