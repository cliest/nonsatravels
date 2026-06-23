// Application-wide constants

// Room Types
export const ROOM_TYPES = [
  "Single Bed",
  "Double Bed",
  "Executive Room",
  "Family Suite",
  "Deluxe Suite",
  "Presidential Suite",
];

// Sort Options
export const SORT_OPTIONS = [
  "Price: Low to High",
  "Price: High to Low",
  "Rating: High to Low",
  "Rating: Low to High",
  "Name: A-Z",
  "Name: Z-A",
];

// Price Range
export const PRICE_RANGE = {
  MIN: 0,
  MAX: 1000,
  DEFAULT: 1000,
};

// Navigation Links
export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Hotels", path: "/hotels" },
  { name: "Blog", path: "/blog" },
  { name: "My Trips", path: "/my-trips" },
  { name: "About", path: "/about" },
];

// Footer Links
export const FOOTER_RESOURCES = [
  { name: "Travel Tips", path: "/travel-tips" },
  { name: "Testimonies", path: "/testimonies" },
  { name: "Blog", path: "/blog" },
  { name: "Community", path: "/community" },
];

export const FOOTER_COMPANY = [
  { name: "About", path: "/about" },
  { name: "Careers", path: "/careers" },
  { name: "Privacy", path: "/privacy" },
  { name: "Terms", path: "/terms" },
  { name: "Partners", path: "/partners" },
];

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
};

// Form Validation
export const VALIDATION = {
  MIN_GUESTS: 1,
  MAX_GUESTS: 10,
  MIN_STAY_DAYS: 1,
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  HOTELS: "/api/hotels",
  BOOKINGS: "/api/bookings",
  USERS: "/api/users",
  OFFERS: "/api/offers",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: "nonsa_user_preferences",
  SEARCH_HISTORY: "nonsa_search_history",
  FAVORITES: "nonsa_favorites",
};
