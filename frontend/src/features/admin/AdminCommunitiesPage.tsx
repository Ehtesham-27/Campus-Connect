import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Trash2, Search, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminCommunityItem } from './adminApi';

export const AdminCommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<AdminCommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await adminApi.getCommunities({ search: searchTerm || undefined });
      setCommunities(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to load communities.' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete community "${name}"? This removes all memberships.`)) {
      return;
    }

    try {
      await adminApi.deleteCommunity(id);
      setFeedback({ type: 'success', message: `Community "${name}" has been deleted.` });
      fetchCommunities();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to delete community.' });
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
            COMMUNITY & SOCIETY MANAGEMENT
          </h1>
          <p style={{ color: 'var(--color-ink-subtle)', fontSize: '0.9rem', marginTop: '4px' }}>
            Moderate student clubs, review society memberships, and manage campus community listings.
          </p>
        </div>

        <Button variant="yellow" size="sm" icon={<RefreshCw size={14} />} onClick={fetchCommunities}>
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

      {/* Search Input */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
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
            placeholder="Search communities by name, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: '#ffffff', color: 'var(--color-primary-text)', paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {isLoading ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: '#102A43', color: '#ffffff' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-3) auto', color: 'var(--color-bright-yellow)' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Loading communities...</p>
        </Card>
      ) : communities.length === 0 ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-10)', backgroundColor: '#102A43', color: 'var(--color-ink-subtle)' }}>
          No registered communities found.
        </Card>
      ) : (
        <Card surface="white" style={{ color: 'var(--color-ink-black)', padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream)', borderBottom: 'var(--border-thick) solid var(--color-ink-black)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Society Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Lead Student</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Members</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>
                      {c.name}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary-text)', display: 'block', fontWeight: 400 }}>{c.description.slice(0, 75)}...</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant="blue" size="sm">{c.category}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{c.creator?.fullName || 'Anonymous'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{c.memberCount} members</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Button
                        variant="pink"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDelete(c.id, c.name)}
                      >
                        Delete
                      </Button>
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
