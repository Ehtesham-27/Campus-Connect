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
import { Community } from '../src/models/Community.js';
import { Post } from '../src/models/Post.js';
import { Opportunity } from '../src/models/Opportunity.js';
import { Report } from '../src/models/Report.js';
import { seedAdminUser } from '../src/scripts/seedAdmin.js';

let mongoServer;
let adminCookie;
let studentCookie;
let studentId;
let adminId;

describe('Campus Connect — Phase 3: Module 3 (Admin Dashboard & Moderation)', () => {
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
    await Report.deleteMany({});
    await Opportunity.deleteMany({});
    await Post.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});

    // Seed & Login Admin
    await seedAdminUser({
      email: 'admin.console@campusconnect.edu',
      password: 'AdminConsolePassword123!',
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.console@campusconnect.edu',
        password: 'AdminConsolePassword123!',
      });
    adminCookie = adminLogin.headers['set-cookie'];
    adminId = adminLogin.body.data.user.id;

    // Register Student
    const studentReg = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Student User',
        collegeEmail: 'student.user@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech IT',
        academicYear: '3rd Year',
      });
    studentCookie = studentReg.headers['set-cookie'];
    studentId = studentReg.body.data.user.id;
  });

  it('1. should return real platform telemetry on GET /api/admin/dashboard for admin', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', adminCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.stats);
    assert.equal(res.body.data.stats.totalStudents, 1);
    assert.equal(res.body.data.stats.activeStudents, 1);
    assert.equal(res.body.data.stats.suspendedStudents, 0);
  });

  it('2. should reject unauthenticated requests to admin endpoints with 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    assert.equal(res.status, 401);
  });

  it('3. should forbid student role from accessing admin endpoints with 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', studentCookie);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access forbidden|Access denied/i);
  });

  it('4. should list registered students with pagination and search for admin', async () => {
    const res = await request(app)
      .get('/api/admin/students?search=Student')
      .set('Cookie', adminCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.students.length, 1);
    assert.equal(res.body.data.students[0].fullName, 'Student User');
    assert.equal(res.body.data.students[0].accountStatus, 'ACTIVE');
  });

  it('5. should allow admin to suspend and reactivate a student account', async () => {
    // Suspend
    const suspendRes = await request(app)
      .patch(`/api/admin/students/${studentId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'SUSPENDED' });

    assert.equal(suspendRes.status, 200);
    assert.equal(suspendRes.body.data.accountStatus, 'SUSPENDED');

    // Reactivate
    const reactivateRes = await request(app)
      .patch(`/api/admin/students/${studentId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'ACTIVE' });

    assert.equal(reactivateRes.status, 200);
    assert.equal(reactivateRes.body.data.accountStatus, 'ACTIVE');
  });

  it('6. should forbid admin from suspending their own account', async () => {
    const res = await request(app)
      .patch(`/api/admin/students/${adminId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'SUSPENDED' });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /cannot alter their own account status/i);
  });

  it('7. should allow admin to moderate communities and delete inappropriate ones', async () => {
    // Create community
    const createComm = await request(app)
      .post('/api/communities')
      .set('Cookie', studentCookie)
      .send({
        name: 'Inappropriate Club',
        category: 'Social',
        description: 'Club description to be removed.',
      });

    const commId = createComm.body.data.id;

    // List communities via admin
    const listRes = await request(app)
      .get('/api/admin/communities')
      .set('Cookie', adminCookie);

    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.data.length >= 1);

    // Admin deletes community
    const delRes = await request(app)
      .delete(`/api/admin/communities/${commId}`)
      .set('Cookie', adminCookie);

    assert.equal(delRes.status, 200);

    // Verify deleted
    const verifyDel = await request(app)
      .get(`/api/communities/${commId}`)
      .set('Cookie', studentCookie);

    assert.equal(verifyDel.status, 404);
  });

  it('8. should allow admin to moderate feed posts, toggle pin, and delete', async () => {
    // Student creates post
    const postRes = await request(app)
      .post('/api/feed')
      .set('Cookie', studentCookie)
      .send({
        title: 'Important Campus Notice',
        content: 'Exam dates have been released by the university administration.',
        category: 'ANNOUNCEMENT',
      });

    const postId = postRes.body.data.id;

    // Admin pins post
    const pinRes = await request(app)
      .patch(`/api/admin/feed/${postId}/pin`)
      .set('Cookie', adminCookie);

    assert.equal(pinRes.status, 200);
    assert.equal(pinRes.body.data.isPinned, true);

    // Admin deletes post
    const delRes = await request(app)
      .delete(`/api/admin/feed/${postId}`)
      .set('Cookie', adminCookie);

    assert.equal(delRes.status, 200);
  });

  it('9. should allow admin to verify and delete opportunities', async () => {
    const oppRes = await request(app)
      .post('/api/opportunities')
      .set('Cookie', studentCookie)
      .send({
        title: 'AI Robotics Internship',
        type: 'Internship',
        organiser: 'Robotics Labs',
        description: 'Summer research intern.',
        deadline: new Date(Date.now() + 864000000).toISOString(),
        eligibility: 'All students',
      });

    const oppId = oppRes.body.data.id;

    // Admin verifies opportunity
    const verifyRes = await request(app)
      .patch(`/api/admin/opportunities/${oppId}/verify`)
      .set('Cookie', adminCookie);

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.data.status, 'VERIFIED');

    // Admin deletes opportunity
    const delRes = await request(app)
      .delete(`/api/admin/opportunities/${oppId}`)
      .set('Cookie', adminCookie);

    assert.equal(delRes.status, 200);
  });

  it('10. should allow students to file moderation reports and admin to review and resolve', async () => {
    // Student files report
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Cookie', studentCookie)
      .send({
        targetType: 'POST',
        targetId: 'dummy-post-id',
        targetTitle: 'Commercial solicitation on feed',
        reason: 'Commercial spam',
        details: 'Post selling commercial products violates campus policy.',
      });

    assert.equal(reportRes.status, 201);
    const reportId = reportRes.body.data.id;

    // Admin lists reports
    const listReports = await request(app)
      .get('/api/admin/reports')
      .set('Cookie', adminCookie);

    assert.equal(listReports.status, 200);
    assert.equal(listReports.body.data.length, 1);
    assert.equal(listReports.body.data[0].status, 'PENDING');

    // Admin resolves report
    const resolveRes = await request(app)
      .patch(`/api/admin/reports/${reportId}`)
      .set('Cookie', adminCookie)
      .send({
        status: 'RESOLVED',
        resolutionNotes: 'Violating post was moderated and deleted.',
      });

    assert.equal(resolveRes.status, 200);
    assert.equal(resolveRes.body.data.status, 'RESOLVED');
    assert.equal(resolveRes.body.data.resolutionNotes, 'Violating post was moderated and deleted.');
  });
});
