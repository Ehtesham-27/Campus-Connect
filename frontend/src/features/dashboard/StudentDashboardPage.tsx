import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Radio,
  Rocket,
  Compass,
  GraduationCap,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { StudentCard } from '../../components/ui/StudentCard';
import { CommunityCard } from '../../components/ui/CommunityCard';
import { OpportunityCard } from '../../components/ui/OpportunityCard';
import { useAuth } from '../auth/AuthContext';
import { feedApi, type FeedPostItem } from '../feed/feedApi';
import { discoverApi, type DiscoveredStudent } from '../discover/discoverApi';
import { communityApi, type CommunityItem } from '../communities/communityApi';
import { opportunityApi, type OpportunityItem } from '../opportunities/opportunityApi';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [students, setStudents] = useState<DiscoveredStudent[]>([]);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [feedRes, discRes, commRes, oppRes] = await Promise.allSettled([
        feedApi.getPosts({}),
        discoverApi.getStudents({}),
        communityApi.getCommunities({}),
        opportunityApi.getOpportunities({ upcomingOnly: true }),
      ]);

      if (feedRes.status === 'fulfilled') setPosts((feedRes.value.posts || []).slice(0, 3));
      if (discRes.status === 'fulfilled') setStudents((discRes.value.students || []).slice(0, 4));
      if (commRes.status === 'fulfilled') setCommunities((commRes.value.communities || []).slice(0, 4));
      if (oppRes.status === 'fulfilled') setOpportunities((oppRes.value.opportunities || []).slice(0, 3));
    } catch {
      setErrorNotice('Unable to load some live campus activity. Please refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const studentName = user?.fullName || 'Student';
  const studentCollege = user?.college || 'Campus Connect';
  const academicContext = user?.academicYear
    ? `${user.academicYear}${user.semester ? ` • Semester ${user.semester}` : ''}`
    : user?.semester
    ? `Semester ${user.semester}`
    : 'Active Session';

  return (
    <div className="cc-dashboard">
      {/* ====================================================================
          1. WELCOME HERO SECTION (Maximalist Editorial Composition)
         ==================================================================== */}
      <section className="cc-dashboard-hero">
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="yellow" size="sm" sticker rotate="left">
              CAMPUS CONNECT • DIGITAL HUB
            </Badge>
            <Badge variant="pink" size="sm" sticker rotate="right">
              {studentCollege}
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: 'var(--color-ink-black)',
                color: 'var(--color-bright-yellow)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-bright-yellow)',
              }}
            >
              <GraduationCap size={14} />
              {academicContext.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Editorial Headline */}
        <h1 className="cc-hero-title">
          WHAT'S HAPPENING ON YOUR CAMPUS TODAY
        </h1>

        {/* Welcome Greeting & Summary */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            maxWidth: '720px',
            lineHeight: 1.5,
            color: 'var(--color-cream)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Welcome, <strong>{studentName}</strong>
          {user?.course ? ` (${user.course}${user.branch ? ` • ${user.branch}` : ''})` : ''}.
          Centralize scattered college information, stay updated on society activities, find project teammates, and access verified student opportunities.
        </p>

        {/* Quick Action Navigation Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <Button
            variant="yellow"
            size="md"
            icon={<Radio size={16} />}
            onClick={() => navigate('/app/feed')}
          >
            Browse Campus Feed
          </Button>

          <Button
            variant="orange"
            size="md"
            icon={<Compass size={16} />}
            onClick={() => navigate('/app/discover')}
          >
            Discover Students
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={<Rocket size={16} />}
            onClick={() => navigate('/app/team-finder')}
          >
            Find Teammates
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={fetchDashboardData}
          >
            Refresh Hub
          </Button>
        </div>
      </section>

      {errorNotice && (
        <div
          style={{
            backgroundColor: '#FBEBEB',
            border: '2px solid var(--color-error)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            color: 'var(--color-error)',
          }}
        >
          {errorNotice}
        </div>
      )}

      {/* ====================================================================
          2. ASYMMETRIC TWO-COLUMN EDITORIAL LAYOUT
         ==================================================================== */}
      <div className="cc-dashboard-layout">
        {/* ==================================================================
            LEFT COLUMN: Campus Feed, Student Discovery, & Communities
           ================================================================== */}
        <div className="cc-dashboard-column">
          {/* CAMPUS ACTIVITY (FEED) SECTION */}
          <section>
            <SectionHeading
              title="Recent Campus Activity"
              subtitle="Official announcements, society updates, and verified notices from across campus."
              badgeText="CAMPUS NOTICEBOARD"
              badgeVariant="orange"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                  onClick={() => navigate('/app/feed')}
                >
                  View All Feed
                </Button>
              }
            />

            {isLoading && posts.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Loading recent announcements...
              </p>
            ) : posts.length === 0 ? (
              <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', margin: 0 }}>
                  No campus announcements published yet.
                </p>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <Button variant="yellow" size="sm" onClick={() => navigate('/app/feed')}>
                    Publish First Notice
                  </Button>
                </div>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {posts.map((post) => (
                  <Card key={post.id} surface="white" className="cc-feed-post-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Badge variant={post.badgeVariant} size="sm">
                          {post.category.replace('_', ' ')}
                        </Badge>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 800 }}>
                          {post.author?.fullName || 'Campus Member'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                          • {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {post.isPinned && (
                        <Badge variant="yellow" size="sm">
                          PINNED
                        </Badge>
                      )}
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        marginBottom: 'var(--space-2)',
                        lineHeight: 1.25,
                      }}
                    >
                      {post.title}
                    </h3>

                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-body)',
                        color: 'var(--color-ink-black)',
                        lineHeight: 1.45,
                      }}
                    >
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
                      <button
                        type="button"
                        onClick={() => navigate('/app/feed')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: 'var(--color-electric-blue)',
                          textDecoration: 'underline',
                        }}
                      >
                        Read Full Notice →
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* DISCOVER STUDENTS SECTION */}
          <section>
            <SectionHeading
              title="Campus Peers & Collaborators"
              subtitle="Connect with peers in your degree, branch, and complementary skillsets."
              badgeText="STUDENT DIRECTORY"
              badgeVariant="yellow"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                  onClick={() => navigate('/app/discover')}
                >
                  Explore Students
                </Button>
              }
            />

            {isLoading && students.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Loading student profiles...
              </p>
            ) : students.length === 0 ? (
              <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', margin: 0 }}>
                  No other student profiles registered yet.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {students.map((student) => (
                  <StudentCard
                    key={student.id}
                    id={student.id}
                    fullName={student.fullName}
                    course={student.course}
                    branch={student.branch}
                    yearOrSemester={student.yearOrSemester}
                    bio={student.bio}
                    interests={student.interests}
                    skills={student.skills}
                    profileImageUrl={student.profileImage}
                    onConnect={() => navigate('/app/discover')}
                  />
                ))}
              </div>
            )}
          </section>

          {/* FEATURED COMMUNITIES SECTION */}
          <section>
            <SectionHeading
              title="College Societies & Clubs"
              subtitle="Join recognized student clubs, creative guilds, and competitive academic groups."
              badgeText="CAMPUS SOCIETIES"
              badgeVariant="purple"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                  onClick={() => navigate('/app/communities')}
                >
                  Explore Communities
                </Button>
              }
            />

            {isLoading && communities.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Loading societies...
              </p>
            ) : communities.length === 0 ? (
              <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', margin: 0 }}>
                  No societies created yet. Start one for your campus!
                </p>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <Button variant="yellow" size="sm" onClick={() => navigate('/app/communities')}>
                    Create Society
                  </Button>
                </div>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {communities.map((club) => (
                  <CommunityCard
                    key={club.id}
                    id={club.id}
                    name={club.name}
                    category={club.category}
                    description={club.description}
                    memberCount={club.memberCount}
                    accentColor={club.accentColor}
                    onView={() => navigate('/app/communities')}
                    onJoin={() => navigate('/app/communities')}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ==================================================================
            RIGHT COLUMN: Opportunities & Collaboration
           ================================================================== */}
        <div className="cc-dashboard-column">
          {/* OPPORTUNITIES HIGHLIGHT SECTION */}
          <section>
            <SectionHeading
              title="Featured Opportunities"
              subtitle="Hand-vetted internships, hackathons, and scholarships."
              badgeText="DEADLINES"
              badgeVariant="yellow"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                  onClick={() => navigate('/app/opportunities')}
                >
                  All Opps
                </Button>
              }
            />

            {isLoading && opportunities.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Loading opportunities...
              </p>
            ) : opportunities.length === 0 ? (
              <Card surface="white" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', margin: 0 }}>
                  No active opportunities listed right now.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {opportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    id={opp.id}
                    title={opp.title}
                    type={opp.type}
                    organiser={opp.organiser}
                    deadline={opp.deadline}
                    eligibility={opp.eligibility}
                    isClosingSoon={new Date(opp.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000}
                    onView={() => navigate('/app/opportunities')}
                  />
                ))}
              </div>
            )}
          </section>

          {/* COLLABORATION MODULE SHORTCUTS */}
          <section>
            <SectionHeading
              title="Peer Collaboration"
              subtitle="Team up for hackathons or connect with subject study partners."
              badgeText="COLLABORATE"
              badgeVariant="orange"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {/* Team Finder Highlight Card */}
              <Card surface="yellow" interactive className="cc-team-finder-highlight">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="black" size="sm" sticker rotate="left">
                    TEAM FINDER MODULE
                  </Badge>
                  <Rocket size={18} />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginTop: 'var(--space-2)',
                    lineHeight: 1.2,
                  }}
                >
                  Find Hackathon & Project Teammates
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--color-ink-black)',
                    marginTop: 'var(--space-2)',
                    lineHeight: 1.45,
                  }}
                >
                  Publish requests, filter by required skills, and receive applicant pitches for upcoming competitions.
                </p>

                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-3)',
                    borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Rocket size={14} />}
                    onClick={() => navigate('/app/team-finder')}
                  >
                    Open Team Finder
                  </Button>
                </div>
              </Card>

              {/* Study Circle Highlight Card */}
              <Card surface="purple" interactive className="cc-study-circle-highlight">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="yellow" size="sm" sticker rotate="right">
                    STUDY CIRCLES MODULE
                  </Badge>
                  <BookOpen size={18} color="var(--color-bright-yellow)" />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--color-white)',
                    lineHeight: 1.2,
                  }}
                >
                  Join Subject Study Groups
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--color-cream)',
                    marginTop: 'var(--space-2)',
                    lineHeight: 1.45,
                  }}
                >
                  Study together by course and topic. Form peer study sessions and review difficult concepts as a cohort.
                </p>

                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-3)',
                    borderTop: 'var(--border-thin) solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="yellow"
                    size="sm"
                    icon={<BookOpen size={14} />}
                    onClick={() => navigate('/app/study-circles')}
                  >
                    Explore Study Circles
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
export default StudentDashboardPage;
