import { useState, useEffect } from 'react';

/**
 * Custom hook for managing favorite hotels
 * Uses localStorage to persist favorites
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteHotels');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favoriteHotels', JSON.stringify(favorites));
  }, [favorites]);

  // Add a hotel to favorites
  const addFavorite = (hotelId) => {
    if (!favorites.includes(hotelId)) {
      setFavorites(prev => [...prev, hotelId]);
      return true;
    }
    return false;
  };

  // Remove a hotel from favorites
  const removeFavorite = (hotelId) => {
    setFavorites(prev => prev.filter(id => id !== hotelId));
  };

  // Toggle favorite status
  const toggleFavorite = (hotelId) => {
    if (favorites.includes(hotelId)) {
      removeFavorite(hotelId);
      return false;
    } else {
      addFavorite(hotelId);
      return true;
    }
  };

  // Check if a hotel is favorited
  const isFavorite = (hotelId) => {
    return favorites.includes(hotelId);
  };

  // Clear all favorites
  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
};
