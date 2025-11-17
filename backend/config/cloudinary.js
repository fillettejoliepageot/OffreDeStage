const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileDataUrl, folder, resourceType = 'auto') => {
  if (!fileDataUrl) return null;

  const uploadOptions = {
    folder,
    resource_type: resourceType,
  };

  const result = await cloudinary.uploader.upload(fileDataUrl, uploadOptions);
  return result.secure_url;
};

module.exports = uploadToCloudinary;
