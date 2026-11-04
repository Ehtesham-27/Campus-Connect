import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, MapPin, Check, X, AlertCircle, Camera } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../auth/AuthContext';
import { MOCK_USER } from '../dashboard/mockData';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    college: '',
    course: '',
    branch: '',
    academicYear: '',
    semester: '',
    skills: '',
    interests: '',
  });

  // Sync form state whenever user changes or entering edit mode
  useEffect(() => {
    const activeUser = user || MOCK_USER;
    setFormData({
      fullName: activeUser.fullName || '',
      bio: activeUser.bio || 'Passionate about Full-Stack Web Development, Distributed Systems, and UI/UX design. Building student community tools and hackathon projects.',
      college: activeUser.college || '',
      course: activeUser.course || '',
      branch: activeUser.branch || '',
      academicYear: activeUser.academicYear || '',
      semester: activeUser.semester || '',
      skills: (activeUser.skills && activeUser.skills.length > 0)
        ? activeUser.skills.join(', ')
        : 'TypeScript, React.js, Node.js, Express, MongoDB, REST APIs, Figma',
      interests: (activeUser.interests && activeUser.interests.length > 0)
        ? activeUser.interests.join(', ')
        : 'Hackathons, Open Source, Autonomous Robotics, Competitive Programming, Debating',
    });
  }, [user, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const interestsArray = formData.interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      await updateProfile({
        fullName: formData.fullName,
        bio: formData.bio,
        college: formData.college,
        course: formData.course,
        branch: formData.branch,
        academicYear: formData.academicYear,
        semester: formData.semester,
        skills: skillsArray,
        interests: interestsArray,
      });

      setFeedbackMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedbackMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPEG, WEBP, or GIF).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMessage({ type: 'error', text: 'Image file size must not exceed 5MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    setFeedbackMessage(null);
    try {
      await uploadAvatar(file);
      setFeedbackMessage({ type: 'success', text: 'Profile picture updated successfully via Cloudinary!' });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedbackMessage({ type: 'error', text: error.message || 'Failed to upload profile photo.' });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeUser = user || MOCK_USER;
  const initials = activeUser.fullName
    ? activeUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CC';

  const displayedSkills: string[] = activeUser.skills && activeUser.skills.length > 0
    ? activeUser.skills
    : ['TypeScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Figma'];

  const displayedInterests: string[] = activeUser.interests && activeUser.interests.length > 0
    ? activeUser.interests
    : ['Hackathons', 'Open Source', 'Autonomous Robotics', 'Competitive Programming', 'Debating'];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <PageHeader
        title="Student Profile"
        tagline="Account • Personal Portfolio"
        description="View and manage your student profile information, skills, interests, and academic year."
        badgeText={user ? `${user.role?.toUpperCase()} ACCOUNT` : 'STUDENT ROLE (DEMO)'}
        badgeVariant={user?.role?.toLowerCase() === 'admin' ? 'pink' : 'blue'}
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="yellow" size="sm" onClick={() => navigate('/app')}>
              Dashboard
            </Button>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                icon={<Edit3 size={14} />}
                onClick={() => {
                  setFeedbackMessage(null);
                  setIsEditing(true);
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                icon={<X size={14} />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        }
      />

      {feedbackMessage && (
        <div
          style={{
            backgroundColor: feedbackMessage.type === 'success' ? 'var(--color-soft-teal-surface)' : '#FBEBEB',
            border: `2px solid ${feedbackMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`,
            boxShadow: `3px 3px 0px ${feedbackMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`,
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {feedbackMessage.type === 'success' ? (
            <Check size={18} color="var(--color-success)" />
          ) : (
            <AlertCircle size={18} color="var(--color-error)" />
          )}
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: feedbackMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {feedbackMessage.text}
          </span>
        </div>
      )}

      {/* Main Profile Card */}
      <Card surface="white" style={{ marginBottom: 'var(--space-6)' }}>
        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Edit Student Details
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="cc-input"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  College / University *
                </label>
                <input
                  type="text"
                  className="cc-input"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Course / Degree *
                </label>
                <input
                  type="text"
                  className="cc-input"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Branch / Department
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. Computer Science"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Academic Year
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. 3rd Year"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Semester
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="e.g. 5"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Bio
              </label>
              <textarea
                className="cc-input"
                rows={3}
                style={{ resize: 'vertical' }}
                value={formData.bio}
                maxLength={500}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Technical Skills (comma-separated)
              </label>
              <input
                type="text"
                className="cc-input"
                placeholder="React, Node.js, Python, Figma"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Interests & Hobbies (comma-separated)
              </label>
              <input
                type="text"
                className="cc-input"
                placeholder="Hackathons, AI, Open Source, Football"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" size="md" disabled={isSaving} icon={<Check size={16} />}>
                {isSaving ? 'Saving Changes...' : 'Save Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar src={activeUser.profileImage} initials={initials} size="xl" shape="rounded" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Camera size={13} />}
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 }}>
                    {activeUser.fullName}
                  </h2>
                  <Badge variant="yellow" size="sm" sticker rotate="right">
                    {activeUser.role?.toUpperCase() === 'ADMIN' ? 'VERIFIED ADMIN' : 'VERIFIED STUDENT'}
                  </Badge>
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                  {activeUser.course || 'Degree Program'} {activeUser.branch ? `in ${activeUser.branch}` : ''} • {activeUser.academicYear ? `${activeUser.academicYear}${activeUser.semester ? ` (Sem ${activeUser.semester})` : ''}` : (activeUser.yearOrSemester || 'Enrolled')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 'var(--space-2)', fontSize: '0.8rem', color: 'var(--color-ink-subtle)' }}>
                  <MapPin size={14} /> <span>{activeUser.college || 'Campus'}</span>
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', marginTop: 'var(--space-4)', lineHeight: 1.5 }}>
                  {activeUser.bio || 'Passionate about Full-Stack Web Development, Distributed Systems, and UI/UX design. Building student community tools and hackathon projects.'}
                </p>
              </div>
            </div>

            {/* Skills & Interests Tags */}
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: 'var(--border-thin) solid var(--color-ink-black)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                Technical Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: 'var(--space-4)' }}>
                {displayedSkills.map((s) => (
                  <Badge key={s} variant="yellow" size="md">
                    {s}
                  </Badge>
                ))}
              </div>

              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                Interests & Hobbies
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {displayedInterests.map((i) => (
                  <Badge key={i} variant="cream" size="md">
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
