import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';
import { connectDB } from '../config/db.js';

/**
 * Provision or verify an Administrator account.
 * Requires administrator credentials to be explicitly supplied via environment variables
 * or programmatic argument. Refuses to use predictable default passwords.
 *
 * @param {Object} adminData
 * @param {string} [adminData.email]
 * @param {string} [adminData.password]
 * @param {string} [adminData.fullName]
 * @param {string} [adminData.college]
 * @param {string} [adminData.course]
 */
export const seedAdminUser = async (adminData = {}) => {
  const email = (adminData.email || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = adminData.password || process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error(
      'Administrator provisioning failed: ADMIN_EMAIL environment variable or explicit email parameter is required.'
    );
  }

  let existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    if (existingAdmin.role !== ROLES.ADMIN) {
      existingAdmin.role = ROLES.ADMIN;
      await existingAdmin.save();
    }
    return { admin: existingAdmin.toSafeObject(), created: false };
  }

  if (!password || password.length < 8) {
    throw new Error(
      'Administrator provisioning failed: ADMIN_PASSWORD environment variable (at least 8 characters) is required. Predictable default passwords are strictly prohibited.'
    );
  }

  const fullName = adminData.fullName || process.env.ADMIN_FULL_NAME || 'Campus Administrator';
  const college = adminData.college || process.env.ADMIN_COLLEGE || 'Central University Administration';
  const course = adminData.course || 'Administration';

  const newAdmin = await User.create({
    fullName,
    email,
    password,
    college,
    course,
    branch: 'Central Administration',
    academicYear: 'Staff',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });

  return { admin: newAdmin.toSafeObject(), created: true };
};

// Direct command-line execution
if (process.argv[1] && process.argv[1].endsWith('seedAdmin.js')) {
  (async () => {
    try {
      console.log('Connecting to database...');
      await connectDB();
      const result = await seedAdminUser();
      console.log(
        result.created
          ? `[SUCCESS] Created new administrator account: ${result.admin.email}`
          : `[INFO] Administrator account already exists: ${result.admin.email}`
      );
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error(`[ERROR] Provisioning halted: ${err.message}`);
      process.exit(1);
    }
  })();
}
