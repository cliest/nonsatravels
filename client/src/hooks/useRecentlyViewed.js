import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nonsa_recently_viewed';
const MAX_ITEMS = 8;

export const useRecentlyViewed = () => {
  const [recentHotels, setRecentHotels] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRecentHotels(stored);
    } catch { setRecentHotels([]); }
  }, []);

  const addToRecentlyViewed = (hotel) => {
    if (!hotel?.id) return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = stored.filter(h => h.id !== hotel.id);
      const entry = {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        image: hotel.images?.[0] || '',
        pricePerNight: hotel.pricePerNight,
        rating: hotel.rating,
        viewedAt: Date.now(),
      };
      const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentHotels(updated);
    } catch {}
  };

  return { recentHotels, addToRecentlyViewed };
};
