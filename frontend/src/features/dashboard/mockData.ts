/**
 * Campus Connect — Visual Development Fixtures
 * 
 * ============================================================================
 * ARCHITECTURAL NOTICE (QA AUDIT - MILESTONE 1):
 * These fixtures exist SOLELY for visual design and layout verification.
 * They MUST NEVER be imported into API clients, services, or auth guards.
 * All data here will be superseded by real REST API endpoints in Phase 2-4.
 * ============================================================================
 */

export interface MockStudent {
  id: string;
  fullName: string;
  course: string;
  branch: string;
  yearOrSemester: string;
  bio: string;
  interests: string[];
  skills: string[];
}

export interface MockCommunity {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  accentColor: 'blue' | 'yellow' | 'pink' | 'purple' | 'orange';
}

export interface MockFeedPost {
  id: string;
  title: string;
  category: 'ANNOUNCEMENT' | 'SOCIETY_UPDATE' | 'CAMPUS_EVENT';
  author: string;
  authorRole: string;
  communityName?: string;
  timeAgo: string;
  content: string;
  badgeVariant: 'yellow' | 'orange' | 'blue' | 'pink';
}

export interface MockOpportunity {
  id: string;
  title: string;
  type: 'Hackathon' | 'Internship' | 'Workshop' | 'Scholarship';
  organiser: string;
  deadline: string;
  eligibility: string;
  isClosingSoon: boolean;
}

export interface MockCollaboration {
  teamRequest: {
    id: string;
    title: string;
    project: string;
    openRoles: string[];
    skillsNeeded: string[];
    teamSize: string;
    author: string;
  };
  studyCircle: {
    id: string;
    subject: string;
    topic: string;
    meetingSchedule: string;
    membersCount: number;
    facilitator: string;
  };
}

import type { User } from '../../types';

export const MOCK_USER: User = {
  id: 'usr-mock-alex',
  fullName: 'Alex Sharma',
  email: 'alex.sharma@dtu.ac.in',
  role: 'STUDENT',
  status: 'ACTIVE',
  course: 'B.Tech',
  branch: 'Computer Science & Engineering',
  yearOrSemester: '3rd Year (Sem 5)',
  academicYear: '3rd Year (Sem 5)',
  college: 'Delhi Technological University',
  bio: 'Passionate about Full-Stack Web Development, Distributed Systems, and UI/UX design. Building student community tools and hackathon projects.',
  skills: ['TypeScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Figma'],
  interests: ['Hackathons', 'Open Source', 'Autonomous Robotics', 'Competitive Programming', 'Debating'],
  createdAt: new Date().toISOString(),
};

export const MOCK_FEATURED_STUDENTS: MockStudent[] = [
  {
    id: 'stu-101',
    fullName: 'Priya Narang',
    course: 'B.Tech',
    branch: 'CSE AI & Data',
    yearOrSemester: '3rd Year',
    bio: 'Passionate about Computer Vision, PyTorch, and building accessibility tools for university students.',
    interests: ['Machine Learning', 'Open Source', 'Hackathons'],
    skills: ['Python', 'PyTorch', 'React'],
  },
  {
    id: 'stu-102',
    fullName: 'Rohan Mehta',
    course: 'B.Des',
    branch: 'Interaction Design',
    yearOrSemester: '2nd Year',
    bio: 'UI/UX enthusiast, Figma wizard, and typography geek. Looking for hackathon teammates!',
    interests: ['Product Design', 'Visual Identity', 'Typography'],
    skills: ['Figma', 'Prototyping', 'Design Systems'],
  },
  {
    id: 'stu-103',
    fullName: 'Ananya Iyer',
    course: 'B.Tech',
    branch: 'Electronics & Comm',
    yearOrSemester: '4th Year',
    bio: 'Robotics enthusiast, IoT hardware hacker, and President of the Robotics & Automation Society.',
    interests: ['Robotics', 'Embedded Systems', 'IoT'],
    skills: ['C++', 'Arduino', 'ROS', 'Circuit Design'],
  },
];

export const MOCK_FEATURED_COMMUNITIES: MockCommunity[] = [
  {
    id: 'com-201',
    name: 'Robotics & Automation Guild',
    category: 'Technology & Hardware',
    description: 'Autonomous rovers, drone simulations, competitive line-followers, and IoT hardware hacking lab sessions.',
    memberCount: 342,
    accentColor: 'blue',
  },
  {
    id: 'com-202',
    name: 'Society of Creative Coders',
    category: 'Web3 & Open Source',
    description: 'Weekly build sessions, hackathons, open-source sprints, and peer technical code reviews.',
    memberCount: 512,
    accentColor: 'orange',
  },
  {
    id: 'com-203',
    name: 'Literary & Parliamentary Debate Club',
    category: 'Arts & Culture',
    description: 'National parliamentary debate tournaments, campus model UNs, and weekly philosophical roundtables.',
    memberCount: 188,
    accentColor: 'purple',
  },
];

export const MOCK_RECENT_FEED: MockFeedPost[] = [
  {
    id: 'feed-301',
    title: 'HackCampus 2026 Official Registration Opened',
    category: 'ANNOUNCEMENT',
    author: 'Campus Student Council',
    authorRole: 'Official Notice',
    timeAgo: '2 hours ago',
    content: 'Registration for the 36-hour flagship hackathon is now open. Taking place November 28-30 in the Central Auditorium. Cash prizes over $5,000.',
    badgeVariant: 'yellow',
  },
  {
    id: 'feed-302',
    title: 'Guest Lecture: Scalable Systems by Google Principal Engineer',
    category: 'CAMPUS_EVENT',
    author: 'Computer Society of India (CSI)',
    authorRole: 'Tech Society',
    communityName: 'Society of Creative Coders',
    timeAgo: '5 hours ago',
    content: 'Join us this Friday at 4 PM in Seminar Hall 2 for an interactive talk on building resilient distributed cloud architectures.',
    badgeVariant: 'blue',
  },
  {
    id: 'feed-303',
    title: 'Autumn Cultural Fest Volunteer Call is Out',
    category: 'SOCIETY_UPDATE',
    author: 'Campus Cultural Board',
    authorRole: 'Student Society',
    communityName: 'Literary & Parliamentary Debate Club',
    timeAgo: '1 day ago',
    content: 'Calling all stage managers, sound technicians, and content creators for the upcoming Fest. Registration closes this Sunday.',
    badgeVariant: 'pink',
  },
];

export const MOCK_FEATURED_OPPORTUNITIES: MockOpportunity[] = [
  {
    id: 'opp-401',
    title: 'Google Summer Software Engineering Internship 2027',
    type: 'Internship',
    organiser: 'Google University Programs',
    deadline: 'Nov 20, 2026',
    eligibility: 'Pre-final year B.Tech/B.E. students',
    isClosingSoon: true,
  },
  {
    id: 'opp-402',
    title: 'National Smart Mobility Hackathon',
    type: 'Hackathon',
    organiser: 'Ministry of Transport & NITI Aayog',
    deadline: 'Dec 05, 2026',
    eligibility: 'Teams of 3-4 college students',
    isClosingSoon: false,
  },
  {
    id: 'opp-403',
    title: 'Merit Academic Research Grant 2026',
    type: 'Scholarship',
    organiser: 'Dean of Academic Research',
    deadline: 'Dec 15, 2026',
    eligibility: 'GPA >= 8.5, published or pending paper',
    isClosingSoon: false,
  },
];

export const MOCK_COLLABORATION: MockCollaboration = {
  teamRequest: {
    id: 'team-501',
    title: 'HealthTech AI Diagnostic App',
    project: 'Smart India Hackathon 2026',
    openRoles: ['React Frontend Dev', 'UI/UX Designer'],
    skillsNeeded: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    teamSize: '2 / 4 Filled',
    author: 'Karan Saxena (4th Year)',
  },
  studyCircle: {
    id: 'study-601',
    subject: 'Algorithms & Advanced Data Structures',
    topic: 'Dynamic Programming & Graph Theory',
    meetingSchedule: 'Tuesdays & Thursdays, 5:30 PM • Library B',
    membersCount: 8,
    facilitator: 'Ritu Verma (TA)',
  },
};
