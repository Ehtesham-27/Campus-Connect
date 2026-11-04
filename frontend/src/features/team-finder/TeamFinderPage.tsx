import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Rocket,
  Search,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { teamApi } from './teamApi';
import type {
  TeamRequestItem,
  TeamDetailResponse,
  CreateTeamPayload,
  ApplyTeamPayload,
} from './teamApi';
import { useAuth } from '../auth/AuthContext';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Capstone',
  'Research',
  'Open Source',
  'Startup',
  'Course Project',
];

export const TeamFinderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teams, setTeams] = useState<TeamRequestItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal State
  const [selectedTeam, setSelectedTeam] = useState<TeamDetailResponse | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateTeamPayload>({
    title: '',
    context: '',
    category: 'Hackathon',
    description: '',
    requiredSkills: [],
    teamSize: 4,
    openPositions: 2,
    deadline: '',
  });
  const [skillsInput, setSkillsInput] = useState<string>('');

  // Apply State
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [applyingTeamId, setApplyingTeamId] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyTeamPayload>({
    message: '',
    skills: [],
  });
  const [applySkillsInput, setApplySkillsInput] = useState<string>('');

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await teamApi.getTeams({
        category: activeCategory === 'All' ? undefined : activeCategory,
        search: searchTerm || undefined,
        status: 'OPEN',
      });
      setTeams(data.teams);
      setTotalCount(data.total);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load team requests.' });
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const loadTeamDetails = async (id: string) => {
    try {
      const details = await teamApi.getTeamById(id);
      setSelectedTeam(details);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load team details.' });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setFeedback({ type: 'error', message: 'Title and description are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await teamApi.createTeam({
        ...createForm,
        requiredSkills: skills,
      });

      setFeedback({ type: 'success', message: 'Team request published successfully!' });
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        context: '',
        category: 'Hackathon',
        description: '',
        requiredSkills: [],
        teamSize: 4,
        openPositions: 2,
        deadline: '',
      });
      setSkillsInput('');
      fetchTeams();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to create team request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingTeamId) return;

    setIsSubmitting(true);
    try {
      const skills = applySkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await teamApi.applyToTeam(applyingTeamId, {
        message: applyForm.message,
        skills,
      });

      setFeedback({ type: 'success', message: 'Application submitted! The team lead will review your profile.' });
      setShowApplyModal(false);
      setApplyingTeamId(null);
      setApplyForm({ message: '', skills: [] });
      setApplySkillsInput('');
      fetchTeams();

      if (selectedTeam && selectedTeam.id === applyingTeamId) {
        loadTeamDetails(applyingTeamId);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to apply to team.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await teamApi.updateApplicationStatus(appId, status);
      setFeedback({ type: 'success', message: `Application ${status.toLowerCase()}!` });
      if (selectedTeam) {
        loadTeamDetails(selectedTeam.id);
      }
      fetchTeams();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to update application.' });
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team request?')) return;
    try {
      await teamApi.deleteTeam(id);
      setFeedback({ type: 'success', message: 'Team request deleted successfully.' });
      setSelectedTeam(null);
      fetchTeams();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to delete team request.' });
    }
  };

  return (
    <div style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Page Header */}
      <PageHeader
        title="Team Finder"
        tagline="Module 1 • Hackathon & Project Teammates"
        description="Find teammates for hackathons, capstones, and competitions. Publish project requests, specify required skills, and receive join applications."
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
              Post Team Request
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
                placeholder="Search team requests by title, hackathon, required skills (e.g. React, Python, ROS)..."
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
            <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={fetchTeams}>
              Refresh
            </Button>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-thick) solid var(--color-ink-black)',
                  cursor: 'pointer',
                  backgroundColor: activeCategory === cat ? 'var(--color-vivid-orange)' : 'var(--color-white)',
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
        </div>
      </Card>

      {/* Team Listings */}
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
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Loading Team Requests...</h3>
          <p style={{ color: 'var(--color-ink-muted)', marginTop: 'var(--space-2)' }}>
            Retrieving open project and hackathon teams.
          </p>
        </Card>
      ) : teams.length === 0 ? (
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
            No Team Requests Found
          </h2>
          <p style={{ color: 'var(--color-ink-muted)', maxWidth: '440px', margin: 'var(--space-2) auto var(--space-6) auto' }}>
            {searchTerm || activeCategory !== 'All'
              ? 'No matching teams for your current filters. Try relaxing your search criteria.'
              : 'Be the first to post a hackathon or capstone project team request to recruit campus peers!'}
          </p>
          <Button
            variant="orange"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Post a Team Request
          </Button>
        </Card>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
              Showing {teams.length} of {totalCount} Open Teams
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {teams.map((team) => (
              <Card key={team.id} surface="white" interactive style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="orange" size="sm" sticker rotate="left">
                    {team.context || team.category}
                  </Badge>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--color-ink-black)',
                      color: 'var(--color-bright-yellow)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {team.memberCount} / {team.teamSize} Members • {team.openPositions} Open
                  </span>
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
                  {team.title}
                </h3>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                  Led by {team.creator?.fullName || 'Anonymous'} {team.creator?.course ? `(${team.creator.course})` : ''}
                </p>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--color-ink-black)',
                    marginTop: 'var(--space-3)',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {team.description}
                </p>

                {/* Required Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'var(--space-3)' }}>
                  {team.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="yellow" size="sm" withShadow={false}>
                      {skill}
                    </Badge>
                  ))}
                </div>

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
                    onClick={() => loadTeamDetails(team.id)}
                  >
                    View Details
                  </Button>

                  {team.isCreator ? (
                    <Badge variant="blue" size="sm">
                      YOUR TEAM
                    </Badge>
                  ) : team.hasApplied ? (
                    <Badge
                      variant={
                        team.myApplicationStatus === 'ACCEPTED'
                          ? 'yellow'
                          : team.myApplicationStatus === 'REJECTED'
                          ? 'pink'
                          : 'orange'
                      }
                      size="sm"
                    >
                      {team.myApplicationStatus === 'ACCEPTED' ? 'JOINED' : `APPLIED (${team.myApplicationStatus})`}
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Rocket size={14} />}
                      onClick={() => {
                        setApplyingTeamId(team.id);
                        setShowApplyModal(true);
                      }}
                    >
                      Apply to Join
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team Details & Applications Modal */}
      {selectedTeam && (
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
          onClick={() => setSelectedTeam(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTeam(null)}
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
                {selectedTeam.context || selectedTeam.category}
              </Badge>
              <Badge variant="yellow" size="sm">
                {selectedTeam.category}
              </Badge>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                fontWeight: 900,
                color: 'var(--color-ink-black)',
                marginBottom: 'var(--space-2)',
                paddingRight: 'var(--space-8)',
              }}
            >
              {selectedTeam.title}
            </h2>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
              Created by {selectedTeam.creator?.fullName} • {selectedTeam.creator?.college} ({selectedTeam.creator?.course})
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
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>TEAM CAPACITY</span>
                <strong style={{ fontSize: 'var(--text-xs)' }}>
                  {selectedTeam.members.length} / {selectedTeam.teamSize} Members
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>OPEN POSITIONS</span>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-vivid-orange)' }}>
                  {selectedTeam.openPositions} spots remaining
                </strong>
              </div>
              {selectedTeam.deadline && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>DEADLINE</span>
                  <strong style={{ fontSize: 'var(--text-xs)' }}>
                    {new Date(selectedTeam.deadline).toLocaleDateString()}
                  </strong>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-1)' }}>
                Required Skills & Tech Stack
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {selectedTeam.requiredSkills.map((s) => (
                  <Badge key={s} variant="yellow" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-1)' }}>
                Project Description & Goals
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedTeam.description}
              </p>
            </div>

            {/* Current Team Members */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-2)' }}>
                Current Team Roster ({selectedTeam.members.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {selectedTeam.members.map((m) => (
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
                    <Avatar initials={m.fullName} size="sm" shape="rounded" />
                    <div>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, display: 'block' }}>{m.fullName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>{m.course}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* If Creator: Show Received Applications */}
            {selectedTeam.isCreator && (
              <div
                style={{
                  borderTop: 'var(--border-thick) solid var(--color-ink-black)',
                  paddingTop: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 900 }}>
                    Received Join Applications ({selectedTeam.applications.length})
                  </h4>
                </div>

                {selectedTeam.applications.length === 0 ? (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                    No students have applied to this team request yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {selectedTeam.applications.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          padding: 'var(--space-3)',
                          backgroundColor: app.status === 'ACCEPTED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : 'var(--color-cream)',
                          border: 'var(--border-thin) solid var(--color-ink-black)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Avatar initials={app.applicant?.fullName || 'Student'} size="sm" shape="rounded" />
                            <div>
                              <strong style={{ fontSize: 'var(--text-xs)' }}>{app.applicant?.fullName}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block' }}>
                                {app.applicant?.course} • {app.applicant?.college}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={app.status === 'ACCEPTED' ? 'yellow' : app.status === 'REJECTED' ? 'pink' : 'orange'}
                            size="sm"
                          >
                            {app.status}
                          </Badge>
                        </div>

                        {app.message && (
                          <p style={{ fontSize: 'var(--text-xs)', fontStyle: 'italic', marginTop: 'var(--space-2)' }}>
                            "{app.message}"
                          </p>
                        )}

                        {app.skills && app.skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 'var(--space-2)' }}>
                            {app.skills.map((sk) => (
                              <span key={sk} style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-white)', padding: '0.1rem 0.35rem', border: '1px solid var(--color-ink-black)', borderRadius: '3px' }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}

                        {app.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<XCircle size={14} />}
                              onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle size={14} />}
                              onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                            >
                              Accept to Team
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                {(selectedTeam.isCreator || String(user?.role).toLowerCase() === 'admin') && (
                  <Button
                    variant="pink"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeleteTeam(selectedTeam.id)}
                  >
                    Delete Team
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {!selectedTeam.isCreator && !selectedTeam.hasApplied && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Rocket size={14} />}
                    onClick={() => {
                      setApplyingTeamId(selectedTeam.id);
                      setShowApplyModal(true);
                    }}
                  >
                    Apply to Join
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedTeam(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
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
              Publish Team Finder Request
            </h2>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Project / Team Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Campus Navigation Drone System"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Category *
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)', background: 'var(--color-white)' }}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Context / Event
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SIH 2026 / Capstone"
                    value={createForm.context}
                    onChange={(e) => setCreateForm({ ...createForm, context: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Total Team Size *
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    required
                    value={createForm.teamSize}
                    onChange={(e) => setCreateForm({ ...createForm, teamSize: parseInt(e.target.value, 10) || 4 })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Open Positions Needed *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={createForm.teamSize - 1}
                    required
                    value={createForm.openPositions}
                    onChange={(e) => setCreateForm({ ...createForm, openPositions: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Required Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, TypeScript, Node.js, OpenCV"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Project Description & Requirements *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your idea, what you've built so far, and what specific roles you need..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="orange" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Publishing...' : 'Publish Team'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply to Team Modal */}
      {showApplyModal && (
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
          onClick={() => setShowApplyModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: 'var(--space-6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowApplyModal(false)}
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

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 900, marginBottom: 'var(--space-3)' }}>
              Apply to Join Team
            </h2>

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Message to Team Lead *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Introduce yourself, your past projects, and how you can contribute to this project..."
                  value={applyForm.message}
                  onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Your Relevant Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, UI Design"
                  value={applySkillsInput}
                  onChange={(e) => setApplySkillsInput(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin) solid var(--color-ink-black)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending Application...' : 'Send Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
