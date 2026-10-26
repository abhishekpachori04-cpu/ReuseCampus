import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer or base64 data URI to Cloudinary with auto-compression.
 * Applies folder: 'reusecampus', format: 'webp', width limit: 800, quality: 'auto'.
 *
 * @param {Buffer|string} fileInput - Buffer from multer or base64 data URI string
 * @param {string} [mimetype='image/jpeg'] - Optional MIME type
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
export const uploadToCloudinary = (fileInput, mimetype = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'reusecampus',
      format: 'webp',
      transformation: [
        { width: 800, crop: 'limit' },
        { quality: 'auto' },
      ],
    };

    if (Buffer.isBuffer(fileInput)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            const err = new Error(error.message || 'Cloudinary upload stream failed');
            err.http_code = error.http_code;
            return reject(err);
          }
          resolve(result);
        }
      );
      uploadStream.end(fileInput);
    } else if (typeof fileInput === 'string') {
      // Handle base64 data URI or remote image URL
      cloudinary.uploader.upload(fileInput, uploadOptions, (error, result) => {
        if (error) {
          const err = new Error(error.message || 'Cloudinary upload failed');
          err.http_code = error.http_code;
          return reject(err);
        }
        resolve(result);
      });
    } else {
      reject(new Error('Invalid file input for Cloudinary upload'));
    }
  });
};

export default cloudinary;
