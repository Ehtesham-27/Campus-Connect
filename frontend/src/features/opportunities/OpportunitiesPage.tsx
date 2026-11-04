import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  Briefcase,
  ExternalLink,
  Trash2,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { OpportunityCard } from '../../components/ui/OpportunityCard';
import { opportunityApi } from './opportunityApi';
import type {
  OpportunityItem,
  CreateOpportunityPayload,
} from './opportunityApi';
import { useAuth } from '../auth/AuthContext';

const TYPES = ['All', 'Internship', 'Hackathon', 'Scholarship', 'Workshop', 'Competition'];

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeType, setActiveType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [upcomingOnly, setUpcomingOnly] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal State
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateOpportunityPayload>({
    title: '',
    type: 'Internship',
    organiser: '',
    description: '',
    deadline: '',
    eligibility: '',
    location: 'Campus / Online',
    link: '',
  });

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await opportunityApi.getOpportunities({
        type: activeType === 'All' ? undefined : activeType,
        search: searchTerm || undefined,
        upcomingOnly,
      });
      setOpportunities(data.opportunities);
      setTotalCount(data.total);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load opportunities.' });
    } finally {
      setIsLoading(false);
    }
  }, [activeType, searchTerm, upcomingOnly]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.deadline || !createForm.organiser.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields (title, organiser, deadline).' });
      return;
    }

    setIsSubmitting(true);
    try {
      await opportunityApi.createOpportunity(createForm);
      setFeedback({ type: 'success', message: 'Opportunity posted successfully!' });
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        type: 'Internship',
        organiser: '',
        description: '',
        deadline: '',
        eligibility: '',
        location: 'Campus / Online',
        link: '',
      });
      fetchOpportunities();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to post opportunity.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await opportunityApi.deleteOpportunity(id);
      setFeedback({ type: 'success', message: 'Opportunity removed successfully.' });
      if (selectedOpp && selectedOpp.id === id) {
        setSelectedOpp(null);
      }
      fetchOpportunities();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to delete opportunity.' });
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const opp = await opportunityApi.getOpportunityById(id);
      setSelectedOpp(opp);
    } catch {
      const localMatch = opportunities.find((o) => o.id === id);
      if (localMatch) setSelectedOpp(localMatch);
    }
  };

  const calculateIsClosingSoon = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  };

  const formatDeadline = (deadlineStr: string) => {
    try {
      const date = new Date(deadlineStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return deadlineStr;
    }
  };

  const canManage = (opp: OpportunityItem) => {
    if (!user) return false;
    const isOwner = opp.creator && String(opp.creator.id) === String(user.id);
    const isAdmin = String(user.role).toLowerCase() === 'admin';
    return isOwner || isAdmin;
  };

  return (
    <div style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Header Banner */}
      <PageHeader
        title="Opportunities"
        tagline="Module 4 • Curated Career & Competitions"
        description="Discover student internships, hackathons, workshops, scholarships, and campus competitions with verified organizers and real deadlines."
        badgeText="ACTIVE"
        badgeVariant="orange"
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="orange"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Post Opportunity
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/app')}>
              Dashboard
            </Button>
          </div>
        }
      />

      {/* Alert / Feedback Notification */}
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
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card surface="white" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Top row: search & toggle */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
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
                placeholder="Search opportunities by title, organiser, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  border: 'var(--border-thin) solid var(--color-ink-black)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setUpcomingOnly(!upcomingOnly)}
                style={{
                  padding: '0.55rem 0.9rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-thick) solid var(--color-ink-black)',
                  cursor: 'pointer',
                  backgroundColor: upcomingOnly ? 'var(--color-bright-yellow)' : 'var(--color-cream)',
                  color: 'var(--color-ink-black)',
                  boxShadow: upcomingOnly ? 'var(--shadow-sm)' : 'none',
                  transform: upcomingOnly ? 'translate(-1px, -1px)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Clock size={14} />
                Upcoming Deadlines Only
              </button>

              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw size={14} />}
                onClick={fetchOpportunities}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-thick) solid var(--color-ink-black)',
                  cursor: 'pointer',
                  backgroundColor: activeType === type ? 'var(--color-vivid-orange)' : 'var(--color-white)',
                  color: activeType === type ? 'var(--color-white)' : 'var(--color-ink-black)',
                  boxShadow: activeType === type ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                  transform: activeType === type ? 'translate(-2px, -2px)' : 'none',
                  transition: 'var(--transition-bounce)',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Listing Content */}
      {isLoading ? (
        <Card surface="cream" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <RefreshCw
            size={32}
            style={{
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-4) auto',
              color: 'var(--color-vivid-orange)',
            }}
          />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Loading Opportunities...</h3>
          <p style={{ color: 'var(--color-ink-muted)', marginTop: 'var(--space-2)' }}>
            Retrieving latest campus career opportunities and events.
          </p>
        </Card>
      ) : opportunities.length === 0 ? (
        <Card
          surface="cream"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            border: 'var(--border-thick) dashed var(--color-ink-black)',
          }}
        >
          <Sparkles size={40} style={{ margin: '0 auto var(--space-3) auto', color: 'var(--color-vivid-orange)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800 }}>
            No Opportunities Found
          </h2>
          <p style={{ color: 'var(--color-ink-muted)', maxWidth: '420px', margin: 'var(--space-2) auto var(--space-6) auto' }}>
            {searchTerm || activeType !== 'All' || upcomingOnly
              ? 'No matching opportunities for your current filters. Try relaxing your search criteria.'
              : 'Be the first to post a campus competition, scholarship, or internship for fellow students!'}
          </p>
          <Button
            variant="orange"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Post an Opportunity
          </Button>
        </Card>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-ink-muted)',
              }}
            >
              Showing {opportunities.length} of {totalCount} Opportunities
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                id={opp.id}
                title={opp.title}
                type={opp.type}
                organiser={opp.organiser}
                deadline={formatDeadline(opp.deadline)}
                eligibility={opp.eligibility}
                isClosingSoon={calculateIsClosingSoon(opp.deadline)}
                onView={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opportunity Details Modal */}
      {selectedOpp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
          onClick={() => setSelectedOpp(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOpp(null)}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                background: 'var(--color-cream)',
                border: 'var(--border-thick) solid var(--color-ink-black)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Badge variant="orange" size="sm">
                {selectedOpp.type}
              </Badge>
              {calculateIsClosingSoon(selectedOpp.deadline) && (
                <Badge variant="pink" size="sm">
                  CLOSING SOON
                </Badge>
              )}
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                fontWeight: 900,
                color: 'var(--color-ink-black)',
                marginBottom: 'var(--space-3)',
                paddingRight: 'var(--space-8)',
              }}
            >
              {selectedOpp.title}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-thin) solid var(--color-ink-black)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Briefcase size={16} color="var(--color-ink-muted)" />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>
                    ORGANISER
                  </span>
                  <strong style={{ fontSize: 'var(--text-xs)' }}>{selectedOpp.organiser}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Calendar size={16} color="var(--color-ink-muted)" />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>
                    DEADLINE
                  </span>
                  <strong style={{ fontSize: 'var(--text-xs)' }}>{formatDeadline(selectedOpp.deadline)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MapPin size={16} color="var(--color-ink-muted)" />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>
                    LOCATION
                  </span>
                  <strong style={{ fontSize: 'var(--text-xs)' }}>{selectedOpp.location || 'Campus / Online'}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-muted)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Eligibility
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--color-white)',
                  padding: 'var(--space-3)',
                  border: 'var(--border-thin) solid var(--color-ink-black)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {selectedOpp.eligibility}
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-muted)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Details & Instructions
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedOpp.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: 'var(--border-thick) solid var(--color-ink-black)',
                paddingTop: 'var(--space-4)',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                {canManage(selectedOpp) && (
                  <Button
                    variant="pink"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDelete(selectedOpp.id)}
                  >
                    Delete Listing
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {selectedOpp.link ? (
                  <a
                    href={selectedOpp.link.startsWith('http') ? selectedOpp.link : `https://${selectedOpp.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="orange" size="sm" icon={<ExternalLink size={14} />}>
                      Apply / Visit Website
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setSelectedOpp(null)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                background: 'var(--color-cream)',
                border: 'var(--border-thick) solid var(--color-ink-black)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-lg)',
                fontWeight: 900,
                marginBottom: 'var(--space-4)',
              }}
            >
              Post Campus Opportunity
            </h2>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer AI Research Internship 2026"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thin) solid var(--color-ink-black)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    Type *
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-thin) solid var(--color-ink-black)',
                      fontFamily: 'var(--font-body)',
                      background: 'var(--color-white)',
                    }}
                  >
                    {TYPES.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-thin) solid var(--color-ink-black)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    Organiser *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Developers Student Club"
                    value={createForm.organiser}
                    onChange={(e) => setCreateForm({ ...createForm, organiser: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-thin) solid var(--color-ink-black)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Lab 4 / Virtual"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-thin) solid var(--color-ink-black)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Eligibility Criteria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd & 3rd Year CSE/IT students, min 7.0 CGPA"
                  value={createForm.eligibility}
                  onChange={(e) => setCreateForm({ ...createForm, eligibility: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thin) solid var(--color-ink-black)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Application / Registration Link
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/apply"
                  value={createForm.link}
                  onChange={(e) => setCreateForm({ ...createForm, link: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thin) solid var(--color-ink-black)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Description & Guidelines *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete event/role details, perks, stipend (if any), and application steps..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thin) solid var(--color-ink-black)',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="orange" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
