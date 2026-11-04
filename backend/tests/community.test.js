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
import { CommunityMembership } from '../src/models/CommunityMembership.js';

let mongoServer;
let ownerCookie;
let memberCookie;

describe('Campus Connect — Phase 2: Module 2 (Communities)', () => {
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
    await CommunityMembership.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});

    // Register User 1 (Community Founder / Owner)
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Founder User',
        collegeEmail: 'founder@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        academicYear: '3rd Year',
      });
    ownerCookie = res1.headers['set-cookie'];

    // Register User 2 (Peer Member)
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Peer Student',
        collegeEmail: 'peer@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech',
        academicYear: '2nd Year',
      });
    memberCookie = res2.headers['set-cookie'];
  });

  it('2.1 should create a new community and automatically assign creator as owner', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Open Source Developers',
        category: 'Technical',
        description: 'Building public software and tools for university students.',
        accentColor: 'blue',
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Open Source Developers');
    assert.equal(res.body.data.memberCount, 1);
    assert.equal(res.body.data.isMember, true);
    assert.equal(res.body.data.userRole, 'owner');

    // Verify membership record in database
    const membership = await CommunityMembership.findOne({ community: res.body.data.id });
    assert.ok(membership);
    assert.equal(membership.role, 'owner');
  });

  it('2.2 should reject duplicate community names with 409 Conflict', async () => {
    await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Robotics Club',
        category: 'Technical',
        description: 'Building robots and hardware kits.',
      })
      .expect(201);

    const dupRes = await request(app)
      .post('/api/communities')
      .set('Cookie', memberCookie)
      .send({
        name: 'robotics club', // case-insensitive check
        category: 'Technical',
        description: 'Duplicate club attempt',
      })
      .expect(409);

    assert.equal(dupRes.body.success, false);
    assert.match(dupRes.body.message, /already exists/i);
  });

  it('2.3 should list communities with search and category filters', async () => {
    await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Drama & Theatre Society',
        category: 'Cultural',
        description: 'Campus theatrical productions and stage plays.',
        accentColor: 'pink',
      });

    await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Competitive Programming Society',
        category: 'Technical',
        description: 'Algorithms and contest prep.',
        accentColor: 'yellow',
      });

    // Filter by Category
    const catRes = await request(app)
      .get('/api/communities?category=Cultural')
      .set('Cookie', memberCookie)
      .expect(200);

    assert.equal(catRes.body.success, true);
    assert.equal(catRes.body.data.communities.length, 1);
    assert.equal(catRes.body.data.communities[0].name, 'Drama & Theatre Society');

    // Search by Keyword
    const searchRes = await request(app)
      .get('/api/communities?search=Algorithms')
      .set('Cookie', memberCookie)
      .expect(200);

    assert.equal(searchRes.body.success, true);
    assert.equal(searchRes.body.data.communities.length, 1);
    assert.equal(searchRes.body.data.communities[0].name, 'Competitive Programming Society');
  });

  it('2.4 should join community, increment memberCount, and prevent duplicate memberships', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Machine Learning Lab',
        category: 'Technical',
        description: 'Deep learning paper discussions and projects.',
      });

    const communityId = createRes.body.data.id;

    // Peer joins community
    const joinRes = await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Cookie', memberCookie)
      .expect(200);

    assert.equal(joinRes.body.success, true);
    assert.equal(joinRes.body.data.isMember, true);

    // Verify memberCount updated to 2
    const comm = await Community.findById(communityId);
    assert.equal(comm.memberCount, 2);

    // Attempt duplicate join -> MUST return 409 Conflict
    const dupJoinRes = await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Cookie', memberCookie)
      .expect(409);

    assert.equal(dupJoinRes.body.success, false);
    assert.match(dupJoinRes.body.message, /already a member/i);
  });

  it('2.5 should allow member to leave community and decrement memberCount', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Debate Society',
        category: 'Literary',
        description: 'Parliamentary debate and speech contests.',
      });

    const communityId = createRes.body.data.id;

    // Join first
    await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Cookie', memberCookie)
      .expect(200);

    // Leave
    const leaveRes = await request(app)
      .post(`/api/communities/${communityId}/leave`)
      .set('Cookie', memberCookie)
      .expect(200);

    assert.equal(leaveRes.body.success, true);
    assert.equal(leaveRes.body.data.isMember, false);

    // Verify memberCount back to 1
    const comm = await Community.findById(communityId);
    assert.equal(comm.memberCount, 1);
  });

  it('2.6 should prevent community owner from leaving their own community', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Photography Club',
        category: 'Cultural',
        description: 'Visual storytelling and campus photo walks.',
      });

    const communityId = createRes.body.data.id;

    const leaveRes = await request(app)
      .post(`/api/communities/${communityId}/leave`)
      .set('Cookie', ownerCookie)
      .expect(400);

    assert.equal(leaveRes.body.success, false);
    assert.match(leaveRes.body.message, /owner.*cannot leave/i);
  });

  it('2.7 should list community members via GET /api/communities/:id/members', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Designers Guild',
        category: 'Cultural',
        description: 'UI/UX and visual designers on campus.',
      });

    const communityId = createRes.body.data.id;

    await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Cookie', memberCookie)
      .expect(200);

    const membersRes = await request(app)
      .get(`/api/communities/${communityId}/members`)
      .set('Cookie', ownerCookie)
      .expect(200);

    assert.equal(membersRes.body.success, true);
    assert.equal(membersRes.body.data.members.length, 2);

    const roles = membersRes.body.data.members.map((m) => m.membershipRole);
    assert.ok(roles.includes('owner'));
    assert.ok(roles.includes('member'));
  });

  it('2.8 should restrict community updates to owner or admin (non-owner receives 403)', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Blockchain Club',
        category: 'Technical',
        description: 'Web3 research group.',
      });

    const communityId = createRes.body.data.id;

    // Member attempts unauthorized update -> 403
    const unauthorizedRes = await request(app)
      .patch(`/api/communities/${communityId}`)
      .set('Cookie', memberCookie)
      .send({ description: 'Hacked description' })
      .expect(403);

    assert.equal(unauthorizedRes.body.success, false);

    // Owner updates successfully -> 200
    const ownerRes = await request(app)
      .patch(`/api/communities/${communityId}`)
      .set('Cookie', ownerCookie)
      .send({ description: 'Authorized updated description' })
      .expect(200);

    assert.equal(ownerRes.body.success, true);
    assert.equal(ownerRes.body.data.description, 'Authorized updated description');
  });

  it('2.9 should restrict community deletion to owner or admin', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Temporary Society',
        category: 'Social',
        description: 'To be deleted.',
      });

    const communityId = createRes.body.data.id;

    // Member attempts delete -> 403
    await request(app)
      .delete(`/api/communities/${communityId}`)
      .set('Cookie', memberCookie)
      .expect(403);

    // Owner deletes -> 200
    await request(app)
      .delete(`/api/communities/${communityId}`)
      .set('Cookie', ownerCookie)
      .expect(200);

    // Verify community and memberships are removed from DB
    const comm = await Community.findById(communityId);
    assert.equal(comm, null);
    const count = await CommunityMembership.countDocuments({ community: communityId });
    assert.equal(count, 0);
  });
});

