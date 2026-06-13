import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { hotelAPI } from "../services/api";
import HotelCard from "../components/HotelCard";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, clearFavorites, favoritesCount } = useFavorites();
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteHotels = async () => {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch all hotels and filter favorites
        const response = await hotelAPI.getAll();
        const hotels = response.data.data || [];
        const favHotels = hotels.filter((hotel) => favorites.includes(hotel.id));
        setFavoriteHotels(favHotels);
      } catch (error) {
        console.error('Failed to fetch favorite hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteHotels();
  }, [favorites]);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      clearFavorites();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faHeart} className="text-2xl text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  My Favorites
                </h1>
                <p className="text-gray-600">
                  {favoritesCount} {favoritesCount === 1 ? "hotel" : "hotels"} saved
                </p>
              </div>
            </div>

            {favoritesCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                <FontAwesomeIcon icon={faTrash} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loading />
        ) : favoriteHotels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-5xl text-gray-300"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring our hotels and save your favorites by clicking the
              heart icon on any hotel card.
            </p>
            <button
              onClick={() => navigate("/hotels")}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Browse Hotels
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-2">Total Favorites</p>
                <p className="text-3xl font-bold text-primary">{favoritesCount}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-2">Average Price</p>
                <p className="text-3xl font-bold text-primary">
                  $
                  {Math.round(
                    favoriteHotels.reduce((sum, h) => sum + h.pricePerNight, 0) /
                      favoriteHotels.length
                  )}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-2">Highest Rated</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.max(...favoriteHotels.map((h) => h.rating || 4.5))} 
                </p>
              </div>
            </div>

            {/* Hotels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteHotels.map((hotel, index) => (
                <HotelCard key={hotel.id} room={hotel} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
