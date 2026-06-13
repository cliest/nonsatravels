import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { optimizeImage } from '../utils/cloudinary';

/**
 * Optimized lazy-loading image component with automatic image optimization
 * - Loads images only when they enter the viewport
 * - Automatically optimizes images for better performance
 * - Supports responsive images with srcset
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  optimize = true,
  optimizeOptions = {},
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // IntersectionObserver for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && src) {
            // Optimize image URL if optimization is enabled
            const optimizedSrc = optimize ? optimizeImage(src, optimizeOptions) : src;
            setImageSrc(optimizedSrc);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src, optimize, optimizeOptions]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  optimize: PropTypes.bool,
  optimizeOptions: PropTypes.object,
};

export default LazyImage;
