const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK
let firebaseApp = null;

const initFirebase = () => {
  try {
    if (!firebaseApp) {
      const serviceAccount = require('../../secrets/serviceAccountKey.json');
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'gs://electronics-store-122a9.firebasestorage.app',
      });
      
    }
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    throw error;
  }
};


//  * Get Firebase Storage bucket instance

const getBucket = () => {
  if (!firebaseApp) {
    initFirebase();
  }
  return admin.storage().bucket();
};

/**
 * @param {Buffer} imageBuffer - Image buffer from multer or file read
 * @param {String} folder - Folder name (e.g., 'products', 'avatars')
 * @param {String} filename - Optional filename (will generate unique name if not provided)
 * @returns {Object} { success, url, filePath }
 */
const uploadImage = async (imageBuffer, folder = 'images', filename = null) => {
  try {
    const bucket = getBucket();
    const token = uuidv4();
    const imageName = filename || `${uuidv4()}.jpg`;
    const destinationPath = `${folder}/${imageName}`;
    
    const file = bucket.file(destinationPath);
    
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      contentType: 'image/jpeg',
    };

    await file.save(imageBuffer, {
      metadata: metadata,
      resumable: false,
    });

    // Generate public URL
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destinationPath)}?alt=media&token=${token}`;

    return {
      success: true,
      url: publicUrl,
      filePath: destinationPath,
    };
  } catch (error) {
    console.error('Upload image error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an image by URL
 * @param {String} imageUrl - Full Firebase Storage URL or file path
 * @returns {Object} { success, message }
 */
const deleteImage = async (imageUrl) => {
  try {
    const bucket = getBucket();
    
    // Extract path from URL if full URL is provided
    let path = imageUrl;
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      const matches = imageUrl.match(/\/o\/(.+?)\?/);
      if (matches && matches[1]) {
        path = decodeURIComponent(matches[1]);
      }
    }
    
    const file = bucket.file(path);
    await file.delete();

    console.log('Image deleted successfully:', path);
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Delete image error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initFirebase,
  uploadImage,
  deleteImage,
  getBucket,
  admin,
};