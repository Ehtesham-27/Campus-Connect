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
import { seedAdminUser } from '../src/scripts/seedAdmin.js';

let mongoServer;

describe('Campus Connect — Milestone 2 Final Hardening Audit Suite', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const validStudentData = {
    fullName: 'Alex Sharma',
    collegeEmail: 'alex.sharma@dtu.ac.in',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    college: 'Delhi Technological University',
    course: 'B.Tech',
    branch: 'Computer Science',
    academicYear: '3rd Year',
    semester: '5',
  };

  describe('1. Student Registration & Security', () => {
    it('1.1 should register a student with valid inputs and set HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validStudentData)
        .expect(201);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.email, 'alex.sharma@dtu.ac.in');
      assert.equal(res.body.data.user.fullName, 'Alex Sharma');
      assert.equal(res.body.data.user.role, 'student');
      assert.equal(res.body.data.user.password, undefined);

      // Verify cookie attributes
      const cookies = res.headers['set-cookie'];
      assert.ok(cookies, 'Expected Set-Cookie header');
      const cookieHeader = cookies.find((c) => c.includes('campus_connect_token'));
      assert.ok(cookieHeader, 'Expected campus_connect_token in Set-Cookie header');
      assert.ok(cookieHeader.includes('HttpOnly'), 'Cookie must be HttpOnly');
      assert.ok(cookieHeader.includes('Path=/'), 'Cookie path must be root');
      assert.ok(cookieHeader.toLowerCase().includes('samesite=lax'), 'Cookie must specify SameSite=Lax');
    });

    it('1.2 should support the versioned route /api/v1/auth/register', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validStudentData,
          collegeEmail: 'v1.student@college.edu',
        })
        .expect(201);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.email, 'v1.student@college.edu');
    });

    it('1.3 should return 409 Conflict when registering with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validStudentData).expect(201);

      const dupRes = await request(app)
        .post('/api/auth/register')
        .send(validStudentData)
        .expect(409);

      assert.equal(dupRes.body.success, false);
      assert.match(dupRes.body.message, /already exists/i);
    });

    it('1.4 should return 400 Bad Request when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Incomplete User',
          collegeEmail: 'incomplete@dtu.ac.in',
        })
        .expect(400);

      assert.equal(res.body.success, false);
    });

    it('1.5 should return 400 when password is fewer than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validStudentData,
          password: 'short',
          confirmPassword: 'short',
        })
        .expect(400);

      assert.equal(res.body.success, false);
    });

    it('1.6 should NEVER allow privilege escalation to admin during public registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validStudentData,
          role: 'admin',
        })
        .expect(201);

      assert.equal(res.body.data.user.role, 'student', 'Role must remain student');

      const dbUser = await User.findOne({ email: 'alex.sharma@dtu.ac.in' });
      assert.equal(dbUser.role, 'student', 'Database record must strictly have role student');
    });

    it('1.7 should verify password is cryptographically hashed with bcrypt and not plaintext', async () => {
      await request(app).post('/api/auth/register').send(validStudentData).expect(201);

      const dbUser = await User.findOne({ email: 'alex.sharma@dtu.ac.in' }).select('+password');
      assert.notEqual(dbUser.password, 'Password123!');
      assert.ok(dbUser.password.startsWith('$2'), 'Password hash must be a bcrypt hash string');
    });
  });

  describe('2. User Authentication, Session Survival & CSRF Security', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validStudentData);
    });

    it('2.1 should login with valid credentials and return user info + HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.sharma@dtu.ac.in',
          password: 'Password123!',
        })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.email, 'alex.sharma@dtu.ac.in');
      assert.equal(res.body.data.user.password, undefined);

      const cookies = res.headers['set-cookie'];
      assert.ok(cookies);
      const cookieHeader = cookies.find((c) => c.includes('campus_connect_token'));
      assert.ok(cookieHeader);
      assert.ok(cookieHeader.includes('HttpOnly'));
    });

    it('2.2 should return 401 Unauthorized with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.sharma@dtu.ac.in',
          password: 'WrongPassword!',
        })
        .expect(401);

      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid college email or password/i);
    });

    it('2.3 should return 401 Unauthorized with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@college.edu',
          password: 'Password123!',
        })
        .expect(401);

      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid college email or password/i);
    });

    it('2.4 should logout and clear the auth cookie with matching options', async () => {
      const res = await request(app).post('/api/auth/logout').expect(200);

      assert.equal(res.body.success, true);
      const cookies = res.headers['set-cookie'];
      assert.ok(cookies);
      const cookieHeader = cookies.find((c) => c.includes('campus_connect_token'));
      assert.ok(cookieHeader);
      assert.ok(cookieHeader.includes('HttpOnly'));
      assert.ok(cookieHeader.includes('Path=/'));
    });

    it('2.5 should reject cookie-authenticated state-changing request from unauthorized cross-site origin (CSRF defense)', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.sharma@dtu.ac.in',
          password: 'Password123!',
        });

      const cookie = loginRes.headers['set-cookie'];

      // Malicious third party attempting cross-origin mutation with ambient cookies
      const csrfRes = await request(app)
        .patch('/api/users/me')
        .set('Cookie', cookie)
        .set('Origin', 'http://malicious-attacker-domain.xyz')
        .send({ bio: 'Attacker payload' })
        .expect(403);

      assert.equal(csrfRes.body.success, false);
      assert.match(csrfRes.body.message, /(CORS policy violation|CSRF protection).*not authorized/i);
    });

    it('2.6 should permit cookie-authenticated state-changing request from authorized frontend origin', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.sharma@dtu.ac.in',
          password: 'Password123!',
        });

      const cookie = loginRes.headers['set-cookie'];

      const validRes = await request(app)
        .patch('/api/users/me')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:5173')
        .send({ bio: 'Valid bio from approved origin' })
        .expect(200);

      assert.equal(validRes.body.success, true);
      assert.equal(validRes.body.data.bio, 'Valid bio from approved origin');
    });

    it('2.7 should reject CORS preflight from unauthorized origin', async () => {
      const corsRes = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://evil.com')
        .set('Access-Control-Request-Method', 'POST')
        .expect(403);

      assert.equal(corsRes.body.success, false);
    });
  });

  describe('3. Current Session & Token Verification (/api/auth/me)', () => {
    it('3.1 should return authenticated user profile when authenticated with cookie (refresh simulation)', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validStudentData);
      const cookie = regRes.headers['set-cookie'];

      // Browser page refresh sends cookie to /api/auth/me
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      assert.equal(meRes.body.success, true);
      assert.equal(meRes.body.data.email, 'alex.sharma@dtu.ac.in');
      assert.equal(meRes.body.data.role, 'student');
      assert.equal(meRes.body.data.semester, '5');
    });

    it('3.2 should return authenticated user profile when authenticated with Bearer token', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validStudentData);
      const token = regRes.body.data.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      assert.equal(meRes.body.success, true);
      assert.equal(meRes.body.data.email, 'alex.sharma@dtu.ac.in');
    });

    it('3.3 should return 401 Unauthorized when requesting /api/auth/me without token', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);
      assert.equal(res.body.success, false);
    });

    it('3.4 should return 401 Unauthorized when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.malformed.token')
        .expect(401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid authentication token/i);
    });
  });

  describe('4. Profile API Completeness (Permitted & Prohibited Fields)', () => {
    let authCookie;

    beforeEach(async () => {
      const regRes = await request(app).post('/api/auth/register').send(validStudentData);
      authCookie = regRes.headers['set-cookie'];
    });

    it('4.1 should retrieve complete profile via GET /api/users/me', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Cookie', authCookie)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, 'alex.sharma@dtu.ac.in');
      assert.equal(res.body.data.college, 'Delhi Technological University');
      assert.equal(res.body.data.course, 'B.Tech');
      assert.equal(res.body.data.academicYear, '3rd Year');
      assert.equal(res.body.data.semester, '5');
    });

    it('4.2 should support updating EVERY approved editable field via PATCH /api/users/me', async () => {
      const fullPermittedUpdate = {
        fullName: 'Alexander Sharma',
        college: 'Indian Institute of Technology Delhi',
        course: 'Master of Technology',
        academicYear: 'Final Year',
        semester: '8',
        interests: ['Distributed Systems', 'Cryptography', 'Autonomous AI'],
        skills: ['TypeScript', 'Rust', 'Docker', 'MongoDB', 'Go'],
        bio: 'Senior graduate researcher in distributed systems and systems architecture.',
      };

      const res = await request(app)
        .patch('/api/users/me')
        .set('Cookie', authCookie)
        .send(fullPermittedUpdate)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.fullName, fullPermittedUpdate.fullName);
      assert.equal(res.body.data.college, fullPermittedUpdate.college);
      assert.equal(res.body.data.course, fullPermittedUpdate.course);
      assert.equal(res.body.data.academicYear, fullPermittedUpdate.academicYear);
      assert.equal(res.body.data.semester, fullPermittedUpdate.semester);
      assert.deepEqual(res.body.data.interests, fullPermittedUpdate.interests);
      assert.deepEqual(res.body.data.skills, fullPermittedUpdate.skills);
      assert.equal(res.body.data.bio, fullPermittedUpdate.bio);

      // Verify persistence directly in the database
      const dbUser = await User.findOne({ email: 'alex.sharma@dtu.ac.in' });
      assert.equal(dbUser.fullName, 'Alexander Sharma');
      assert.equal(dbUser.college, 'Indian Institute of Technology Delhi');
      assert.equal(dbUser.course, 'Master of Technology');
      assert.equal(dbUser.academicYear, 'Final Year');
      assert.equal(dbUser.semester, '8');
      assert.deepEqual(dbUser.interests, fullPermittedUpdate.interests);
      assert.deepEqual(dbUser.skills, fullPermittedUpdate.skills);
      assert.equal(dbUser.bio, fullPermittedUpdate.bio);
    });

    it('4.3 should STRICTLY REJECT modifications to all prohibited fields (email, password, role, status, reset tokens)', async () => {
      const prohibitedPayload = {
        email: 'malicious.attacker@external.edu',
        password: 'BrandNewHackedPassword999!',
        role: 'admin',
        status: 'SUSPENDED',
        passwordResetToken: 'attacker_fake_token_hash',
        passwordResetExpires: new Date(Date.now() + 1000000),
        bio: 'Legitimate bio update accompanied by prohibited fields',
      };

      const res = await request(app)
        .patch('/api/users/me')
        .set('Cookie', authCookie)
        .send(prohibitedPayload)
        .expect(200);

      // Permitted bio must be updated
      assert.equal(res.body.data.bio, 'Legitimate bio update accompanied by prohibited fields');

      // Prohibited fields must remain unchanged
      assert.equal(res.body.data.email, 'alex.sharma@dtu.ac.in');
      assert.equal(res.body.data.role, 'student');
      assert.equal(res.body.data.status, 'ACTIVE');

      // Inspect DB document directly including hidden fields
      const dbUser = await User.findOne({ email: 'alex.sharma@dtu.ac.in' }).select(
        '+password +passwordResetToken +passwordResetExpires'
      );
      assert.equal(dbUser.email, 'alex.sharma@dtu.ac.in', 'Email must remain untouched');
      assert.equal(dbUser.role, 'student', 'Role must remain student');
      assert.equal(dbUser.status, 'ACTIVE', 'Account status must remain ACTIVE');
      assert.equal(dbUser.passwordResetToken, undefined, 'Reset token must remain undefined');
      assert.equal(dbUser.passwordResetExpires, undefined, 'Reset expiration must remain undefined');

      // Verify original password was NOT modified
      const isOriginalPassword = await dbUser.comparePassword('Password123!');
      assert.equal(isOriginalPassword, true, 'Original password must remain intact');
      const isHackedPassword = await dbUser.comparePassword('BrandNewHackedPassword999!');
      assert.equal(isHackedPassword, false, 'Injected password must not be active');
    });
  });

  describe('5. Password Recovery Flow & Token Expiry', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validStudentData);
    });

    it('5.1 should generate a password reset token on POST /api/auth/forgot-password', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'alex.sharma@dtu.ac.in' })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.data.resetToken, 'Reset token should be present in test mode');

      const dbUser = await User.findOne({ email: 'alex.sharma@dtu.ac.in' }).select(
        '+passwordResetToken +passwordResetExpires'
      );
      assert.ok(dbUser.passwordResetToken);
      assert.ok(dbUser.passwordResetExpires > Date.now());
    });

    it('5.2 should not leak account existence when requesting password reset for unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'unknown.student@college.edu' })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.match(res.body.message, /if an account exists/i);
    });

    it('5.3 should reset password with valid token, allow login with new password, and invalidate token (single-use)', async () => {
      // Step 1: Request reset
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'alex.sharma@dtu.ac.in' })
        .expect(200);

      const rawToken = forgotRes.body.data.resetToken;
      assert.ok(rawToken);

      // Step 2: Reset password with token
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          newPassword: 'BrandNewSecurePassword456!',
        })
        .expect(200);

      assert.equal(resetRes.body.success, true);

      // Step 3: Single-use check — Attempting to reuse the same token must fail with 400
      const reuseRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          newPassword: 'AnotherPasswordAttempt789!',
        })
        .expect(400);

      assert.equal(reuseRes.body.success, false);
      assert.match(reuseRes.body.message, /invalid or has expired/i);

      // Step 4: Login with old password must fail
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.sharma@dtu.ac.in',
          password: 'Password123!',
        })
        .expect(401);

      // Step 5: Login with new password must succeed
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.sharma@dtu.ac.in',
          password: 'BrandNewSecurePassword456!',
        })
        .expect(200);

      assert.equal(newLoginRes.body.success, true);
    });

    it('5.4 should reject password reset when token has expired', async () => {
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'alex.sharma@dtu.ac.in' });

      const rawToken = forgotRes.body.data.resetToken;

      // Manually set expiration to past
      await User.updateOne(
        { email: 'alex.sharma@dtu.ac.in' },
        { passwordResetExpires: new Date(Date.now() - 60 * 1000) }
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          newPassword: 'NewPassword123!',
        })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid or has expired/i);
    });
  });

  describe('6. Admin Provisioning Hardening (seedAdmin)', () => {
    it('6.1 should refuse to seed admin without explicit ADMIN_PASSWORD', async () => {
      await assert.rejects(
        async () => {
          await seedAdminUser({ email: 'admin@campusconnect.edu' }); // no password
        },
        /ADMIN_PASSWORD environment variable.*required/i
      );
    });

    it('6.2 should provision admin when credentials are provided and remain idempotent on repeated execution', async () => {
      // First execution: creates admin
      const result1 = await seedAdminUser({
        email: 'verified.admin@campusconnect.edu',
        password: 'AdminSecureKey#2026',
      });
      assert.equal(result1.created, true);
      assert.equal(result1.admin.email, 'verified.admin@campusconnect.edu');
      assert.equal(result1.admin.role, 'admin');

      // Second execution: detects existing admin without duplicate creation
      const result2 = await seedAdminUser({
        email: 'verified.admin@campusconnect.edu',
        password: 'AdminSecureKey#2026',
      });
      assert.equal(result2.created, false);
      assert.equal(result2.admin.email, 'verified.admin@campusconnect.edu');

      // Verify only 1 admin exists in DB
      const count = await User.countDocuments({ email: 'verified.admin@campusconnect.edu' });
      assert.equal(count, 1);
    });
  });

  describe('7. Role Authorization & Protected Admin Routes', () => {
    it('7.1 should block unauthenticated requests to /api/admin/dashboard with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard').expect(401);
      assert.equal(res.body.success, false);
    });

    it('7.2 should block student sessions from accessing /api/admin/dashboard with 403', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validStudentData);
      const studentCookie = regRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', studentCookie)
        .expect(403);

      assert.equal(res.body.success, false);
      assert.match(res.body.message, /access forbidden/i);
    });

    it('7.3 should permit seeded admin user to access /api/admin/dashboard with 200', async () => {
      await seedAdminUser({
        email: 'admin.auth@campusconnect.edu',
        password: 'AdminPass#Strong789',
      });

      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin.auth@campusconnect.edu',
          password: 'AdminPass#Strong789',
        })
        .expect(200);

      const adminCookie = adminLoginRes.headers['set-cookie'];

      const adminRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', adminCookie)
        .expect(200);

      assert.equal(adminRes.body.success, true);
      assert.equal(adminRes.body.data.module, 'admin');
    });
  });
});
