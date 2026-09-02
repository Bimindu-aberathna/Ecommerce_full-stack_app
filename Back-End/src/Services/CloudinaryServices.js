const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} imageBuffer - Image buffer from multer (memoryStorage)
 * @param {String} folder - Folder name (e.g., 'products', 'avatars')
 * @param {String} filename - Optional filename without extension
 * @returns {Object} { success, url, filePath }
 */
const uploadImage = (imageBuffer, folder = 'images', filename = null) => {
  return new Promise((resolve) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
    };

    if (filename) {
      uploadOptions.public_id = filename.replace(/\.[^/.]+$/, '');
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Upload image error:', error.message);
          return resolve({ success: false, error: error.message });
        }

        resolve({
          success: true,
          url: result.secure_url,
          filePath: result.public_id, 
        });
      }
    );

    
    Readable.from(imageBuffer).pipe(uploadStream);
  });
};

/**
 * Delete an image by URL or Cloudinary public_id
 * @param {String} imageUrl - Cloudinary secure_url or public_id
 * @returns {Object} { success, message }
 */
const deleteImage = async (imageUrl) => {
  try {
    let publicId = imageUrl;

    // Extract public_id if a full Cloudinary URL was provided
    if (imageUrl.includes('res.cloudinary.com')) {
      const parts = imageUrl.split('/upload/');
      if (parts[1]) {
        
        publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
      }
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return { success: false, error: `Cloudinary response: ${result.result}` };
    }

    console.log('Image deleted successfully:', publicId);
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Delete image error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  cloudinary,
};