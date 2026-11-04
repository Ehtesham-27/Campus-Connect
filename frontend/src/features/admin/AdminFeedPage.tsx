import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Trash2, Pin, Search, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminFeedPostItem } from './adminApi';

export const AdminFeedPage: React.FC = () => {
  const [posts, setPosts] = useState<AdminFeedPostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await adminApi.getFeedPosts({ search: searchTerm || undefined });
      setPosts(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to load feed posts.' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete post "${title}"?`)) return;
    try {
      await adminApi.deleteFeedPost(id);
      setFeedback({ type: 'success', message: `Post "${title}" has been removed from the feed.` });
      fetchPosts();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to delete post.' });
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const res = await adminApi.togglePinPost(id);
      setFeedback({
        type: 'success',
        message: res.isPinned ? 'Post pinned to top of campus feed.' : 'Post unpinned.',
      });
      fetchPosts();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFeedback({ type: 'error', message: e.message || 'Failed to update pin status.' });
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
            CAMPUS FEED MODERATION
          </h1>
          <p style={{ color: 'var(--color-ink-subtle)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review, pin, and moderate student announcements and society notices.
          </p>
        </div>

        <Button variant="yellow" size="sm" icon={<RefreshCw size={14} />} onClick={fetchPosts}>
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

      {/* Search Bar */}
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
            placeholder="Search feed notices by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: '#ffffff', color: 'var(--color-primary-text)', paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {isLoading ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: '#102A43', color: '#ffffff' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-3) auto', color: 'var(--color-bright-yellow)' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Loading feed notices...</p>
        </Card>
      ) : posts.length === 0 ? (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-10)', backgroundColor: '#102A43', color: 'var(--color-ink-subtle)' }}>
          No campus feed posts found.
        </Card>
      ) : (
        <Card surface="white" style={{ color: 'var(--color-ink-black)', padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-cream)', borderBottom: 'var(--border-thick) solid var(--color-ink-black)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Notice Title</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Author</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Pinned</th>
                  <th style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>
                      {post.title}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary-text)', display: 'block', fontWeight: 400 }}>{post.content.slice(0, 80)}...</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant="orange" size="sm">{post.category}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{post.author?.fullName || 'Anonymous'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {post.isPinned ? <Badge variant="yellow" size="sm">PINNED</Badge> : <span style={{ color: 'var(--color-ink-subtle)', fontSize: '0.75rem' }}>Standard</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Button
                          variant={post.isPinned ? 'yellow' : 'outline'}
                          size="sm"
                          icon={<Pin size={13} />}
                          onClick={() => handleTogglePin(post.id)}
                        >
                          {post.isPinned ? 'Unpin' : 'Pin'}
                        </Button>
                        <Button
                          variant="pink"
                          size="sm"
                          icon={<Trash2 size={13} />}
                          onClick={() => handleDelete(post.id, post.title)}
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
