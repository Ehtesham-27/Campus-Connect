import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Clock,
  Users,
  Search,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Trash2,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { studyCircleApi } from './studyCircleApi';
import type {
  StudyCircleItem,
  StudyCircleMember,
  CreateStudyCirclePayload,
} from './studyCircleApi';
import { useAuth } from '../auth/AuthContext';

const LEVELS = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Core Exam Prep',
  'Interview Prep',
];

export const StudyCirclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [circles, setCircles] = useState<StudyCircleItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLevel, setActiveLevel] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal State
  const [selectedCircle, setSelectedCircle] = useState<StudyCircleItem | null>(null);
  const [circleMembers, setCircleMembers] = useState<StudyCircleMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateStudyCirclePayload>({
    subject: '',
    topic: '',
    course: 'All Departments',
    description: '',
    schedule: '',
    level: 'Intermediate',
  });

  const fetchCircles = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await studyCircleApi.getCircles({
        level: activeLevel === 'All' ? undefined : activeLevel,
        search: searchTerm || undefined,
      });
      setCircles(data.circles);
      setTotalCount(data.total);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load study circles.' });
    } finally {
      setIsLoading(false);
    }
  }, [activeLevel, searchTerm]);

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  const loadCircleDetails = async (id: string) => {
    setIsLoadingMembers(true);
    try {
      const [circleData, membersData] = await Promise.all([
        studyCircleApi.getCircleById(id),
        studyCircleApi.getMembers(id),
      ]);
      setSelectedCircle(circleData);
      setCircleMembers(membersData);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load circle details.' });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleJoinLeave = async (circle: StudyCircleItem) => {
    try {
      if (circle.isMember) {
        await studyCircleApi.leaveCircle(circle.id);
        setFeedback({ type: 'success', message: `You have left ${circle.subject}.` });
      } else {
        await studyCircleApi.joinCircle(circle.id);
        setFeedback({ type: 'success', message: `You have joined ${circle.subject}!` });
      }
      fetchCircles();
      if (selectedCircle && selectedCircle.id === circle.id) {
        loadCircleDetails(circle.id);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to update membership.' });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.subject.trim() || !createForm.topic.trim() || !createForm.description.trim()) {
      setFeedback({ type: 'error', message: 'Subject, focus topic, and description are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await studyCircleApi.createCircle(createForm);
      setFeedback({ type: 'success', message: 'Study circle established successfully!' });
      setShowCreateModal(false);
      setCreateForm({
        subject: '',
        topic: '',
        course: 'All Departments',
        description: '',
        schedule: '',
        level: 'Intermediate',
      });
      fetchCircles();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to create study circle.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCircle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study circle?')) return;
    try {
      await studyCircleApi.deleteCircle(id);
      setFeedback({ type: 'success', message: 'Study circle deleted successfully.' });
      setSelectedCircle(null);
      fetchCircles();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to delete study circle.' });
    }
  };

  return (
    <div style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Page Header */}
      <PageHeader
        title="Study Circles"
        tagline="Module 2 • Subject-Based Peer Learning"
        description="Find classmates and study partners through subject-based groups and peer learning sessions. Boost exam prep, solve problem sets, and master topics together."
        badgeText="ACTIVE"
        badgeVariant="purple"
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="yellow"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Start Study Circle
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/app')}>
              Dashboard
            </Button>
          </div>
        }
      />

      {/* Feedback Alert */}
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
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <Card surface="white" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
                placeholder="Search circles by subject, focus topic, venue, schedule..."
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
            <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={fetchCircles}>
              Refresh
            </Button>
          </div>

          {/* Level Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevel(lvl)}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-thick) solid var(--color-ink-black)',
                  cursor: 'pointer',
                  backgroundColor: activeLevel === lvl ? 'var(--color-deep-purple)' : 'var(--color-white)',
                  color: activeLevel === lvl ? 'var(--color-white)' : 'var(--color-ink-black)',
                  boxShadow: activeLevel === lvl ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                  transform: activeLevel === lvl ? 'translate(-2px, -2px)' : 'none',
                  transition: 'var(--transition-bounce)',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Circle Listings */}
      {isLoading ? (
        <Card surface="cream" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <RefreshCw
            size={32}
            style={{
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-4) auto',
              color: 'var(--color-deep-purple)',
            }}
          />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Loading Study Circles...</h3>
          <p style={{ color: 'var(--color-ink-muted)', marginTop: 'var(--space-2)' }}>
            Retrieving campus subject groups and review circles.
          </p>
        </Card>
      ) : circles.length === 0 ? (
        <Card
          surface="cream"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            border: 'var(--border-thick) dashed var(--color-ink-black)',
          }}
        >
          <Sparkles size={40} style={{ margin: '0 auto var(--space-3) auto', color: 'var(--color-deep-purple)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800 }}>
            No Study Circles Found
          </h2>
          <p style={{ color: 'var(--color-ink-muted)', maxWidth: '440px', margin: 'var(--space-2) auto var(--space-6) auto' }}>
            {searchTerm || activeLevel !== 'All'
              ? 'No matching study circles for your search criteria. Try a different topic or level.'
              : 'Be the first to start a study circle for upcoming exams, algorithms prep, or course review!'}
          </p>
          <Button
            variant="yellow"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Start a Study Circle
          </Button>
        </Card>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
              Showing {circles.length} of {totalCount} Study Circles
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {circles.map((circle) => (
              <Card key={circle.id} surface="white" interactive style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="purple" size="sm" sticker rotate="right">
                    {circle.level}
                  </Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Users size={14} />
                    <span>{circle.memberCount} Students</span>
                  </div>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    marginTop: 'var(--space-2)',
                    lineHeight: 1.25,
                  }}
                >
                  {circle.subject}
                </h3>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink-black)', marginTop: 'var(--space-2)' }}>
                  Focus: <strong>{circle.topic}</strong>
                </p>

                {circle.schedule && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.78rem',
                      color: 'var(--color-electric-blue)',
                      fontWeight: 600,
                      marginTop: 'var(--space-3)',
                    }}
                  >
                    <Clock size={14} />
                    <span>{circle.schedule}</span>
                  </div>
                )}

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: 'var(--space-2)' }}>
                  Facilitated by {circle.creator?.fullName || 'Campus Peer'} {circle.creator?.course ? `(${circle.creator.course})` : ''}
                </p>

                {/* Footer Actions */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--space-4)',
                    borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadCircleDetails(circle.id)}
                  >
                    View Details
                  </Button>

                  {circle.isCreator ? (
                    <Badge variant="yellow" size="sm">
                      ORGANISER
                    </Badge>
                  ) : (
                    <Button
                      variant={circle.isMember ? 'outline' : 'yellow'}
                      size="sm"
                      icon={circle.isMember ? <LogOut size={14} /> : <BookOpen size={14} />}
                      onClick={() => handleJoinLeave(circle)}
                    >
                      {circle.isMember ? 'Leave Circle' : 'Join Circle'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Circle Details & Members Modal */}
      {selectedCircle && (
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
          onClick={() => setSelectedCircle(null)}
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
              onClick={() => setSelectedCircle(null)}
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
              <Badge variant="purple" size="sm">
                {selectedCircle.level}
              </Badge>
              <Badge variant="yellow" size="sm">
                {selectedCircle.memberCount} MEMBERS
              </Badge>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                fontWeight: 900,
                color: 'var(--color-ink-black)',
                marginBottom: 'var(--space-1)',
                paddingRight: 'var(--space-8)',
              }}
            >
              {selectedCircle.subject}
            </h2>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-black)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Topic: {selectedCircle.topic}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-thin) solid var(--color-ink-black)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="var(--color-ink-muted)" />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>SCHEDULE</span>
                  <strong style={{ fontSize: 'var(--text-xs)' }}>{selectedCircle.schedule || 'Flexible Sessions'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GraduationCap size={16} color="var(--color-ink-muted)" />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>ELIGIBLE COURSES</span>
                  <strong style={{ fontSize: 'var(--text-xs)' }}>{selectedCircle.course || 'All Departments'}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-1)' }}>
                Description & Learning Objectives
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedCircle.description}
              </p>
            </div>

            {/* Enrolled Members */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-2)' }}>
                Enrolled Study Partners ({circleMembers.length})
              </h4>
              {isLoadingMembers ? (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>Loading peer members...</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
                  {circleMembers.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 0.65rem',
                        backgroundColor: 'var(--color-cream)',
                        border: 'var(--border-thin) solid var(--color-ink-black)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Avatar initials={m.user?.fullName || 'Peer'} size="sm" shape="rounded" />
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, display: 'block' }}>{m.user?.fullName}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-muted)' }}>
                          {m.role === 'LEAD' ? '⭐ Circle Lead' : m.user?.course || 'Member'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                borderTop: 'var(--border-thick) solid var(--color-ink-black)',
                paddingTop: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                {(selectedCircle.isCreator || String(user?.role).toLowerCase() === 'admin') && (
                  <Button
                    variant="pink"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeleteCircle(selectedCircle.id)}
                  >
                    Delete Circle
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {!selectedCircle.isCreator && (
                  <Button
                    variant={selectedCircle.isMember ? 'outline' : 'yellow'}
                    size="sm"
                    icon={selectedCircle.isMember ? <LogOut size={14} /> : <BookOpen size={14} />}
                    onClick={() => handleJoinLeave(selectedCircle)}
                  >
                    {selectedCircle.isMember ? 'Leave Circle' : 'Join Circle'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedCircle(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Study Circle Modal */}
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

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 900, marginBottom: 'var(--space-4)' }}>
              Start a Peer Study Circle
            </h2>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Focus Topic / Module *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paxos, Raft Consensus & Byzantine Fault Tolerance"
                  value={createForm.topic}
                  onChange={(e) => setCreateForm({ ...createForm, topic: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Study Level *
                  </label>
                  <select
                    value={createForm.level}
                    onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)', background: 'var(--color-white)' }}
                  >
                    {LEVELS.filter((l) => l !== 'All').map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE / IT"
                    value={createForm.course}
                    onChange={(e) => setCreateForm({ ...createForm, course: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Schedule & Meeting Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mondays & Thursdays, 5:00 PM • Library Hall B"
                  value={createForm.schedule}
                  onChange={(e) => setCreateForm({ ...createForm, schedule: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Description & Learning Objectives *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline syllabus coverage, prerequisites, problem sheet discussion format, and goals..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="yellow" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Study Circle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
