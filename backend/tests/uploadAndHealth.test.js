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
import { ROLES, USER_STATUS } from '../src/constants/roles.js';

let mongoServer;
let studentCookie;
let studentBId;
let studentBCookie;
let adminCookie;
let testCommunityId;

describe('Campus Connect — Pre-Deployment Fixes Suite (Health & Cloudinary Uploads)', () => {
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
    await Community.deleteMany({});
    await User.deleteMany({});

    // Register Student A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Upload Tester Student',
        collegeEmail: 'uploader@campus.edu',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Test College',
        course: 'B.Tech IT',
      });
    studentCookie = resA.headers['set-cookie'];
    const studentAId = resA.body.data.user.id;

    // Register Student B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Other Student',
        collegeEmail: 'other@campus.edu',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Test College',
        course: 'B.Tech IT',
      });
    studentBCookie = resB.headers['set-cookie'];
    studentBId = resB.body.data.user.id;

    // Seed Admin
    const adminUser = await User.create({
      fullName: 'Super Admin',
      email: 'admin.upload@campus.edu',
      password: 'AdminPassword123!',
      college: 'University Administration',
      course: 'Staff',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.upload@campus.edu',
        password: 'AdminPassword123!',
      });
    adminCookie = loginRes.headers['set-cookie'];

    // Create test community owned by Student A
    const community = await Community.create({
      name: 'Cloudinary Test Society',
      description: 'A test community for media uploads',
      category: 'Technical',
      creator: studentAId,
    });
    testCommunityId = community._id.toString();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. Health Endpoint Tests                                                   */
  /* -------------------------------------------------------------------------- */
  it('1. should return HTTP 200 with status: healthy when database is connected', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'healthy');
    assert.equal(res.body.data.database.readyState, 1);
  });

  it('2. should also return HTTP 200 on convenience /health route when connected', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'healthy');
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Cloudinary Upload Tests                                                 */
  /* -------------------------------------------------------------------------- */
  it('3. should reject avatar upload when unauthenticated with 401', async () => {
    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .attach('image', Buffer.from('fake image content'), 'test.png');

    assert.equal(res.status, 401);
  });

  it('4. should reject avatar upload when no file is attached with 400', async () => {
    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .set('Cookie', studentCookie);

    assert.equal(res.status, 400);
    assert.match(res.body.message, /select an image file/i);
  });

  it('5. should reject file upload with unsupported MIME type (e.g. text/plain)', async () => {
    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .set('Cookie', studentCookie)
      .attach('image', Buffer.from('console.log("malicious")'), 'script.txt');

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Invalid file type/i);
  });

  it('6. should successfully upload a valid avatar image for authenticated student', async () => {
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .set('Cookie', studentCookie)
      .attach('image', pngBuffer, 'avatar.png');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.profileImage.includes('cloudinary.com'));

    // Verify User record updated in database
    const userInDb = await User.findOne({ email: 'uploader@campus.edu' });
    assert.ok(userInDb.profileImage);
    assert.equal(userInDb.profileImage, res.body.data.profileImage);
  });

  it('7. should allow community creator to upload community logo/avatar', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post(`/api/v1/upload/community/${testCommunityId}?type=avatar`)
      .set('Cookie', studentCookie)
      .attach('image', pngBuffer, 'community-logo.png');

    assert.equal(res.status, 200);
    assert.ok(res.body.data.avatarImage);

    const commInDb = await Community.findById(testCommunityId);
    assert.equal(commInDb.avatarImage, res.body.data.avatarImage);
  });

  it('8. should forbid non-creator students from uploading community images with 403', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post(`/api/v1/upload/community/${testCommunityId}?type=avatar`)
      .set('Cookie', studentBCookie)
      .attach('image', pngBuffer, 'hacked-logo.png');

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Permission denied/i);
  });

  it('9. should allow platform administrator to upload community images', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post(`/api/v1/upload/community/${testCommunityId}?type=banner`)
      .set('Cookie', adminCookie)
      .attach('image', pngBuffer, 'admin-banner.png');

    assert.equal(res.status, 200);
    assert.ok(res.body.data.bannerImage);

    const commInDb = await Community.findById(testCommunityId);
    assert.equal(commInDb.bannerImage, res.body.data.bannerImage);
  });
});
