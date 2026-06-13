/**
 * Cloudinary Image Optimization Utilities
 * 
 * These utilities help optimize images from any source (Unsplash, Pexels, etc.)
 * by proxying them through Cloudinary's auto-optimization features.
 */

/**
 * Get optimized image URL with Cloudinary transformations
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return '';
  
  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    fetchFormat = 'auto',
  } = options;

  // If it's already a Cloudinary URL, return as is
  if (imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  // Cloudinary fetch URL format
  const CLOUDINARY_CLOUD_NAME = 'dcj6tpgvv';
  
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  const transformString = transformations.join(',');
  
  // Use Cloudinary's fetch API to optimize external images
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformString}/${encodeURIComponent(imageUrl)}`;
};

/**
 * Get responsive image srcset for different screen sizes
 * @param {string} imageUrl - Original image URL
 * @param {array} widths - Array of widths for responsive images
 * @returns {string} - srcset string
 */
export const getResponsiveImageSrcSet = (imageUrl, widths = [320, 640, 768, 1024, 1280, 1536]) => {
  if (!imageUrl) return '';
  
  return widths
    .map(width => `${getOptimizedImageUrl(imageUrl, { width, quality: 'auto', format: 'auto' })} ${width}w`)
    .join(', ');
};

/**
 * Preset optimization profiles for common use cases
 */
export const imagePresets = {
  // Thumbnail images (small, fast loading)
  thumbnail: {
    width: 150,
    height: 150,
    quality: 'auto:low',
    format: 'auto',
    crop: 'thumb',
    gravity: 'face',
  },
  
  // Card images (medium size, good quality)
  card: {
    width: 400,
    height: 300,
    quality: 'auto:good',
    format: 'auto',
    crop: 'fill',
  },
  
  // Hero/Banner images (large, high quality)
  hero: {
    width: 1920,
    height: 1080,
    quality: 'auto:best',
    format: 'auto',
    crop: 'fill',
  },
  
  // Gallery images (balanced size and quality)
  gallery: {
    width: 800,
    height: 600,
    quality: 'auto',
    format: 'auto',
  },
  
  // Mobile optimized
  mobile: {
    width: 640,
    quality: 'auto:eco',
    format: 'auto',
  },
  
  // Avatar/Profile pictures
  avatar: {
    width: 200,
    height: 200,
    quality: 'auto',
    format: 'auto',
    crop: 'thumb',
    gravity: 'face',
  },
};

/**
 * Get image URL with preset optimization
 * @param {string} imageUrl - Original image URL
 * @param {string} presetName - Preset name from imagePresets
 * @returns {string} - Optimized image URL
 */
export const getImageWithPreset = (imageUrl, presetName = 'card') => {
  const preset = imagePresets[presetName];
  if (!preset) {
    return getOptimizedImageUrl(imageUrl, imagePresets.card);
  }
  return getOptimizedImageUrl(imageUrl, preset);
};

/**
 * Fallback optimization for non-Cloudinary setups
 * Adds URL parameters for services that support them (like Unsplash)
 */
export const getFallbackOptimizedUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return '';
  
  const { width = 800, quality = 80 } = options;
  
  try {
    const url = new URL(imageUrl);
    
    // Unsplash optimization
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('w', width);
      url.searchParams.set('q', quality);
      url.searchParams.set('auto', 'format');
      return url.toString();
    }
    
    // Pexels optimization
    if (url.hostname.includes('pexels.com')) {
      url.searchParams.set('w', width);
      url.searchParams.set('auto', 'compress');
      return url.toString();
    }
    
    // For other images, return as is
    return imageUrl;
  } catch (error) {
    // If URL parsing fails, return original
    return imageUrl;
  }
};

/**
 * Smart image optimizer - uses native URL params for Unsplash/Pexels
 * Returns images as-is if no optimization is available
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Optimization options
 * @returns {string} - Optimized image URL (or original if not optimizable)
 */
export const optimizeImage = (imageUrl, options = {}) => {
  if (!imageUrl) return '';
  
  // Use fallback optimization (Unsplash/Pexels native params or passthrough)
  return getFallbackOptimizedUrl(imageUrl, options);
};

/**
 * Test Cloudinary connection
 * @returns {Promise<object>} - Connection test result
 */
export const testCloudinaryConnection = async () => {
  const CLOUDINARY_CLOUD_NAME = 'dcj6tpgvv';
  const testImageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
  const testUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/w_100,q_auto,f_auto/${encodeURIComponent(testImageUrl)}`;
  
  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return {
        connected: true,
        status: response.status,
        cloudName: CLOUDINARY_CLOUD_NAME,
        message: 'Cloudinary connection successful',
      };
    } else {
      return {
        connected: false,
        status: response.status,
        cloudName: CLOUDINARY_CLOUD_NAME,
        message: `Cloudinary returned status ${response.status}`,
      };
    }
  } catch (error) {
    return {
      connected: false,
      status: null,
      cloudName: CLOUDINARY_CLOUD_NAME,
      message: `Connection failed: ${error.message}`,
      error: error.message,
    };
  }
};

export default {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
  getImageWithPreset,
  optimizeImage,
  testCloudinaryConnection,
  imagePresets,
};
