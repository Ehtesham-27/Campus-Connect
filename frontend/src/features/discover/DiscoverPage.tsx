import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, UserCheck, RefreshCw, AlertCircle, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StudentCard } from '../../components/ui/StudentCard';
import { discoverApi } from './discoverApi';
import type { DiscoveredStudent } from './discoverApi';
import { connectionApi } from '../connections/connectionApi';

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<DiscoveredStudent[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Detail Modal State
  const [activeStudent, setActiveStudent] = useState<DiscoveredStudent | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await discoverApi.getStudents({
        search: searchTerm || undefined,
        course: selectedCourse || undefined,
        academicYear: selectedYear || undefined,
      });
      setStudents(data.students);
      setTotalStudents(data.total);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to load campus student directory.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCourse, selectedYear]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCourse('');
    setSelectedYear('');
    setShowFilters(false);
  };

  const handleConnectClick = async (id: string) => {
    const student = students.find((s) => s.id === id);
    const name = student ? student.fullName : `Student #${id.slice(-4)}`;
    try {
      await connectionApi.sendRequest(id);
      setNotice(`Connection request dispatched to ${name}. Check your Connections tab for updates.`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || `Could not send connection request to ${name}.`);
    }
    setTimeout(() => setNotice(null), 6000);
  };

  return (
    <div>
      <PageHeader
        title="Discover Students"
        tagline="Module 1 • Student Directory"
        description="Find students with similar interests through real-time profile search, degree filters, and technical skill tags."
        badgeText="LIVE DIRECTORY"
        badgeVariant="blue"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              onClick={fetchStudents}
            >
              Refresh
            </Button>
            <Button variant="yellow" size="sm" onClick={() => navigate('/app')}>
              Dashboard
            </Button>
          </div>
        }
      />

      {/* Action Notification Banner */}
      {notice && (
        <div
          style={{
            backgroundColor: 'var(--color-soft-teal-surface)',
            border: '2px solid var(--color-success)',
            boxShadow: '3px 3px 0px var(--color-success)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} color="var(--color-success)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {notice}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} color="var(--color-success)" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#FBEBEB',
            border: '2px solid var(--color-error)',
            boxShadow: '3px 3px 0px var(--color-error)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} color="var(--color-error)" />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-error)', margin: 0, fontWeight: 600 }}>
            {errorMessage}
          </p>
        </div>
      )}

      {/* Search & Filter Controls */}
      <Card surface="white" style={{ marginBottom: 'var(--space-6)' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                className="cc-input"
                placeholder="Search by student name, branch, skills (e.g. React, AI, Robotics)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant={showFilters ? 'yellow' : 'outline'}
              size="md"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
            <Button type="submit" variant="primary" size="md" icon={<Search size={16} />}>
              Search
            </Button>
          </div>

          {/* Expandable Filter Tray */}
          {showFilters && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Degree / Course
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. B.Tech, MBA, BCA"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Academic Year
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. 1st Year, 3rd Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
                  Reset All
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-card)', fontWeight: 800 }}>
            {totalStudents} {totalStudents === 1 ? 'Student Profile' : 'Student Profiles'} Found
          </h2>
          <Badge variant="blue" size="sm">
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
          SEARCHING CAMPUS DIRECTORY...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && students.length === 0 && (
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
            <Search size={28} color="var(--color-ink-black)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
            NO STUDENTS MATCH YOUR QUERY
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-ink-muted)', maxWidth: '420px', margin: '0 auto var(--space-5) auto' }}>
            We couldn't find any registered students matching your search criteria. Try broadening your keywords or resetting filters.
          </p>
          <Button variant="yellow" size="md" onClick={handleResetFilters}>
            Clear Filters & Search
          </Button>
        </Card>
      )}

      {/* Grid of Real Student Cards */}
      {!isLoading && students.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setActiveStudent(student)}
              style={{ cursor: 'pointer' }}
            >
              <StudentCard
                id={student.id}
                fullName={student.fullName}
                course={student.course}
                branch={student.branch}
                yearOrSemester={student.yearOrSemester}
                bio={student.bio}
                interests={student.interests}
                skills={student.skills}
                profileImageUrl={student.profileImageUrl}
                onConnect={(id) => {
                  handleConnectClick(id);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Student Profile Details Modal */}
      {activeStudent && (
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
          onClick={() => setActiveStudent(null)}
        >
          <div
            style={{ maxWidth: '600px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card surface="white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Avatar initials={activeStudent.fullName} size="xl" shape="rounded" />
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                      {activeStudent.fullName}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                      {activeStudent.course} {activeStudent.branch ? `• ${activeStudent.branch}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStudent(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-ink-subtle)', marginBottom: 'var(--space-3)' }}>
                <MapPin size={15} /> <span>{activeStudent.college}</span>
                <span style={{ margin: '0 0.3rem' }}>•</span>
                <BookOpen size={15} /> <span>{activeStudent.yearOrSemester || 'Enrolled'}</span>
              </div>

              {activeStudent.bio && (
                <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--color-cream)', border: 'var(--border-thin) solid var(--color-ink-black)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                    {activeStudent.bio}
                  </p>
                </div>
              )}

              {activeStudent.skills && activeStudent.skills.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: 'var(--space-2)' }}>
                    <Sparkles size={14} color="var(--color-electric-blue)" />
                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      Skills
                    </strong>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {activeStudent.skills.map((skill) => (
                      <Badge key={skill} variant="yellow" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeStudent.interests && activeStudent.interests.length > 0 && (
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <strong style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                    Interests & Hobbies
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {activeStudent.interests.map((interest) => (
                      <Badge key={interest} variant="cream" size="sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <Button variant="outline" size="md" onClick={() => setActiveStudent(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<UserCheck size={16} />}
                  onClick={() => {
                    handleConnectClick(activeStudent.id);
                    setActiveStudent(null);
                  }}
                >
                  Connect
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
