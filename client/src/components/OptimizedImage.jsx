import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  generatePlaceholder, 
  IMAGE_STATES, 
  FALLBACK_IMAGE,
  ASPECT_RATIOS 
} from '../utils/imageOptimization';

/**
 * Optimized Image component with lazy loading, 
 * modern format support, and accessibility
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio = ASPECT_RATIOS.CARD,
  quality = 'auto',
  loading = 'lazy',
  fallback = FALLBACK_IMAGE,
  onLoad,
  onError,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}) => {
  const [imageState, setImageState] = useState(IMAGE_STATES.LOADING);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef(null);

  // Use source directly without Cloudinary transformation
  const optimizedSrc = src;

  // Generate placeholder
  const placeholder = generatePlaceholder(10, 10, '#e5e7eb');

  useEffect(() => {
    setCurrentSrc(optimizedSrc || fallback);
    setImageState(IMAGE_STATES.LOADING);
  }, [optimizedSrc, fallback]);

  const handleLoad = (e) => {
    setImageState(IMAGE_STATES.LOADED);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setImageState(IMAGE_STATES.ERROR);
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
    onError?.(e);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Placeholder/Loading state */}
      {imageState === IMAGE_STATES.LOADING && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc || placeholder}
        alt={alt}
        loading={loading}
        decoding="async"
        width={width}
        height={height}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${imageState === IMAGE_STATES.LOADED ? 'opacity-100' : 'opacity-0'}
        `}
        {...props}
      />

      {/* Error state */}
      {imageState === IMAGE_STATES.ERROR && currentSrc === fallback && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          role="img"
          aria-label={`Failed to load: ${alt}`}
        >
          <span className="text-gray-400 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  aspectRatio: PropTypes.string,
  quality: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.oneOf(['lazy', 'eager']),
  fallback: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  sizes: PropTypes.string,
};

export default OptimizedImage;
