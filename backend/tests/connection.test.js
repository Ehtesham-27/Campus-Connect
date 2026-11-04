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
import { ConnectionRequest } from '../src/models/Connection.js';

let mongoServer;
let studentAId;
let studentBId;
let studentCId;
let cookieA;
let cookieB;
let cookieC;

describe('Campus Connect — Phase 2: Module 5 (Connections)', () => {
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
    await ConnectionRequest.deleteMany({});
    await User.deleteMany({});

    // Register Student A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Student Alice',
        collegeEmail: 'alice@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech CSE',
        academicYear: '3rd Year',
      });
    cookieA = resA.headers['set-cookie'];
    studentAId = resA.body.data.user.id;

    // Register Student B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Student Bob',
        collegeEmail: 'bob@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech IT',
        academicYear: '3rd Year',
      });
    cookieB = resB.headers['set-cookie'];
    studentBId = resB.body.data.user.id;

    // Register Student C
    const resC = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Student Charlie',
        collegeEmail: 'charlie@dtu.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Delhi Technological University',
        course: 'B.Tech ECE',
        academicYear: '2nd Year',
      });
    cookieC = resC.headers['set-cookie'];
    studentCId = resC.body.data.user.id;
  });

  it('1. should allow Student A to send a connection request to Student B', async () => {
    const res = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({
        recipientId: studentBId,
        message: 'Hey Bob, would love to connect for tech projects!',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.recipient, studentBId);
    assert.equal(res.body.data.status, 'PENDING');
    assert.equal(res.body.data.message, 'Hey Bob, would love to connect for tech projects!');
  });

  it('2. should forbid sending a connection request to oneself', async () => {
    const res = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({
        recipientId: studentAId,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /cannot send a connection request to yourself/i);
  });

  it('3. should prevent duplicate connection requests', async () => {
    // Send first request
    await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    // Try sending again from A to B
    const duplicateRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    assert.equal(duplicateRes.status, 400);
    assert.match(duplicateRes.body.message, /already been sent/i);

    // Try sending inverse from B to A while pending
    const inverseRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieB)
      .send({ recipientId: studentAId });

    assert.equal(inverseRes.status, 400);
    assert.match(inverseRes.body.message, /already sent you a connection request/i);
  });

  it('4. should list pending requests correctly for sender and recipient', async () => {
    // A sends to B
    await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId, message: 'Connect request A -> B' });

    // Check B incoming requests
    const resB = await request(app)
      .get('/api/connections/requests')
      .set('Cookie', cookieB);

    assert.equal(resB.status, 200);
    assert.equal(resB.body.data.incoming.length, 1);
    assert.equal(resB.body.data.incoming[0].sender.fullName, 'Student Alice');
    assert.equal(resB.body.data.incoming[0].message, 'Connect request A -> B');
    assert.equal(resB.body.data.outgoing.length, 0);

    // Check A outgoing requests
    const resA = await request(app)
      .get('/api/connections/requests')
      .set('Cookie', cookieA);

    assert.equal(resA.status, 200);
    assert.equal(resA.body.data.outgoing.length, 1);
    assert.equal(resA.body.data.outgoing[0].recipient.fullName, 'Student Bob');
    assert.equal(resA.body.data.incoming.length, 0);
  });

  it('5. should allow recipient to accept connection request and list accepted connection', async () => {
    // A sends to B
    const sendRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    const requestId = sendRes.body.data.id;

    // B accepts request
    const acceptRes = await request(app)
      .patch(`/api/connections/requests/${requestId}/accept`)
      .set('Cookie', cookieB);

    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.body.data.status, 'ACCEPTED');

    // Check A connections list
    const resA = await request(app)
      .get('/api/connections')
      .set('Cookie', cookieA);

    assert.equal(resA.status, 200);
    assert.equal(resA.body.data.total, 1);
    assert.equal(resA.body.data.connections[0].peer.fullName, 'Student Bob');

    // Check B connections list
    const resB = await request(app)
      .get('/api/connections')
      .set('Cookie', cookieB);

    assert.equal(resB.status, 200);
    assert.equal(resB.body.data.total, 1);
    assert.equal(resB.body.data.connections[0].peer.fullName, 'Student Alice');
  });

  it('6. should prevent non-recipients from accepting connection requests', async () => {
    // A sends to B
    const sendRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    const requestId = sendRes.body.data.id;

    // C attempts to accept request intended for B
    const rogueRes = await request(app)
      .patch(`/api/connections/requests/${requestId}/accept`)
      .set('Cookie', cookieC);

    assert.equal(rogueRes.status, 403);
  });

  it('7. should allow recipient to reject a connection request', async () => {
    // A sends to B
    const sendRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    const requestId = sendRes.body.data.id;

    // B rejects request
    const rejectRes = await request(app)
      .patch(`/api/connections/requests/${requestId}/reject`)
      .set('Cookie', cookieB);

    assert.equal(rejectRes.status, 200);
    assert.equal(rejectRes.body.data.status, 'REJECTED');

    // Connections list for both should remain 0
    const listRes = await request(app)
      .get('/api/connections')
      .set('Cookie', cookieA);

    assert.equal(listRes.body.data.total, 0);
  });

  it('8. should allow requester to cancel a pending outgoing request', async () => {
    // A sends to B
    const sendRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    const requestId = sendRes.body.data.id;

    // A cancels request
    const cancelRes = await request(app)
      .delete(`/api/connections/requests/${requestId}`)
      .set('Cookie', cookieA);

    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.success, true);

    // B incoming requests should now be empty
    const resB = await request(app)
      .get('/api/connections/requests')
      .set('Cookie', cookieB);

    assert.equal(resB.body.data.incoming.length, 0);
  });

  it('9. should allow removing an existing accepted connection', async () => {
    // A sends to B and B accepts
    const sendRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    const requestId = sendRes.body.data.id;

    await request(app)
      .patch(`/api/connections/requests/${requestId}/accept`)
      .set('Cookie', cookieB);

    // Verify connected
    const beforeRemove = await request(app)
      .get('/api/connections')
      .set('Cookie', cookieA);
    assert.equal(beforeRemove.body.data.total, 1);

    const connectionId = beforeRemove.body.data.connections[0].id;

    // B removes connection
    const removeRes = await request(app)
      .delete(`/api/connections/${connectionId}`)
      .set('Cookie', cookieB);

    assert.equal(removeRes.status, 200);

    // Verify disconnected for both
    const afterA = await request(app)
      .get('/api/connections')
      .set('Cookie', cookieA);
    assert.equal(afterA.body.data.total, 0);

    const afterB = await request(app)
      .get('/api/connections')
      .set('Cookie', cookieB);
    assert.equal(afterB.body.data.total, 0);
  });

  it('10. should report connection status correctly between users', async () => {
    // Before any request -> NONE
    const status1 = await request(app)
      .get(`/api/connections/status/${studentBId}`)
      .set('Cookie', cookieA);
    assert.equal(status1.body.data.status, 'NONE');

    // A sends request -> PENDING_SENT for A, PENDING_RECEIVED for B
    const sendRes = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    const statusA = await request(app)
      .get(`/api/connections/status/${studentBId}`)
      .set('Cookie', cookieA);
    assert.equal(statusA.body.data.status, 'PENDING_SENT');

    const statusB = await request(app)
      .get(`/api/connections/status/${studentAId}`)
      .set('Cookie', cookieB);
    assert.equal(statusB.body.data.status, 'PENDING_RECEIVED');

    // After accept -> CONNECTED for both
    await request(app)
      .patch(`/api/connections/requests/${sendRes.body.data.id}/accept`)
      .set('Cookie', cookieB);

    const statusConnectedA = await request(app)
      .get(`/api/connections/status/${studentBId}`)
      .set('Cookie', cookieA);
    assert.equal(statusConnectedA.body.data.status, 'CONNECTED');
  });

  it('11. should reject sending a connection request to a suspended student account (regression test)', async () => {
    // Suspend Student B using schema field 'status'
    await User.findByIdAndUpdate(studentBId, { status: 'SUSPENDED' });

    const res = await request(app)
      .post('/api/connections/requests')
      .set('Cookie', cookieA)
      .send({ recipientId: studentBId });

    assert.equal(res.status, 404);
    assert.match(res.body.message, /not found or unavailable/i);
  });
});

