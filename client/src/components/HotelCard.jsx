import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useFavorites } from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import LazyImage from "./LazyImage";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";
import { useCompare } from "../context/CompareContext";

const HotelCard = ({ room, index }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare, canAddMore } = useCompare();
  const isLiked = isFavorite(room.id);
  const inComparison = isInCompare(room.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(room.id);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inComparison) {
      removeFromCompare(room.id);
    } else {
      addToCompare(room);
    }
  };

  return (
    <Link
      to={`/hotels/${room.id}`}
      onClick={() => scrollTo(0, 0)}
      key={room.id}
      className="group relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-white text-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <LazyImage
          src={room.images?.[0] || room.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=75'}
          alt={room.name || room.hotel?.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          optimize={true}
          optimizeOptions={{ width: 400, height: 300, quality: 80 }}
        />

        {/* Best Seller Badge */}
        {index % 2 === 0 && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-white text-xs font-semibold text-gray-800 rounded-full shadow-md">
            Best Seller
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
            isLiked
              ? "bg-red-500 text-white scale-110"
              : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-50 hover:text-red-500"
          }`}
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <FontAwesomeIcon
            icon={isLiked ? faHeartSolid : faHeartOutline}
            className="text-lg"
          />
        </button>

        {/* Compare Checkbox */}
        <button
          onClick={handleCompareClick}
          disabled={!canAddMore && !inComparison}
          className={`absolute top-14 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
            inComparison
              ? "bg-blue-500 text-white scale-110"
              : canAddMore
              ? "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-blue-50 hover:text-blue-500"
              : "bg-gray-300/60 text-gray-400 cursor-not-allowed"
          }`}
          aria-label={inComparison ? "Remove from comparison" : "Add to comparison"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            {inComparison ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            )}
          </svg>
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-800 rounded-full">
          <img src={assets.starIconFilled} alt="rating" className="w-4 h-4" />
          {room.rating || 4.5}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5">
        {/* Hotel Name and Location */}
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-1.5 line-clamp-1">
            {room.name || room.hotel?.name}
          </h3>
          <div className="flex items-start gap-1.5 text-gray-600">
            <img
              src={assets.destination}
              alt="location"
              className="w-4 h-4 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm line-clamp-2">{room.address || room.hotel?.address}</span>
          </div>
        </div>

        {/* Features/Highlights */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-gray-100 text-xs font-medium rounded-full">
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-600">Starting from</p>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(room.pricePerNight)}
              <span className="text-sm font-normal text-gray-600">/night</span>
            </p>
          </div>
          <button className="px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

HotelCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    rating: PropTypes.number,
    amenities: PropTypes.arrayOf(PropTypes.string),
    hotel: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
    }),
    pricePerNight: PropTypes.number.isRequired,
  }).isRequired,
  index: PropTypes.number,
};

HotelCard.defaultProps = {
  index: 0,
};

export default HotelCard;
