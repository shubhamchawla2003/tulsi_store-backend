import cloudinary from 'cloudinary';
import fs from 'fs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const file = 'tools/test.png';
if (!fs.existsSync(file)) {
  // create a tiny PNG
  const png = Buffer.from(
    '89504e470d0a1a0a0000000d494844520000000100000001080200000090770d3a0000000a49444154789c6360000002000100ffff03' +
    '0000000049454e44ae426082', 'hex');
  fs.writeFileSync(file, png);
}

(async () => {
  try {
    const res = await cloudinary.v2.uploader.upload(file, { folder: 'tulsi_store_test' });
    console.log('UPLOAD OK', res.secure_url);
  } catch (err) {
    console.error('CLOUD_TEST ERROR', err);
  }
})();
