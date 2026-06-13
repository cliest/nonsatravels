import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCircle,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { optimizeImage } from "../utils/cloudinary";

const PhotoCarousel = ({ 
  images, 
  autoplay = false, 
  autoplayInterval = 5000,
  showThumbnails = false,
  showDots = true,
  className = "",
  aspectRatio = "16/9"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, autoplayInterval, goToNext, images.length]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!images || images.length === 0) {
    return <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <span className="text-gray-400">No images available</span>
    </div>;
  }

  return (
    <div className={`relative w-full group ${className}`}>
      {/* Main Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-lg"
        style={{ aspectRatio }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Images */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <img
                src={optimizeImage(image, { width: 1200, height: 800, quality: 85 })}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous slide"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next slide"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}

        {/* Play/Pause Button (if autoplay enabled) */}
        {autoplay && images.length > 1 && (
          <button
            onClick={togglePlayPause}
            className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-sm" />
          </button>
        )}

        {/* Dots Navigation */}
        {showDots && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? "text-white scale-125"
                    : "text-white/50 hover:text-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <FontAwesomeIcon icon={faCircle} className="text-xs" />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full z-10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-primary scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={optimizeImage(image, { width: 150, height: 100, quality: 75 })}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

PhotoCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  autoplay: PropTypes.bool,
  autoplayInterval: PropTypes.number,
  showThumbnails: PropTypes.bool,
  showDots: PropTypes.bool,
  className: PropTypes.string,
  aspectRatio: PropTypes.string,
};

export default PhotoCarousel;
