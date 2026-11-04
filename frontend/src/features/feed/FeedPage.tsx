import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Radio, Trash2, Edit2, X, Check, RefreshCw, AlertCircle, ShieldCheck, Search } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { feedApi } from './feedApi';
import type { FeedPostItem, CreatePostPayload } from './feedApi';
import { useAuth } from '../auth/AuthContext';

const CATEGORIES = [
  { label: 'All Notices', value: 'ALL' },
  { label: 'Announcements', value: 'ANNOUNCEMENT' },
  { label: 'Society Updates', value: 'SOCIETY_UPDATE' },
  { label: 'Campus Events', value: 'CAMPUS_EVENT' },
  { label: 'General', value: 'GENERAL' },
];

export const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreatePostPayload>({
    title: '',
    content: '',
    category: 'ANNOUNCEMENT',
  });

  // Edit Post State
  const [editingPost, setEditingPost] = useState<FeedPostItem | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await feedApi.getPosts({
        category: activeCategory,
        search: searchTerm || undefined,
      });
      setPosts(data.posts);
      setTotalPosts(data.total);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load campus feed notices.' });
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await feedApi.createPost(createForm);
      setFeedback({ type: 'success', message: 'Your announcement has been published to the campus feed.' });
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', category: 'ANNOUNCEMENT' });
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to publish post.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setIsSubmitting(true);
    try {
      await feedApi.updatePost(editingPost.id, {
        title: editingPost.title,
        content: editingPost.content,
        category: editingPost.category,
      });
      setFeedback({ type: 'success', message: 'Post updated successfully.' });
      setEditingPost(null);
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to update post.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this campus post?')) return;
    try {
      await feedApi.deletePost(postId);
      setFeedback({ type: 'success', message: 'Post has been removed from the campus feed.' });
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to delete post.' });
    }
  };

  const canManagePost = (post: FeedPostItem) => {
    if (!user) return false;
    const isAuthor = post.author?.id === user.id;
    const isAdmin = user.role?.toLowerCase() === 'admin';
    return isAuthor || isAdmin;
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <PageHeader
        title="Campus Feed"
        tagline="Module 3 • Campus Noticeboard"
        description="Centralize scattered college information, campus announcements, society updates, and event notices in one feed."
        badgeText="REAL-TIME FEED"
        badgeVariant="orange"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              onClick={fetchPosts}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Post Notice
            </Button>
            <Button variant="yellow" size="sm" onClick={() => navigate('/app')}>
              Dashboard
            </Button>
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            backgroundColor: feedback.type === 'success' ? 'var(--color-soft-teal-surface)' : '#FBEBEB',
            border: `2px solid ${feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`,
            boxShadow: `3px 3px 0px ${feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`,
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {feedback.type === 'success' ? <Check size={18} color="var(--color-success)" /> : <AlertCircle size={18} color="var(--color-error)" />}
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}>
              {feedback.message}
            </span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setActiveCategory(c.value)}
            style={{
              padding: '0.5rem 0.9rem',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              borderRadius: 'var(--radius-md)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              cursor: 'pointer',
              backgroundColor: activeCategory === c.value ? 'var(--color-vivid-orange)' : 'var(--color-white)',
              color: activeCategory === c.value ? 'var(--color-white)' : 'var(--color-ink-black)',
              boxShadow: activeCategory === c.value ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              transform: activeCategory === c.value ? 'translate(-2px, -2px)' : 'none',
              transition: 'var(--transition-bounce)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <Card surface="white" style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            type="text"
            className="cc-input"
            placeholder="Search feed notices by headline or content keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
          />
          <Button variant="primary" size="md" icon={<Search size={16} />} onClick={fetchPosts}>
            Search
          </Button>
        </div>
      </Card>

      {/* Header Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-card)', fontWeight: 800 }}>
            {totalPosts} {totalPosts === 1 ? 'Notice' : 'Notices'} Published
          </h2>
          <Badge variant="yellow" size="sm">
            MONGODB FEED
          </Badge>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            padding: 'var(--space-12) 0',
            textAlign: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--color-ink-muted)',
          }}
        >
          LOADING CAMPUS NOTICEBOARD...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && (
        <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-cream)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4) auto',
            }}
          >
            <Radio size={28} color="var(--color-ink-black)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
            NO NOTICES FOUND
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-ink-muted)', maxWidth: '420px', margin: '0 auto var(--space-5) auto' }}>
            There are currently no announcements matching this category. Be the first to publish a verified notice!
          </p>
          <Button variant="yellow" size="md" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            Create New Notice
          </Button>
        </Card>
      )}

      {/* Stream of Feed Cards (Strict: NO unapproved likes, comments, or reaction counts) */}
      {!isLoading && posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {posts.map((post) => (
            <Card key={post.id} surface="white" className="cc-feed-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Badge variant={post.badgeVariant} size="sm">
                    {post.category.replace('_', ' ')}
                  </Badge>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem' }}>
                    {post.author?.fullName || 'Verified Member'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                    • {formatTimestamp(post.createdAt)}
                  </span>
                </div>

                {/* Author / Moderator Controls */}
                {canManagePost(post) && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 size={13} />}
                      onClick={() => setEditingPost(post)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={13} color="var(--color-error)" />}
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, margin: 'var(--space-2) 0' }}>
                {post.title}
              </h3>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>
                  <ShieldCheck size={14} color="var(--color-success)" />
                  <span>
                    Verified Notice • Role: {post.author?.role?.toUpperCase() || 'STUDENT'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            zIndex: 100,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div style={{ maxWidth: '580px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <Card surface="white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  Publish Campus Notice
                </h2>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Notice Headline *
                  </label>
                  <input
                    type="text"
                    className="cc-input"
                    placeholder="e.g. Annual Inter-College Hackathon Registrations Open"
                    required
                    maxLength={150}
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    className="cc-input"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  >
                    <option value="ANNOUNCEMENT">Campus Announcement</option>
                    <option value="CAMPUS_EVENT">Campus Event</option>
                    <option value="SOCIETY_UPDATE">Society Update</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Content *
                  </label>
                  <textarea
                    className="cc-input"
                    rows={5}
                    placeholder="Write details of the announcement, venue, dates, or eligibility..."
                    required
                    maxLength={5000}
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <Button type="button" variant="outline" size="md" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={isSubmitting} icon={<Check size={16} />}>
                    {isSubmitting ? 'Publishing...' : 'Publish Notice'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            zIndex: 100,
          }}
          onClick={() => setEditingPost(null)}
        >
          <div style={{ maxWidth: '580px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <Card surface="white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  Edit Notice
                </h2>
                <button type="button" onClick={() => setEditingPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Notice Headline *
                  </label>
                  <input
                    type="text"
                    className="cc-input"
                    required
                    maxLength={150}
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    className="cc-input"
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value as any })}
                  >
                    <option value="ANNOUNCEMENT">Campus Announcement</option>
                    <option value="CAMPUS_EVENT">Campus Event</option>
                    <option value="SOCIETY_UPDATE">Society Update</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Content *
                  </label>
                  <textarea
                    className="cc-input"
                    rows={5}
                    required
                    maxLength={5000}
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <Button type="button" variant="outline" size="md" onClick={() => setEditingPost(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={isSubmitting} icon={<Check size={16} />}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
