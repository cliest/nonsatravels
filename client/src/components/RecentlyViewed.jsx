import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import StarRating from './StarRating';

const RecentlyViewed = () => {
  const { recentHotels } = useRecentlyViewed();
  const navigate = useNavigate();

  if (recentHotels.length === 0) return null;

  return (
    <section className="py-10 sm:py-14">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {recentHotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => navigate(`/hotels/${hotel.id}`)}
            className="flex-shrink-0 w-52 sm:w-60 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="relative h-32 sm:h-36 overflow-hidden">
              <img
                src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75'}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                <StarRating rating={hotel.rating || 4.5} />
                <span className="text-xs font-medium">{hotel.rating || 4.5}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{hotel.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{hotel.city}</p>
              <p className="text-sm font-bold text-primary mt-1">${hotel.pricePerNight}<span className="text-xs font-normal text-gray-500">/night</span></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
