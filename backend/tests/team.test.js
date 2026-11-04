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
import { TeamRequest } from '../src/models/TeamRequest.js';
import { TeamApplication } from '../src/models/TeamApplication.js';
import { seedAdminUser } from '../src/scripts/seedAdmin.js';

let mongoServer;
let creatorCookie;
let applicantCookie;
let otherCookie;
let adminCookie;
let creatorId;
let applicantId;

describe('Campus Connect — Phase 3: Module 1 (Team Finder)', () => {
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
    await TeamApplication.deleteMany({});
    await TeamRequest.deleteMany({});
    await User.deleteMany({});

    // Register Creator Student
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Team Creator',
        collegeEmail: 'creator@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech CSE',
        academicYear: '3rd Year',
      });
    creatorCookie = res1.headers['set-cookie'];
    creatorId = res1.body.data.user.id;

    // Register Applicant Student
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Team Applicant',
        collegeEmail: 'applicant@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech IT',
        academicYear: '2nd Year',
      });
    applicantCookie = res2.headers['set-cookie'];
    applicantId = res2.body.data.user.id;

    // Register Other Student
    const res3 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Other Student',
        collegeEmail: 'other@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech ECE',
        academicYear: '1st Year',
      });
    otherCookie = res3.headers['set-cookie'];

    // Seed & Login Admin
    await seedAdminUser({
      email: 'admin.team@campusconnect.edu',
      password: 'AdminPassword123!',
    });
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.team@campusconnect.edu',
        password: 'AdminPassword123!',
      });
    adminCookie = adminRes.headers['set-cookie'];
  });

  it('1. should create a team request successfully when authenticated', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Autonomous Campus Drone',
        context: 'Smart India Hackathon 2026',
        category: 'Hackathon',
        description: 'Building an autonomous obstacle avoidance quadcopter.',
        requiredSkills: ['Computer Vision', 'ROS', 'Python'],
        teamSize: 4,
        openPositions: 2,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Autonomous Campus Drone');
    assert.equal(res.body.data.category, 'Hackathon');
    assert.equal(res.body.data.openPositions, 2);
    assert.equal(res.body.data.status, 'OPEN');
    assert.ok(res.body.data.id);
  });

  it('2. should reject team request creation with missing title or description', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        category: 'Capstone',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('3. should list team requests with category and search filters', async () => {
    await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'FinTech Micro-Savings App',
        context: 'ETHIndia 2026',
        category: 'Startup',
        description: 'DeFi micro-savings contract platform.',
        requiredSkills: ['Solidity', 'Next.js'],
        teamSize: 4,
        openPositions: 3,
      });

    await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'AI Medical Diagnostic Tool',
        context: 'SIH 2026',
        category: 'Hackathon',
        description: 'Pneumonia x-ray detection using PyTorch.',
        requiredSkills: ['PyTorch', 'FastAPI'],
        teamSize: 3,
        openPositions: 2,
      });

    // Test category filter
    const catRes = await request(app)
      .get('/api/teams?category=Startup')
      .set('Cookie', applicantCookie);

    assert.equal(catRes.status, 200);
    assert.equal(catRes.body.data.teams.length, 1);
    assert.equal(catRes.body.data.teams[0].title, 'FinTech Micro-Savings App');

    // Test search filter
    const searchRes = await request(app)
      .get('/api/teams?search=PyTorch')
      .set('Cookie', applicantCookie);

    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.data.teams.length, 1);
    assert.equal(searchRes.body.data.teams[0].title, 'AI Medical Diagnostic Tool');
  });

  it('4. should retrieve single team request details by ID', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Robotics Rover',
        context: 'Inter-College Expo',
        category: 'Research',
        description: 'All-terrain mapping rover with LiDAR.',
        requiredSkills: ['ROS2', 'C++'],
        teamSize: 4,
        openPositions: 2,
      });

    const teamId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/teams/${teamId}`)
      .set('Cookie', applicantCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, teamId);
    assert.equal(res.body.data.creator.fullName, 'Team Creator');
    assert.equal(res.body.data.isCreator, false);
    assert.equal(res.body.data.members.length, 1);
  });

  it('5. should allow a student to apply to join a team request', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Web3 Identity Verifier',
        context: 'Web3 Summit',
        category: 'Hackathon',
        description: 'Verifiable credentials for college diplomas.',
        requiredSkills: ['Rust', 'React'],
        teamSize: 4,
        openPositions: 2,
      });

    const teamId = createRes.body.data.id;

    const applyRes = await request(app)
      .post(`/api/teams/${teamId}/apply`)
      .set('Cookie', applicantCookie)
      .send({
        message: 'Experienced with React and Zero Knowledge proofs.',
        skills: ['React', 'TypeScript'],
      });

    assert.equal(applyRes.status, 201);
    assert.equal(applyRes.body.data.status, 'PENDING');
  });

  it('6. should forbid team creator from applying to their own team', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Smart Waste Management',
        context: 'Campus Hackathon',
        category: 'Hackathon',
        description: 'IoT sensors on campus garbage bins.',
        requiredSkills: ['ESP32', 'MQTT'],
        teamSize: 3,
        openPositions: 1,
      });

    const teamId = createRes.body.data.id;

    const applyRes = await request(app)
      .post(`/api/teams/${teamId}/apply`)
      .set('Cookie', creatorCookie)
      .send({ message: 'I want to apply to my own team.' });

    assert.equal(applyRes.status, 400);
    assert.match(applyRes.body.message, /creator of this team/i);
  });

  it('7. should prevent duplicate applications to the same team', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Solar Tracker IoT',
        context: 'Green Tech Challenge',
        category: 'Research',
        description: 'Dual-axis solar panel tracker with IoT metrics.',
        requiredSkills: ['Arduino', 'C++'],
        teamSize: 3,
        openPositions: 1,
      });

    const teamId = createRes.body.data.id;

    // First application
    const firstApply = await request(app)
      .post(`/api/teams/${teamId}/apply`)
      .set('Cookie', applicantCookie)
      .send({ message: 'First application' });

    assert.equal(firstApply.status, 201);

    // Duplicate application
    const duplicateApply = await request(app)
      .post(`/api/teams/${teamId}/apply`)
      .set('Cookie', applicantCookie)
      .send({ message: 'Second application attempt' });

    assert.equal(duplicateApply.status, 400);
    assert.match(duplicateApply.body.message, /already applied/i);
  });

  it('8. should allow team creator to accept an application and update team roster', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Campus Food Saver',
        context: 'Social Good Hackathon',
        category: 'Hackathon',
        description: 'Redistribute surplus mess food to local shelters.',
        requiredSkills: ['Flutter', 'Node.js'],
        teamSize: 3,
        openPositions: 1,
      });

    const teamId = createRes.body.data.id;

    // Applicant applies
    await request(app)
      .post(`/api/teams/${teamId}/apply`)
      .set('Cookie', applicantCookie)
      .send({ message: 'Flutter developer ready to build!' });

    // Creator gets applications
    const appsRes = await request(app)
      .get(`/api/teams/${teamId}/applications`)
      .set('Cookie', creatorCookie);

    assert.equal(appsRes.status, 200);
    assert.equal(appsRes.body.data.length, 1);
    const appId = appsRes.body.data[0].id;

    // Creator accepts application
    const acceptRes = await request(app)
      .patch(`/api/teams/applications/${appId}`)
      .set('Cookie', creatorCookie)
      .send({ status: 'ACCEPTED' });

    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.body.data.status, 'ACCEPTED');

    // Verify team details updated (openPositions decremented to 0, status FILLED)
    const teamCheck = await request(app)
      .get(`/api/teams/${teamId}`)
      .set('Cookie', creatorCookie);

    assert.equal(teamCheck.body.data.members.length, 2);
    assert.equal(teamCheck.body.data.openPositions, 0);
    assert.equal(teamCheck.body.data.status, 'FILLED');
  });

  it('9. should forbid non-creator students from reviewing applications or deleting team requests', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'VR Campus Tour',
        context: 'Open House',
        category: 'Capstone',
        description: 'Virtual Reality campus tour in Unity.',
        requiredSkills: ['Unity', 'C#'],
        teamSize: 3,
        openPositions: 2,
      });

    const teamId = createRes.body.data.id;

    // Other student tries to view applications
    const rogueApps = await request(app)
      .get(`/api/teams/${teamId}/applications`)
      .set('Cookie', otherCookie);

    assert.equal(rogueApps.status, 403);

    // Other student tries to delete team request
    const rogueDelete = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set('Cookie', otherCookie);

    assert.equal(rogueDelete.status, 403);
  });

  it('10. should allow admin to delete any team request', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Spam Team Request',
        context: 'Fake Event',
        category: 'Other',
        description: 'Spam description violating policies.',
        requiredSkills: ['None'],
        teamSize: 2,
        openPositions: 1,
      });

    const teamId = createRes.body.data.id;

    // Admin deletes
    const adminDelete = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set('Cookie', adminCookie);

    assert.equal(adminDelete.status, 200);

    // Verify gone
    const checkRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .set('Cookie', creatorCookie);

    assert.equal(checkRes.status, 404);
  });
});
