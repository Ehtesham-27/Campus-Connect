import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let inMemoryServer = null;

/**
 * Connect to MongoDB instance with resilient fallback in development mode.
 */
export async function connectDB() {
  // 1. Attempt connection to configured MONGODB_URI (e.g. local daemon or Atlas)
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed: ${error.message}`);

    // 2. In development mode, auto-fallback to embedded local dev database
    if (ENV.NODE_ENV === 'development') {
      try {
        console.log('[MongoDB] Starting embedded development database with persistence...');

        // Find cached mongod binary if available
        const possibleBinaryPaths = [
          path.resolve(__dirname, '../../../../node_modules/.cache/mongodb-memory-server/mongod-x64-win32-8.2.6.exe'),
          path.resolve(__dirname, '../../../node_modules/.cache/mongodb-memory-server/mongod-x64-win32-8.2.6.exe'),
        ];
        const existingBinary = possibleBinaryPaths.find((p) => fs.existsSync(p));

        const devDbPath = path.resolve(__dirname, '../../.dev-mongodb');
        if (!fs.existsSync(devDbPath)) {
          fs.mkdirSync(devDbPath, { recursive: true });
        }

        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mmsOptions = {
          instance: {
            dbPath: devDbPath,
            storageEngine: 'wiredTiger',
            dbName: 'campus_connect',
          },
        };

        if (existingBinary) {
          mmsOptions.binary = { systemBinary: existingBinary };
        }

        inMemoryServer = await MongoMemoryServer.create(mmsOptions);
        const devUri = inMemoryServer.getUri();

        const conn = await mongoose.connect(devUri);
        console.log(`[MongoDB] Connected to embedded development database: ${conn.connection.host}/${conn.connection.name}`);

        // Seed default development accounts if database is fresh
        await seedDevDefaults().catch((seedErr) => {
          console.warn('[MongoDB] Dev auto-seed note:', seedErr.message);
        });

        return conn;
      } catch (devDbError) {
        console.error('[MongoDB] Embedded development database failed to start:', devDbError.message);
      }
    }

    console.warn('[MongoDB] Running in standalone mode. Note: Database features require an active MongoDB connection.');
    return null;
  }
}

/**
 * Seed default development accounts and campus content so the application is immediately usable
 */
async function seedDevDefaults() {
  const { User } = await import('../models/User.js');
  const { Community } = await import('../models/Community.js');
  const { CommunityMembership } = await import('../models/CommunityMembership.js');
  const { Post } = await import('../models/Post.js');
  const { Opportunity } = await import('../models/Opportunity.js');
  const { ROLES, USER_STATUS } = await import('../constants/roles.js');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campusconnect.edu').toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      fullName: 'Campus Administrator',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
      college: 'Central University Administration',
      course: 'Administration',
      branch: 'Central Administration',
      academicYear: 'Staff',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });
    console.log(`[MongoDB] Provisioned development administrator: ${adminEmail} (password: ${process.env.ADMIN_PASSWORD || 'AdminPass123!'})`);
  }

  const demoStudentEmail = 'student@campus.edu';
  let demoStudent = await User.findOne({ email: demoStudentEmail });
  if (!demoStudent) {
    demoStudent = await User.create({
      fullName: 'Aarav Sharma',
      email: demoStudentEmail,
      password: 'Password123!',
      college: 'College of Engineering & Technology',
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      academicYear: '3rd Year',
      semester: '6th Semester',
      interests: ['Web Development', 'Artificial Intelligence', 'Competitive Programming'],
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      bio: 'Pre-final year CSE student passionate about full-stack engineering and building campus platforms.',
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
    });
    console.log(`[MongoDB] Provisioned demo student: ${demoStudentEmail} (password: Password123!)`);
  }

  const student2Email = 'priya@campus.edu';
  let student2 = await User.findOne({ email: student2Email });
  if (!student2) {
    student2 = await User.create({
      fullName: 'Priya Patel',
      email: student2Email,
      password: 'Password123!',
      college: 'College of Engineering & Technology',
      course: 'B.Tech',
      branch: 'Information Technology',
      academicYear: '2nd Year',
      semester: '4th Semester',
      interests: ['UI/UX Design', 'Cloud Computing', 'Open Source'],
      skills: ['Figma', 'Python', 'Docker', 'Tailwind CSS'],
      bio: 'Design enthusiast & developer looking for hackathon teammates and study partners.',
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
    });
    console.log(`[MongoDB] Provisioned demo student: ${student2Email} (password: Password123!)`);
  }

  // Seed sample community if none exist
  const communityCount = await Community.countDocuments();
  if (communityCount === 0 && demoStudent) {
    const gdsc = await Community.create({
      name: 'Google Developer Student Club',
      description: 'University chapter empowering student developers through workshops, code camps, and open-source hackathons.',
      category: 'Technical',
      creator: demoStudent._id,
      accentColor: 'blue',
      memberCount: 1,
    });
    await CommunityMembership.create({
      community: gdsc._id,
      user: demoStudent._id,
      role: 'owner',
    });

    const robotics = await Community.create({
      name: 'Robotics & AI Guild',
      description: 'Hands-on hardware labs, autonomous rovers, drone design, and machine learning model deployment.',
      category: 'Technical',
      creator: student2._id,
      accentColor: 'orange',
      memberCount: 1,
    });
    await CommunityMembership.create({
      community: robotics._id,
      user: student2._id,
      role: 'owner',
    });
  }

  // Seed sample feed posts if none exist
  const postCount = await Post.countDocuments();
  if (postCount === 0 && admin) {
    await Post.create({
      title: 'Annual Campus Hackathon & Innovation Expo 2026',
      content: 'Registration is officially open for the Annual University Innovation Hackathon! Over $10,000 in project grants and mentorship from top industry leaders. Form your teams now.',
      category: 'ANNOUNCEMENT',
      author: admin._id,
      isPinned: true,
      badgeVariant: 'yellow',
    });

    if (demoStudent) {
      await Post.create({
        title: 'Full-Stack Web Dev Workshop this Saturday at Lab 3',
        content: 'Join us this Saturday from 2 PM to 5 PM for an interactive React 19 & Node.js hands-on sprint. Bring your laptops!',
        category: 'CAMPUS_EVENT',
        author: demoStudent._id,
        isPinned: false,
        badgeVariant: 'blue',
      });
    }
  }

  // Seed sample opportunity if none exist
  const oppCount = await Opportunity.countDocuments();
  if (oppCount === 0 && admin) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    await Opportunity.create({
      title: 'Google Summer Software Engineering Internship 2026',
      type: 'Internship',
      organiser: 'Google University Programs',
      description: '12-week paid summer internship program for undergraduate students in Computer Science or related fields.',
      deadline: nextMonth,
      eligibility: 'Pre-final & final year undergraduate students in CSE, IT, ECE',
      location: 'Hybrid / Bangalore',
      status: 'VERIFIED',
      creator: admin._id,
      verifiedBy: admin._id,
      verifiedAt: new Date(),
    });
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (inMemoryServer) {
    await inMemoryServer.stop();
    inMemoryServer = null;
  }
}

/**
 * Get current database connection state
 */
export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    readyState: stateCode,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Connection lost');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected successfully');
});

