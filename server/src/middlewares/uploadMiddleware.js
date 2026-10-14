import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter,
});

export const uploadToCloudinary = (fileBuffer, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    // If running under test mode or Cloudinary credentials are not set, return mock URL or skip
    if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn('Cloudinary upload skipped in test/unconfigured mode.');
      return resolve('https://res.cloudinary.com/demo/image/upload/sample.jpg');
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const uploadUrlToCloudinary = async (imageUrl, folder = 'avatars') => {
  if (!imageUrl) return null;
  if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return imageUrl;
  }
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      overwrite: true,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (err) {
    console.error('Failed to upload image URL to Cloudinary:', err);
    return imageUrl;
  }
};

