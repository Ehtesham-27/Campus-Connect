import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  },
  get PORT() {
    return parseInt(process.env.PORT, 10) || 5000;
  },
  get FRONTEND_URL() {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  },
  get MONGODB_URI() {
    return process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_connect';
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_campus_connect';
  },
  get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '1d';
  },
  get COOKIE_NAME() {
    return process.env.COOKIE_NAME || 'campus_connect_token';
  },
  get COOKIE_SECURE() {
    if (process.env.COOKIE_SECURE !== undefined) {
      return process.env.COOKIE_SECURE === 'true';
    }
    return this.NODE_ENV === 'production';
  },
  get COOKIE_SAMESITE() {
    // Default to 'lax' for standard same-site topology; allows 'none' only if explicitly configured
    const setting = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
    return ['lax', 'strict', 'none'].includes(setting) ? setting : 'lax';
  },
  get PASSWORD_RESET_URL() {
    return process.env.PASSWORD_RESET_URL || 'http://localhost:5173/reset-password';
  },
  EMAIL: {
    get HOST() {
      return process.env.EMAIL_HOST || '';
    },
    get PORT() {
      return parseInt(process.env.EMAIL_PORT, 10) || 587;
    },
    get USER() {
      return process.env.EMAIL_USER || '';
    },
    get PASS() {
      return process.env.EMAIL_PASSWORD || '';
    },
    get FROM() {
      return process.env.EMAIL_FROM || 'no-reply@campusconnect.edu';
    },
  },
  CLOUDINARY: {
    get CLOUD_NAME() {
      return process.env.CLOUDINARY_CLOUD_NAME || '';
    },
    get API_KEY() {
      return process.env.CLOUDINARY_API_KEY || '';
    },
    get API_SECRET() {
      return process.env.CLOUDINARY_API_SECRET || '';
    },
  },
};
