import cloudinary from '../config/cloudinary';

/**
 * Upload an image (base64 data URL or remote URL) to Cloudinary and return HTTPS secure URL
 */
export const uploadToCloudinary = async (
  imageBase64OrUrl: string,
  folder: string = 'general'
): Promise<string> => {
  if (!imageBase64OrUrl || typeof imageBase64OrUrl !== 'string') {
    return imageBase64OrUrl;
  }

  // If already a Cloudinary HTTPS URL or external non-base64 URL, keep as is
  if (
    !imageBase64OrUrl.startsWith('data:image/') &&
    (imageBase64OrUrl.startsWith('http://') || imageBase64OrUrl.startsWith('https://'))
  ) {
    return imageBase64OrUrl;
  }

  try {
    const cleanFolder = folder.startsWith('redberry/') ? folder : `redberry/${folder}`;
    const result = await cloudinary.uploader.upload(imageBase64OrUrl, {
      folder: cleanFolder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${(error as Error).message}`);
  }
};

/**
 * Upload an array of images to Cloudinary in parallel
 */
export const uploadMultipleToCloudinary = async (
  images: string[],
  folder: string = 'general'
): Promise<string[]> => {
  if (!Array.isArray(images) || images.length === 0) return [];
  const promises = images.map((img) => uploadToCloudinary(img, folder));
  return await Promise.all(promises);
};

/**
 * Delete an image from Cloudinary by extracting its public ID
 */
export const deleteFromCloudinary = async (imageUrl?: string): Promise<boolean> => {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('cloudinary.com')) {
    return false;
  }

  try {
    const parts = imageUrl.split('/upload/');
    if (parts.length > 1) {
      let pathAfterUpload = parts[1];
      // Strip version number like v1741234567/
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
      // Strip file extension
      const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.')) || pathAfterUpload;

      const res = await cloudinary.uploader.destroy(publicId);
      console.log(`\x1b[32m🗑️ Deleted Cloudinary asset:\x1b[0m ${publicId} (result: ${res.result})`);
      return res.result === 'ok';
    }
  } catch (err) {
    console.warn(`Could not delete image from Cloudinary: ${imageUrl}`, err);
  }
  return false;
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteMultipleFromCloudinary = async (imageUrls?: string[]): Promise<void> => {
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    await Promise.all(imageUrls.map((url) => deleteFromCloudinary(url)));
  }
};
