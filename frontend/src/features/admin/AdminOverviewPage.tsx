import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, Building, Award, AlertTriangle, Users2, BookOpen, RefreshCw, ArrowRight } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminOverviewResponse } from './adminApi';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOverview();
      setData(res);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to load administrative metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data
    ? [
        {
          label: 'Active Students',
          value: `${data.stats.activeStudents}`,
          badge: `${data.stats.totalStudents} total registered`,
          variant: 'blue' as const,
          icon: <Users size={22} />,
          action: () => navigate('/admin/students'),
        },
        {
          label: 'Campus Communities',
          value: `${data.stats.totalCommunities}`,
          badge: 'Verified student societies',
          variant: 'purple' as const,
          icon: <Building size={22} />,
          action: () => navigate('/admin/communities'),
        },
        {
          label: 'Live Opportunities',
          value: `${data.stats.totalOpportunities}`,
          badge: `${data.stats.pendingOpportunities} pending review`,
          variant: 'yellow' as const,
          icon: <Award size={22} />,
          action: () => navigate('/admin/opportunities'),
        },
        {
          label: 'Flagged Reports',
          value: `${data.stats.pendingReports}`,
          badge: `${data.stats.totalReports} total filed`,
          variant: 'pink' as const,
          icon: <AlertTriangle size={22} />,
          action: () => navigate('/admin/reports'),
        },
        {
          label: 'Team Finder Posts',
          value: `${data.stats.totalTeams}`,
          badge: 'Collaborative projects',
          variant: 'orange' as const,
          icon: <Users2 size={22} />,
          action: () => navigate('/app/team-finder'),
        },
        {
          label: 'Study Circles',
          value: `${data.stats.totalStudyCircles}`,
          badge: 'Peer learning groups',
          variant: 'purple' as const,
          icon: <BookOpen size={22} />,
          action: () => navigate('/app/study-circles'),
        },
      ]
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <Badge variant="yellow" size="sm" sticker rotate="left">
            ADMINISTRATIVE CONSOLE
          </Badge>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginTop: 'var(--space-2)', color: '#ffffff' }}>
            PLATFORM OVERVIEW & METRICS
          </h1>
          <p style={{ color: 'var(--color-ink-subtle)', fontSize: '0.9rem', marginTop: '4px' }}>
            Live database telemetry, verification queues, and moderation radar.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="yellow" size="sm" icon={<RefreshCw size={14} />} onClick={fetchOverview}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card surface="white" style={{ marginBottom: 'var(--space-6)', backgroundColor: 'var(--color-error)', color: '#ffffff', borderColor: 'var(--color-error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>{error}</p>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: '#102A43', color: '#ffffff' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-3) auto', color: 'var(--color-bright-yellow)' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Querying database statistics...</p>
        </Card>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
            {stats.map((stat) => (
              <Card
                key={stat.label}
                surface="white"
                interactive
                onClick={stat.action}
                style={{ color: 'var(--color-ink-black)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
                    {stat.label}
                  </span>
                  <span style={{ color: 'var(--color-ink-black)' }}>{stat.icon}</span>
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', margin: 'var(--space-2) 0' }}>
                  {stat.value}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant={stat.variant} size="sm">
                    {stat.badge}
                  </Badge>
                  <ArrowRight size={14} color="var(--color-ink-muted)" />
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Moderation Queue */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                Pending Moderation Queue ({data?.recentReports.length || 0})
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/reports')}>
                View All Reports
              </Button>
            </div>

            {data?.recentReports.length === 0 ? (
              <Card surface="white" style={{ backgroundColor: '#102A43', borderColor: 'var(--color-border)', color: 'var(--color-ink-subtle)', textAlign: 'center', padding: 'var(--space-6)' }}>
                All clear! No pending student reports requiring moderation action.
              </Card>
            ) : (
              <Card surface="white" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-cream)', borderBottom: 'var(--border-thick) solid var(--color-ink-black)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Target Type</th>
                      <th style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Reason</th>
                      <th style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Reporter</th>
                      <th style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentReports.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge variant="pink" size="sm">{r.targetType}</Badge>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.reason}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-secondary-text)' }}>{r.reporter}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-secondary-text)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <Button variant="yellow" size="sm" onClick={() => navigate('/admin/reports')}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};
