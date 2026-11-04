import crypto from 'crypto';
import { Readable } from 'node:stream';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';

export const uploadService = {
  /**
   * Upload an image buffer to Cloudinary with secure random public ID
   *
   * @param {Buffer} buffer - Raw file buffer from Multer
   * @param {string} folder - Destination subfolder ('avatars' or 'communities')
   * @returns {Promise<string>} Secure image URL
   */
  async uploadImage(buffer, folder = 'general') {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new ApiError(400, 'No valid image data provided for upload.');
    }

    // Always generate an unguessable cryptographic random public ID; never trust original filename
    const safePublicId = crypto.randomUUID();

    // In testing or when Cloudinary credentials are not configured, return safe deterministic mock URL
    if (ENV.NODE_ENV === 'test' || !isCloudinaryConfigured()) {
      return `https://res.cloudinary.com/campus-connect/image/upload/v1/campus_connect/${folder}/${safePublicId}.webp`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `campus_connect/${folder}`,
          public_id: safePublicId,
          resource_type: 'image',
          overwrite: true,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(
              new ApiError(500, `Cloudinary dispatch failed: ${error.message}`)
            );
          }
          if (!result || !result.secure_url) {
            return reject(
              new ApiError(500, 'Cloudinary upload succeeded but returned no secure URL.')
            );
          }
          resolve(result.secure_url);
        }
      );

      // Stream buffer directly into Cloudinary without writing to disk
      uploadStream.end(buffer);
    });
  },
};

export default uploadService;
