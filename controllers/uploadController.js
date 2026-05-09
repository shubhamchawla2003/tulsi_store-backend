import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export const uploadImage = async (req, res) => {
  const cloudConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  if (!cloudConfigured) {
    // remove uploaded temp file if present
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({ message: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env' });
  }

  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'tulsi_store' });
    // remove temp file after successful upload
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.json({ url: result.secure_url });
  } catch (error) {
    // cleanup temp file on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ message: error.message || 'Image upload failed', details: String(error) });
  }
};

export default uploadImage;
