/**
 * Image optimization utilities for modern formats (WebP, AVIF)
 */

// Check browser support for modern image formats
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = async () => {
  const avifImage = new Image();
  return new Promise((resolve) => {
    avifImage.onload = () => resolve(true);
    avifImage.onerror = () => resolve(false);
    avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIAAAABAAAABgIAAgAFEPIA';
  });
};

// Generate optimized image srcset
export const generateSrcSet = (baseUrl, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  return widths
    .map((width) => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizes = (breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}) => {
  return Object.entries(breakpoints)
    .map(([, width]) => `(max-width: ${width}px) ${width}px`)
    .concat('100vw')
    .join(', ');
};

// Cloudinary URL transformation helper
export const cloudinaryTransform = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const transformations = [
    format !== 'auto' ? `f_${format}` : 'f_auto',
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`,
    gravity && `g_${gravity}`,
  ].filter(Boolean);

  const transformString = transformations.join(',');
  
  // Insert transformations into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformString}/`);
};

// Lazy loading configuration
export const lazyLoadConfig = {
  rootMargin: '200px 0px',
  threshold: 0.01,
};

// Placeholder blur data URL generator (low quality image placeholder)
export const generatePlaceholder = (width = 10, height = 10, color = '#e5e7eb') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Image loading states
export const IMAGE_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

// Default fallback image
export const FALLBACK_IMAGE = '/images/placeholder-hotel.jpg';

// Preload critical images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = (srcs) => {
  return Promise.all(srcs.map(preloadImage));
};

// Calculate aspect ratio
export const calculateAspectRatio = (width, height) => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

// Common aspect ratios for hotel images
export const ASPECT_RATIOS = {
  HERO: '16/9',
  CARD: '4/3',
  THUMBNAIL: '1/1',
  GALLERY: '3/2',
};

export default {
  supportsWebP,
  supportsAVIF,
  generateSrcSet,
  generateSizes,
  lazyLoadConfig,
  generatePlaceholder,
  IMAGE_STATES,
  FALLBACK_IMAGE,
  preloadImage,
  preloadImages,
  calculateAspectRatio,
  ASPECT_RATIOS,
};
