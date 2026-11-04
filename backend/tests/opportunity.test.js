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
import { Opportunity } from '../src/models/Opportunity.js';
import { seedAdminUser } from '../src/scripts/seedAdmin.js';

let mongoServer;
let creatorCookie;
let otherStudentCookie;
let adminCookie;

describe('Campus Connect — Phase 2: Module 4 (Opportunities)', () => {
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
    await Opportunity.deleteMany({});
    await User.deleteMany({});

    // Register Creator Student
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Creator Student',
        collegeEmail: 'creator@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        academicYear: '3rd Year',
      });
    creatorCookie = res1.headers['set-cookie'];

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

    // Seed & Login Admin
    await seedAdminUser({
      email: 'opp.admin@campusconnect.edu',
      password: 'AdminKey#Opp123',
    });
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'opp.admin@campusconnect.edu',
        password: 'AdminKey#Opp123',
      });
    adminCookie = resAdmin.headers['set-cookie'];
  });

  it('1. should create an opportunity successfully when authenticated', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    const res = await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Campus Hackathon 2026',
        type: 'Hackathon',
        organiser: 'GDSC Chapter',
        description: 'Build real-world solutions for campus challenges.',
        deadline: deadline.toISOString(),
        eligibility: 'All college students',
        location: 'Main Auditorium',
        link: 'https://gdsc.example.com/hack',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Campus Hackathon 2026');
    assert.equal(res.body.data.type, 'Hackathon');
    assert.ok(res.body.data.id);
  });

  it('2. should reject opportunity creation when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        type: 'Internship',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('3. should list opportunities with pagination and details', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Backend Engineering Internship',
        type: 'Internship',
        organiser: 'Campus Incubator',
        description: 'Node.js and MongoDB backend intern role.',
        deadline: deadline.toISOString(),
        eligibility: 'Pre-final and Final Year',
      });

    const res = await request(app)
      .get('/api/opportunities')
      .set('Cookie', otherStudentCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.opportunities.length, 1);
    assert.equal(res.body.data.opportunities[0].title, 'Backend Engineering Internship');
    assert.equal(res.body.data.total, 1);
  });

  it('4. should filter opportunities by type', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Tech Hackathon',
        type: 'Hackathon',
        organiser: 'Coding Club',
        description: 'Hackathon event.',
        deadline: deadline.toISOString(),
        eligibility: 'All students',
      });

    await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Data Science Internship',
        type: 'Internship',
        organiser: 'AI Labs',
        description: 'Data science internship role.',
        deadline: deadline.toISOString(),
        eligibility: '3rd year students',
      });

    const resHackathon = await request(app)
      .get('/api/opportunities?type=Hackathon')
      .set('Cookie', otherStudentCookie);

    assert.equal(resHackathon.status, 200);
    assert.equal(resHackathon.body.data.opportunities.length, 1);
    assert.equal(resHackathon.body.data.opportunities[0].type, 'Hackathon');

    const resInternship = await request(app)
      .get('/api/opportunities?type=Internship')
      .set('Cookie', otherStudentCookie);

    assert.equal(resInternship.status, 200);
    assert.equal(resInternship.body.data.opportunities.length, 1);
    assert.equal(resInternship.body.data.opportunities[0].type, 'Internship');
  });

  it('5. should filter opportunities by search query', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Mobile App Hackathon',
        type: 'Hackathon',
        organiser: 'Mobile Society',
        description: 'React Native and Flutter competition.',
        deadline: deadline.toISOString(),
        eligibility: 'All',
      });

    const res = await request(app)
      .get('/api/opportunities?search=Flutter')
      .set('Cookie', otherStudentCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.opportunities.length, 1);
    assert.equal(res.body.data.opportunities[0].title, 'Mobile App Hackathon');
  });

  it('6. should filter out expired opportunities when upcomingOnly is true', async () => {
    const pastDeadline = new Date();
    pastDeadline.setDate(pastDeadline.getDate() - 5);

    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 15);

    await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Past Workshop',
        type: 'Workshop',
        organiser: 'Old Society',
        description: 'Expired workshop.',
        deadline: pastDeadline.toISOString(),
        eligibility: 'All',
      });

    await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Upcoming Workshop',
        type: 'Workshop',
        organiser: 'Active Society',
        description: 'Future workshop.',
        deadline: futureDeadline.toISOString(),
        eligibility: 'All',
      });

    const res = await request(app)
      .get('/api/opportunities?upcomingOnly=true')
      .set('Cookie', otherStudentCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.opportunities.length, 1);
    assert.equal(res.body.data.opportunities[0].title, 'Upcoming Workshop');
  });

  it('7. should retrieve single opportunity details by ID', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 20);

    const createRes = await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Merit Scholarship 2026',
        type: 'Scholarship',
        organiser: 'Alumni Association',
        description: 'Full tuition assistance for outstanding students.',
        deadline: deadline.toISOString(),
        eligibility: 'CGPA >= 8.5',
        link: 'https://alumni.dtu.ac.in/scholarships',
      });

    const oppId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/opportunities/${oppId}`)
      .set('Cookie', otherStudentCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, oppId);
    assert.equal(res.body.data.title, 'Merit Scholarship 2026');
    assert.equal(res.body.data.type, 'Scholarship');
    assert.equal(res.body.data.creator.fullName, 'Creator Student');
  });

  it('8. should allow the creator to update their opportunity', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    const createRes = await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Web Dev Workshop',
        type: 'Workshop',
        organiser: 'Web Club',
        description: 'Intro to React.',
        deadline: deadline.toISOString(),
        eligibility: 'Beginners',
      });

    const oppId = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/opportunities/${oppId}`)
      .set('Cookie', creatorCookie)
      .send({
        title: 'Advanced React & TypeScript Workshop',
      });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.title, 'Advanced React & TypeScript Workshop');
  });

  it('9. should forbid non-creator students from updating or deleting an opportunity', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    const createRes = await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Robotics Competition',
        type: 'Competition',
        organiser: 'Robotics Society',
        description: 'Annual bot combat.',
        deadline: deadline.toISOString(),
        eligibility: 'All',
      });

    const oppId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/opportunities/${oppId}`)
      .set('Cookie', otherStudentCookie)
      .send({ title: 'Hacked Title' });

    assert.equal(patchRes.status, 403);

    const deleteRes = await request(app)
      .delete(`/api/opportunities/${oppId}`)
      .set('Cookie', otherStudentCookie);

    assert.equal(deleteRes.status, 403);
  });

  it('10. should allow admin to delete any opportunity and verify opportunities', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    const createRes = await request(app)
      .post('/api/opportunities')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Startup Pitch Challenge',
        type: 'Competition',
        organiser: 'E-Cell',
        description: 'Pitch your venture to VCs.',
        deadline: deadline.toISOString(),
        eligibility: 'Open to all',
      });

    const oppId = createRes.body.data.id;

    // Student cannot verify
    const studentVerify = await request(app)
      .patch(`/api/opportunities/${oppId}/verify`)
      .set('Cookie', creatorCookie);

    assert.equal(studentVerify.status, 403);

    // Admin can verify
    const adminVerify = await request(app)
      .patch(`/api/opportunities/${oppId}/verify`)
      .set('Cookie', adminCookie);

    assert.equal(adminVerify.status, 200);
    assert.equal(adminVerify.body.data.status, 'VERIFIED');

    // Admin can delete
    const adminDelete = await request(app)
      .delete(`/api/opportunities/${oppId}`)
      .set('Cookie', adminCookie);

    assert.equal(adminDelete.status, 200);

    // Verify deleted
    const getRes = await request(app)
      .get(`/api/opportunities/${oppId}`)
      .set('Cookie', otherStudentCookie);

    assert.equal(getRes.status, 404);
  });
});
