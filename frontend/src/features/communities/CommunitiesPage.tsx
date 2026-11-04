import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, X, Check, RefreshCw, AlertCircle, Camera } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CommunityCard } from '../../components/ui/CommunityCard';
import { communityApi } from './communityApi';
import { useAuth } from '../auth/AuthContext';
import type {
  CommunityItem,
  CommunityMember,
  CreateCommunityPayload,
} from './communityApi';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Social',
  'Literary',
  'Entrepreneurship',
];

export const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [totalCommunities, setTotalCommunities] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal State
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const communityFileInputRef = useRef<HTMLInputElement>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateCommunityPayload>({
    name: '',
    category: 'Technical',
    description: '',
    accentColor: 'blue',
  });

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await communityApi.getCommunities({
        search: searchTerm || undefined,
        category: activeCategory === 'All' ? undefined : activeCategory,
      });
      setCommunities(data.communities);
      setTotalCommunities(data.total);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load college communities.' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleJoinLeave = async (community: CommunityItem) => {
    try {
      if (community.isMember) {
        await communityApi.leaveCommunity(community.id);
        setFeedback({ type: 'success', message: `You have left ${community.name}.` });
      } else {
        await communityApi.joinCommunity(community.id);
        setFeedback({ type: 'success', message: `Welcome! You are now a member of ${community.name}.` });
      }
      fetchCommunities();
      if (selectedCommunity && selectedCommunity.id === community.id) {
        loadCommunityDetails(community.id);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Unable to update membership.' });
    }
  };

  const loadCommunityDetails = async (id: string) => {
    setIsLoadingMembers(true);
    try {
      const [comm, membersData] = await Promise.all([
        communityApi.getCommunityById(id),
        communityApi.getMembers(id),
      ]);
      setSelectedCommunity(comm);
      setCommunityMembers(membersData.members);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load community details.' });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await communityApi.createCommunity(createForm);
      setFeedback({ type: 'success', message: `Community '${createForm.name}' has been created!` });
      setShowCreateModal(false);
      setCreateForm({ name: '', category: 'Technical', description: '', accentColor: 'blue' });
      fetchCommunities();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to create community.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCommunityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCommunity) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (PNG, JPEG, WEBP, or GIF).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image size cannot exceed 5MB.' });
      return;
    }

    setIsUploadingImage(true);
    setFeedback(null);
    try {
      const res = await communityApi.uploadImage(selectedCommunity.id, file, 'avatar');
      setFeedback({ type: 'success', message: 'Community badge photo uploaded successfully via Cloudinary!' });
      setSelectedCommunity({
        ...selectedCommunity,
        avatarImage: res.imageUrl,
      });
      fetchCommunities();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to upload community image.' });
    } finally {
      setIsUploadingImage(false);
      if (communityFileInputRef.current) communityFileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <PageHeader
        title="College Communities"
        tagline="Module 2 • Campus Societies & Clubs"
        description="Browse and join college societies, clubs, and interest groups. View community activities, announcements, and peer updates."
        badgeText="COMMUNITIES DIRECTORY"
        badgeVariant="purple"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              onClick={fetchCommunities}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Register Club
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
            {feedback.type === 'success' ? (
              <Check size={18} color="var(--color-success)" />
            ) : (
              <AlertCircle size={18} color="var(--color-error)" />
            )}
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              }}
            >
              {feedback.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card surface="white" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="cc-input"
              placeholder="Search societies by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="primary" size="md" icon={<Search size={16} />} onClick={fetchCommunities}>
            Search
          </Button>
        </div>
      </Card>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              borderRadius: 'var(--radius-md)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              cursor: 'pointer',
              backgroundColor: activeCategory === cat ? 'var(--color-deep-purple)' : 'var(--color-white)',
              color: activeCategory === cat ? 'var(--color-white)' : 'var(--color-ink-black)',
              boxShadow: activeCategory === cat ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              transform: activeCategory === cat ? 'translate(-2px, -2px)' : 'none',
              transition: 'var(--transition-bounce)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-card)', fontWeight: 800 }}>
            {totalCommunities} {totalCommunities === 1 ? 'Community' : 'Communities'} Registered
          </h2>
          <Badge variant="yellow" size="sm">
            MONGODB DIRECTORY
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
          LOADING COLLEGE CLUBS & SOCIETIES...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && communities.length === 0 && (
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
            <Users size={28} color="var(--color-ink-black)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
            NO COMMUNITIES FOUND
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-ink-muted)', maxWidth: '420px', margin: '0 auto var(--space-5) auto' }}>
            No societies match this category or keyword. Be the first to register a new student community!
          </p>
          <Button variant="yellow" size="md" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            Register New Club
          </Button>
        </Card>
      )}

      {/* Communities Grid */}
      {!isLoading && communities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
          {communities.map((club) => (
            <CommunityCard
              key={club.id}
              id={club.id}
              name={club.name}
              category={club.category}
              description={club.description}
              memberCount={club.memberCount}
              accentColor={club.accentColor}
              onJoin={() => handleJoinLeave(club)}
              onView={() => loadCommunityDetails(club.id)}
            />
          ))}
        </div>
      )}

      {/* Create Community Modal */}
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
          <div style={{ maxWidth: '540px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <Card surface="white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  Register Student Community
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Society / Club Name *
                  </label>
                  <input
                    type="text"
                    className="cc-input"
                    placeholder="e.g. Autonomous Robotics Society"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="cc-input"
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                      Accent Color
                    </label>
                    <select
                      className="cc-input"
                      value={createForm.accentColor}
                      onChange={(e) => setCreateForm({ ...createForm, accentColor: e.target.value })}
                    >
                      <option value="blue">Electric Blue</option>
                      <option value="orange">Vivid Orange</option>
                      <option value="yellow">Bright Yellow</option>
                      <option value="pink">Hot Pink</option>
                      <option value="purple">Deep Purple</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    Description *
                  </label>
                  <textarea
                    className="cc-input"
                    rows={3}
                    placeholder="Describe the mission, activities, and goals of this society..."
                    required
                    maxLength={1000}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <Button type="button" variant="outline" size="md" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={isCreating} icon={<Check size={16} />}>
                    {isCreating ? 'Registering...' : 'Register Society'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Community Details & Members Modal */}
      {selectedCommunity && (
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
          onClick={() => setSelectedCommunity(null)}
        >
          <div style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Card surface="white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <Badge variant={selectedCommunity.accentColor} size="sm" sticker rotate="left" style={{ marginBottom: 'var(--space-2)' }}>
                    {selectedCommunity.category}
                  </Badge>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                    {selectedCommunity.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCommunity(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <span>{selectedCommunity.memberCount} Members</span>
                {selectedCommunity.creator && (
                  <>
                    <span>•</span>
                    <span>Founded by {selectedCommunity.creator.fullName}</span>
                  </>
                )}
                {(user?.role?.toLowerCase() === 'admin' || (selectedCommunity.creator && (selectedCommunity.creator.id === user?.id || (selectedCommunity.creator as any)._id === user?.id))) && (
                  <>
                    <input
                      type="file"
                      ref={communityFileInputRef}
                      onChange={handleCommunityImageUpload}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Camera size={13} />}
                      disabled={isUploadingImage}
                      onClick={() => communityFileInputRef.current?.click()}
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload Club Logo'}
                    </Button>
                  </>
                )}
              </div>

              <div style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)', backgroundColor: 'var(--color-cream)', border: 'var(--border-thin) solid var(--color-ink-black)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                  {selectedCommunity.description}
                </p>
              </div>

              {/* Members Section */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: 'var(--space-3)' }}>
                  <Users size={16} color="var(--color-deep-purple)" />
                  <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Society Members ({communityMembers.length})
                  </strong>
                </div>

                {isLoadingMembers ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>Loading members...</p>
                ) : communityMembers.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>No members listed yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {communityMembers.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-2) var(--space-3)',
                          border: 'var(--border-thin) solid var(--color-ink-black)',
                          backgroundColor: 'var(--color-white)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700 }}>
                            {m.fullName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                            {m.course ? `(${m.course})` : ''}
                          </span>
                        </div>
                        <Badge
                          variant={m.membershipRole === 'owner' ? 'pink' : m.membershipRole === 'admin' ? 'yellow' : 'cream'}
                          size="sm"
                          withShadow={false}
                        >
                          {m.membershipRole.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: 'var(--border-thin) solid var(--color-ink-black)', paddingTop: 'var(--space-4)' }}>
                <Button variant="outline" size="md" onClick={() => setSelectedCommunity(null)}>
                  Close
                </Button>
                <Button
                  variant={selectedCommunity.isMember ? 'outline' : 'primary'}
                  size="md"
                  onClick={() => handleJoinLeave(selectedCommunity)}
                >
                  {selectedCommunity.isMember ? 'Leave Community' : 'Join Society'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
