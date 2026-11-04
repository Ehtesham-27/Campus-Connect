process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_super_secret_jwt_key_2026_test_suite';
process.env.COOKIE_NAME = 'campus_connect_token';
process.env.FRONTEND_URL = 'http://localhost:5173';

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { ROLES, USER_STATUS } from '../src/constants/roles.js';

let mongoServer;
let currentUserCookie;
let currentUserId;

describe('Campus Connect — Phase 2: Module 1 (Discover Students)', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Register primary user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alex Primary',
        collegeEmail: 'alex.primary@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        branch: 'Computer Science',
        academicYear: '3rd Year',
        semester: '5',
      });

    currentUserCookie = res.headers['set-cookie'];
    currentUserId = res.body.data.user.id;

    // Seed mock peer students in MongoDB
    await User.create([
      {
        fullName: 'Rohan Verma',
        email: 'rohan.verma@dtu.ac.in',
        password: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        branch: 'Electrical Engineering',
        academicYear: '2nd Year',
        semester: '3',
        skills: ['Python', 'Embedded Systems', 'IoT'],
        interests: ['Robotics', 'Hardware', 'Drones'],
        bio: 'Electrical student building autonomous drones.',
        role: ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
      },
      {
        fullName: 'Priya Narang',
        email: 'priya.narang@dtu.ac.in',
        password: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        branch: 'Computer Science',
        academicYear: '3rd Year',
        semester: '5',
        skills: ['React', 'TypeScript', 'UI/UX', 'Figma'],
        interests: ['Hackathons', 'Design', 'Open Source'],
        bio: 'Product designer and frontend engineer.',
        role: ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
      },
      {
        fullName: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@dtu.ac.in',
        password: 'Password123!',
        college: 'Delhi Technological University',
        course: 'MBA',
        branch: 'Marketing & Strategy',
        academicYear: '1st Year',
        semester: '1',
        skills: ['Financial Modeling', 'Market Analysis', 'Public Speaking'],
        interests: ['Debating', 'Consulting', 'Venture Capital'],
        bio: 'MBA candidate interested in tech startups.',
        role: ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
      },
    ]);
  });

  it('1.1 should reject unauthenticated requests to discover students with 401', async () => {
    const res = await request(app).get('/api/discover/students').expect(401);
    assert.equal(res.body.success, false);
  });

  it('1.2 should list registered peer students and exclude current user from results', async () => {
    const res = await request(app)
      .get('/api/discover/students')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.total, 3);
    assert.equal(res.body.data.students.length, 3);

    // Verify self-exclusion
    const selfIncluded = res.body.data.students.some((s) => s.id === currentUserId);
    assert.equal(selfIncluded, false, 'Current user must be excluded from discovery results');

    // Verify sensitive data is excluded
    res.body.data.students.forEach((s) => {
      assert.equal(s.password, undefined);
      assert.equal(s.passwordResetToken, undefined);
      assert.equal(s.email, undefined);
      assert.ok(s.fullName);
      assert.ok(s.course);
    });
  });

  it('1.3 should search students by name (case-insensitive substring)', async () => {
    const res = await request(app)
      .get('/api/discover/students?search=rohan')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Rohan Verma');
  });

  it('1.4 should filter students by course (degree)', async () => {
    const res = await request(app)
      .get('/api/discover/students?course=MBA')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Ananya Deshmukh');
  });

  it('1.5 should filter students by branch', async () => {
    const res = await request(app)
      .get('/api/discover/students?branch=Electrical')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Rohan Verma');
  });

  it('1.6 should filter students by academic year', async () => {
    const res = await request(app)
      .get('/api/discover/students?academicYear=2nd Year')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Rohan Verma');
  });

  it('1.7 should filter students by technical skill', async () => {
    const res = await request(app)
      .get('/api/discover/students?skill=Figma')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Priya Narang');
  });

  it('1.8 should filter students by interest', async () => {
    const res = await request(app)
      .get('/api/discover/students?interest=Robotics')
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Rohan Verma');
  });

  it('1.9 should retrieve individual student details via GET /api/discover/students/:id', async () => {
    const listRes = await request(app)
      .get('/api/discover/students?search=Priya')
      .set('Cookie', currentUserCookie);

    const priyaId = listRes.body.data.students[0].id;

    const detailRes = await request(app)
      .get(`/api/discover/students/${priyaId}`)
      .set('Cookie', currentUserCookie)
      .expect(200);

    assert.equal(detailRes.body.success, true);
    assert.equal(detailRes.body.data.fullName, 'Priya Narang');
    assert.equal(detailRes.body.data.branch, 'Computer Science');
    assert.equal(detailRes.body.data.bio, 'Product designer and frontend engineer.');
    assert.equal(detailRes.body.data.password, undefined);
  });

  it('1.10 should return 404 when student profile does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/discover/students/${fakeId}`)
      .set('Cookie', currentUserCookie)
      .expect(404);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not found/i);
  });
});
