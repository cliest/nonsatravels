import { useState, useEffect, useMemo } from "react";

/**
 * Custom hook for managing hotel filters and sorting
 * @param {Array} hotels - Array of hotel data
 * @param {Object} options - Filter and sort options
 * @returns {Object} Filtered hotels and filter controls
 */
export const useHotelFilters = (hotels, options = {}) => {
  const {
    initialPriceRange = 1000,
    initialRoomTypes = [],
    initialSortOption = "Price: Low to High",
  } = options;

  const [selectedRoomTypes, setSelectedRoomTypes] = useState(initialRoomTypes);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let results = [...hotels];

    // Apply room type filter
    if (selectedRoomTypes.length > 0) {
      results = results.filter((hotel) =>
        selectedRoomTypes.some((type) => hotel.roomType === type)
      );
    }

    // Apply price filter
    results = results.filter((hotel) => hotel.pricePerNight <= priceRange);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (hotel) =>
          hotel.hotel.name.toLowerCase().includes(query) ||
          hotel.hotel.city.toLowerCase().includes(query) ||
          hotel.hotel.address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "Price: Low to High":
        results.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "Price: High to Low":
        results.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "Rating: High to Low":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "Rating: Low to High":
        results.sort((a, b) => a.rating - b.rating);
        break;
      case "Name: A-Z":
        results.sort((a, b) => a.hotel.name.localeCompare(b.hotel.name));
        break;
      case "Name: Z-A":
        results.sort((a, b) => b.hotel.name.localeCompare(a.hotel.name));
        break;
      default:
        break;
    }

    return results;
  }, [hotels, selectedRoomTypes, priceRange, searchQuery, sortOption]);

  const handleRoomTypeChange = (checked, roomType) => {
    if (checked) {
      setSelectedRoomTypes((prev) => [...prev, roomType]);
    } else {
      setSelectedRoomTypes((prev) => prev.filter((type) => type !== roomType));
    }
  };

  const resetFilters = () => {
    setSelectedRoomTypes(initialRoomTypes);
    setPriceRange(initialPriceRange);
    setSortOption(initialSortOption);
    setSearchQuery("");
  };

  return {
    filteredHotels,
    selectedRoomTypes,
    priceRange,
    sortOption,
    searchQuery,
    setSelectedRoomTypes,
    setPriceRange,
    setSortOption,
    setSearchQuery,
    handleRoomTypeChange,
    resetFilters,
    hasActiveFilters:
      selectedRoomTypes.length > 0 ||
      priceRange !== initialPriceRange ||
      searchQuery !== "",
  };
};

/**
 * Custom hook for debouncing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for managing local storage
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [storedValue, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Silently fail localStorage writes
    }
  };

  return [storedValue, setValue];
};
