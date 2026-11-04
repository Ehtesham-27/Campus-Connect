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
import { Post } from '../src/models/Post.js';
import { seedAdminUser } from '../src/scripts/seedAdmin.js';

let mongoServer;
let authorCookie;
let otherStudentCookie;
let adminCookie;

describe('Campus Connect — Phase 2: Module 3 (Campus Feed)', () => {
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
    await Post.deleteMany({});
    await User.deleteMany({});

    // Register Author Student
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Author Student',
        collegeEmail: 'author@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        academicYear: '3rd Year',
      });
    authorCookie = res1.headers['set-cookie'];

    // Register Other Student
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Other Student',
        collegeEmail: 'other@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        academicYear: '2nd Year',
      });
    otherStudentCookie = res2.headers['set-cookie'];

    // Seed Admin
    await seedAdminUser({
      email: 'feed.admin@campusconnect.edu',
      password: 'AdminKey#Feed123',
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'feed.admin@campusconnect.edu',
        password: 'AdminKey#Feed123',
      });
    adminCookie = adminLoginRes.headers['set-cookie'];
  });

  it('3.1 should create a new campus post with valid inputs', async () => {
    const res = await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Library Extended Hours for Final Exams',
        content: 'Central library will remain open 24/7 during final exam week starting Monday.',
        category: 'ANNOUNCEMENT',
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Library Extended Hours for Final Exams');
    assert.equal(res.body.data.category, 'ANNOUNCEMENT');
    assert.equal(res.body.data.author.fullName, 'Author Student');

    // Verify DB record
    const post = await Post.findById(res.body.data.id);
    assert.ok(post);
    assert.equal(post.status, 'PUBLISHED');
  });

  it('3.2 should reject post creation with invalid inputs', async () => {
    const res = await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Hi', // too short
        content: 'No', // too short
        category: 'ANNOUNCEMENT',
      })
      .expect(400);

    assert.equal(res.body.success, false);
  });

  it('3.3 should browse posts and filter by category', async () => {
    await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Cultural Fest Auditions',
        content: 'Auditions for the annual dance and drama fest begin tomorrow at the auditorium.',
        category: 'CAMPUS_EVENT',
      });

    await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Semester Fee Payment Reminder',
        content: 'Final deadline for semester fee submission is the 15th of this month.',
        category: 'ANNOUNCEMENT',
      });

    // Filter by CAMPUS_EVENT
    const eventRes = await request(app)
      .get('/api/feed?category=CAMPUS_EVENT')
      .set('Cookie', otherStudentCookie)
      .expect(200);

    assert.equal(eventRes.body.success, true);
    assert.equal(eventRes.body.data.posts.length, 1);
    assert.equal(eventRes.body.data.posts[0].title, 'Cultural Fest Auditions');
    assert.equal(eventRes.body.data.posts[0].category, 'CAMPUS_EVENT');
  });

  it('3.4 should permit author to edit own post and forbid other students', async () => {
    const createRes = await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Hackathon Venue Room Changed',
        content: 'The hackathon will take place in Hall B instead of Hall A.',
        category: 'ANNOUNCEMENT',
      });

    const postId = createRes.body.data.id;

    // Unauthorized student attempt -> 403
    await request(app)
      .patch(`/api/feed/${postId}`)
      .set('Cookie', otherStudentCookie)
      .send({ title: 'Hacked Title Attempt' })
      .expect(403);

    // Author update -> 200
    const updateRes = await request(app)
      .patch(`/api/feed/${postId}`)
      .set('Cookie', authorCookie)
      .send({
        title: 'Hackathon Venue Room Confirmed in Hall B',
        content: 'Updated: The hackathon will take place in Hall B with power strips provided.',
      })
      .expect(200);

    assert.equal(updateRes.body.success, true);
    assert.equal(updateRes.body.data.title, 'Hackathon Venue Room Confirmed in Hall B');

    // Verify DB update
    const post = await Post.findById(postId);
    assert.equal(post.title, 'Hackathon Venue Room Confirmed in Hall B');
  });

  it('3.5 should allow author to delete own post and forbid unauthorized students', async () => {
    const createRes = await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Post to be deleted by author',
        content: 'This post is temporary and will be removed by the author.',
        category: 'GENERAL',
      });

    const postId = createRes.body.data.id;

    // Unauthorized student delete attempt -> 403
    await request(app)
      .delete(`/api/feed/${postId}`)
      .set('Cookie', otherStudentCookie)
      .expect(403);

    // Author delete -> 200
    await request(app)
      .delete(`/api/feed/${postId}`)
      .set('Cookie', authorCookie)
      .expect(200);

    const post = await Post.findById(postId);
    assert.equal(post, null);
  });

  it('3.6 should allow administrator to edit or delete any post (moderation)', async () => {
    const createRes = await request(app)
      .post('/api/feed')
      .set('Cookie', authorCookie)
      .send({
        title: 'Inappropriate Announcement Headline',
        content: 'This post contains inappropriate content that violates campus guidelines.',
        category: 'GENERAL',
      });

    const postId = createRes.body.data.id;

    // Admin moderates / updates post
    const editRes = await request(app)
      .patch(`/api/feed/${postId}`)
      .set('Cookie', adminCookie)
      .send({ title: '[MODERATED] Announcement Headline Cleaned' })
      .expect(200);

    assert.equal(editRes.body.success, true);

    // Admin removes post
    await request(app)
      .delete(`/api/feed/${postId}`)
      .set('Cookie', adminCookie)
      .expect(200);

    const post = await Post.findById(postId);
    assert.equal(post, null);
  });
});

