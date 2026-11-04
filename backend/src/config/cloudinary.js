import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

/**
 * Configure Cloudinary SDK with environment credentials
 */
if (ENV.CLOUDINARY.CLOUD_NAME && ENV.CLOUDINARY.API_KEY && ENV.CLOUDINARY.API_SECRET) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
    api_key: ENV.CLOUDINARY.API_KEY,
    api_secret: ENV.CLOUDINARY.API_SECRET,
    secure: true,
  });
}

/**
 * Check if real Cloudinary credentials are configured
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    ENV.CLOUDINARY.CLOUD_NAME &&
    ENV.CLOUDINARY.API_KEY &&
    ENV.CLOUDINARY.API_SECRET
  );
};

export { cloudinary };
export default cloudinary;

