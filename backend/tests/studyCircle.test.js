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
import { StudyCircle } from '../src/models/StudyCircle.js';
import { StudyCircleMembership } from '../src/models/StudyCircleMembership.js';
import { seedAdminUser } from '../src/scripts/seedAdmin.js';

let mongoServer;
let creatorCookie;
let studentCookie;
let adminCookie;

describe('Campus Connect — Phase 3: Module 2 (Study Circles)', () => {
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
    await StudyCircleMembership.deleteMany({});
    await StudyCircle.deleteMany({});
    await User.deleteMany({});

    // Register Circle Creator
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Circle Lead',
        collegeEmail: 'lead@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech CSE',
        academicYear: '3rd Year',
      });
    creatorCookie = res1.headers['set-cookie'];

    // Register Student Member
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Peer Student',
        collegeEmail: 'peer@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech IT',
        academicYear: '2nd Year',
      });
    studentCookie = res2.headers['set-cookie'];

    // Seed & Login Admin
    await seedAdminUser({
      email: 'admin.circle@campusconnect.edu',
      password: 'AdminPassword123!',
    });
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.circle@campusconnect.edu',
        password: 'AdminPassword123!',
      });
    adminCookie = adminRes.headers['set-cookie'];
  });

  it('1. should create a new study circle and assign creator as lead member', async () => {
    const res = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Algorithms & Data Structures',
        topic: 'Graph Theory & Dynamic Programming',
        course: 'B.Tech CSE',
        description: 'Weekly peer review on LeetCode hard problems and DP proofs.',
        schedule: 'Tuesdays, 5:30 PM • Library Hall B',
        level: 'Advanced',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.subject, 'Algorithms & Data Structures');
    assert.equal(res.body.data.memberCount, 1);
    assert.ok(res.body.data.id);
  });

  it('2. should reject study circle creation with invalid/missing inputs', async () => {
    const res = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        course: 'B.Tech',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('3. should list study circles with level and search filters', async () => {
    await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Operating Systems',
        topic: 'Linux Kernel & Concurrency',
        course: 'B.Tech CSE',
        description: 'Semaphores, Mutexes, and Virtual Memory paging.',
        schedule: 'Thursdays, 6:00 PM',
        level: 'Core Exam Prep',
      });

    await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Machine Learning',
        topic: 'Neural Networks from Scratch',
        course: 'B.Tech IT',
        description: 'Backprop implementation in Python without PyTorch.',
        schedule: 'Saturdays, 11:00 AM',
        level: 'Advanced',
      });

    // Level filter
    const levelRes = await request(app)
      .get('/api/study-circles?level=Advanced')
      .set('Cookie', studentCookie);

    assert.equal(levelRes.status, 200);
    assert.equal(levelRes.body.data.circles.length, 1);
    assert.equal(levelRes.body.data.circles[0].subject, 'Machine Learning');

    // Search filter
    const searchRes = await request(app)
      .get('/api/study-circles?search=Kernel')
      .set('Cookie', studentCookie);

    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.data.circles.length, 1);
    assert.equal(searchRes.body.data.circles[0].subject, 'Operating Systems');
  });

  it('4. should retrieve single study circle details by ID', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Database Systems',
        topic: 'B-Trees and Query Optimizer',
        course: 'B.Tech CSE',
        description: 'ACID isolation levels and indexing strategies.',
        schedule: 'Wednesdays, 5:00 PM',
        level: 'Intermediate',
      });

    const circleId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/study-circles/${circleId}`)
      .set('Cookie', studentCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, circleId);
    assert.equal(res.body.data.subject, 'Database Systems');
    assert.equal(res.body.data.creator.fullName, 'Circle Lead');
    assert.equal(res.body.data.isMember, false);
  });

  it('5. should allow a student to join a study circle and increment memberCount', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Computer Networks',
        topic: 'TCP/IP and Congestion Control',
        description: 'Socket programming and network security.',
        level: 'Intermediate',
      });

    const circleId = createRes.body.data.id;

    const joinRes = await request(app)
      .post(`/api/study-circles/${circleId}/join`)
      .set('Cookie', studentCookie);

    assert.equal(joinRes.status, 200);
    assert.equal(joinRes.body.data.isMember, true);
    assert.equal(joinRes.body.data.memberCount, 2);
  });

  it('6. should prevent duplicate membership in a study circle', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Compiler Design',
        topic: 'LL(1) & LR parsers',
        description: 'Syntax directed translation.',
        level: 'Advanced',
      });

    const circleId = createRes.body.data.id;

    // First join
    await request(app)
      .post(`/api/study-circles/${circleId}/join`)
      .set('Cookie', studentCookie);

    // Duplicate join attempt
    const dupRes = await request(app)
      .post(`/api/study-circles/${circleId}/join`)
      .set('Cookie', studentCookie);

    assert.equal(dupRes.status, 409);
    assert.match(dupRes.body.message, /already a member/i);
  });

  it('7. should allow a student to leave a study circle and decrement memberCount', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Linear Algebra',
        topic: 'Eigenvectors and SVD',
        description: 'Mathematical foundations of machine learning.',
        level: 'Intermediate',
      });

    const circleId = createRes.body.data.id;

    // Join
    await request(app)
      .post(`/api/study-circles/${circleId}/join`)
      .set('Cookie', studentCookie);

    // Leave
    const leaveRes = await request(app)
      .post(`/api/study-circles/${circleId}/leave`)
      .set('Cookie', studentCookie);

    assert.equal(leaveRes.status, 200);
    assert.equal(leaveRes.body.data.isMember, false);
    assert.equal(leaveRes.body.data.memberCount, 1);
  });

  it('8. should forbid circle creator from leaving their own study circle', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Discrete Mathematics',
        topic: 'Combinatorics & Graph Theory',
        description: 'Proof techniques and recurrence relations.',
        level: 'Beginner',
      });

    const circleId = createRes.body.data.id;

    const leaveRes = await request(app)
      .post(`/api/study-circles/${circleId}/leave`)
      .set('Cookie', creatorCookie);

    assert.equal(leaveRes.status, 400);
    assert.match(leaveRes.body.message, /cannot leave their own study circle/i);
  });

  it('9. should list circle members via GET /api/study-circles/:id/members', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Cloud Computing',
        topic: 'Microservices & Docker',
        description: 'Kubernetes orchestration and containerization.',
        level: 'Intermediate',
      });

    const circleId = createRes.body.data.id;

    await request(app)
      .post(`/api/study-circles/${circleId}/join`)
      .set('Cookie', studentCookie);

    const membersRes = await request(app)
      .get(`/api/study-circles/${circleId}/members`)
      .set('Cookie', studentCookie);

    assert.equal(membersRes.status, 200);
    assert.equal(membersRes.body.data.length, 2);
    assert.equal(membersRes.body.data[0].role, 'LEAD');
    assert.equal(membersRes.body.data[0].user.fullName, 'Circle Lead');
    assert.equal(membersRes.body.data[1].role, 'MEMBER');
    assert.equal(membersRes.body.data[1].user.fullName, 'Peer Student');
  });

  it('10. should restrict circle modification to creator or admin', async () => {
    const createRes = await request(app)
      .post('/api/study-circles')
      .set('Cookie', creatorCookie)
      .send({
        subject: 'Digital Electronics',
        topic: 'Karnaugh Maps & Flip-Flops',
        description: 'Boolean algebra and sequential logic.',
        level: 'Beginner',
      });

    const circleId = createRes.body.data.id;

    // Student cannot update
    const rogueUpdate = await request(app)
      .patch(`/api/study-circles/${circleId}`)
      .set('Cookie', studentCookie)
      .send({ topic: 'Hacked Topic' });

    assert.equal(rogueUpdate.status, 403);

    // Creator can update
    const creatorUpdate = await request(app)
      .patch(`/api/study-circles/${circleId}`)
      .set('Cookie', creatorCookie)
      .send({ topic: 'State Machines & Sequential Circuits' });

    assert.equal(creatorUpdate.status, 200);
    assert.equal(creatorUpdate.body.data.topic, 'State Machines & Sequential Circuits');

    // Admin can delete
    const adminDelete = await request(app)
      .delete(`/api/study-circles/${circleId}`)
      .set('Cookie', adminCookie);

    assert.equal(adminDelete.status, 200);
  });
});

