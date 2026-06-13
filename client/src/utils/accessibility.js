// Accessibility utilities for the application

/**
 * Trap focus within a container element (useful for modals)
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Announce message to screen readers
 */
export const announce = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Generate unique ID for accessibility attributes
 */
export const generateId = (prefix = 'a11y') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers dark mode
 */
export const prefersDarkMode = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Skip link component styles (add to your CSS)
 */
export const skipLinkStyles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 100;
    transition: top 0.3s;
  }
  
  .skip-link:focus {
    top: 0;
  }
`;

/**
 * Keyboard navigation helper
 */
export const handleKeyboardNavigation = (e, items, currentIndex, onSelect) => {
  const handlers = {
    ArrowDown: () => Math.min(currentIndex + 1, items.length - 1),
    ArrowUp: () => Math.max(currentIndex - 1, 0),
    Home: () => 0,
    End: () => items.length - 1,
    Enter: () => {
      onSelect?.(items[currentIndex]);
      return currentIndex;
    },
    ' ': () => {
      onSelect?.(items[currentIndex]);
      return currentIndex;
    },
  };

  if (handlers[e.key]) {
    e.preventDefault();
    return handlers[e.key]();
  }
  return currentIndex;
};

/**
 * Format number for screen readers
 */
export const formatForScreenReader = (number, singular, plural) => {
  const count = Number(number);
  if (count === 0) return `No ${plural}`;
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural}`;
};

/**
 * Create ARIA label for price
 */
export const formatPriceForScreenReader = (price, currency = 'ZMW') => {
  return `${price} ${currency}`;
};

/**
 * Create ARIA label for rating
 */
export const formatRatingForScreenReader = (rating, maxRating = 5) => {
  return `${rating} out of ${maxRating} stars`;
};

export default {
  trapFocus,
  announce,
  generateId,
  prefersReducedMotion,
  prefersDarkMode,
  handleKeyboardNavigation,
  formatForScreenReader,
  formatPriceForScreenReader,
  formatRatingForScreenReader,
};
