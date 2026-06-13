import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets, facilityIcons } from "../assets/assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { ROOM_TYPES, SORT_OPTIONS, PRICE_RANGE } from "../utils/constants";
import { hotelAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";
import { useFavorites } from "../hooks/useFavorites";
import { useCompare } from "../context/CompareContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as faHeartSolid,
  faLocationDot,
  faCalendarDays,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";

// Enhanced Checkbox Component
const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm group">
      <div className="relative">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onChange(e.target.checked, label)}
          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent/20 cursor-pointer"
        />
      </div>
      <span className="font-light select-none text-gray-700 group-hover:text-primary transition-colors">
        {label}
      </span>
    </label>
  );
};

// Enhanced Radio Button Component
const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm group">
      <input
        type="radio"
        checked={selected}
        onChange={() => onChange(label)}
        name="sortOption"
        className="w-4 h-4 text-accent focus:ring-accent/20 cursor-pointer"
      />
      <span className="font-light select-none text-gray-700 group-hover:text-primary transition-colors">
        {label}
      </span>
    </label>
  );
};

// Price Range Slider Component
const PriceRangeSlider = ({ min, max, value, onChange, t, formatPrice }) => {
  return (
    <div className="px-5 pt-5">
      <p className="font-medium text-gray-800 pb-4">{t('hotels.priceRange')}</p>
      <div className="space-y-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{formatPrice(min)}</span>
          <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
            {t('hotels.upTo')} {formatPrice(value)}
          </div>
          <span className="text-sm text-gray-600">{formatPrice(max)}</span>
        </div>
      </div>
    </div>
  );
};

const AllHotels = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, addToCompare, removeFromCompare, canAddMore } = useCompare();
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedStarRatings, setSelectedStarRatings] = useState([]);
  const [priceRange, setPriceRange] = useState(PRICE_RANGE.DEFAULT);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Get search params from URL
  const urlCity = searchParams.get("city") || "";
  const urlCheckIn = searchParams.get("checkIn") || "";
  const urlCheckOut = searchParams.get("checkOut") || "";
  const urlGuests = searchParams.get("guests") || "";
  
  // Amenities list
  const amenitiesList = ["WiFi", "Pool", "Parking", "Gym", "Spa", "Restaurant", "Room Service"];
  const starRatings = [5, 4, 3, 2, 1];

  // Fetch hotels from API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await hotelAPI.getAll();
        const hotels = response.data.data.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          address: hotel.address,
          location: hotel.city,
          images: hotel.images || [],
          hotel: {
            name: hotel.name,
            city: hotel.city,
            address: hotel.address,
          },
          roomType: hotel.roomType,
          pricePerNight: hotel.pricePerNight,
          rating: hotel.rating,
          image: hotel.images?.[0] || assets.image1,
          amenities: hotel.amenities || [],
          isAvailable: hotel.isAvailable,
          description: hotel.description,
          totalRooms: hotel.totalRooms,
        }));
        setAllHotels(hotels);
        setFilteredHotels(hotels);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Set initial search query from URL
  useEffect(() => {
    if (urlCity) {
      setSearchQuery(urlCity);
    }
  }, [urlCity]);

  // Handle room type selection
  const handleRoomTypeChange = (checked, roomType) => {
    if (checked) {
      setSelectedRoomTypes((prev) => [...prev, roomType]);
    } else {
      setSelectedRoomTypes((prev) => prev.filter((type) => type !== roomType));
    }
  };

  // Handle amenity selection
  const handleAmenityChange = (checked, amenity) => {
    if (checked) {
      setSelectedAmenities((prev) => [...prev, amenity]);
    } else {
      setSelectedAmenities((prev) => prev.filter((a) => a !== amenity));
    }
  };

  // Handle star rating selection
  const handleStarRatingChange = (checked, rating) => {
    if (checked) {
      setSelectedStarRatings((prev) => [...prev, rating]);
    } else {
      setSelectedStarRatings((prev) => prev.filter((r) => r !== rating));
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let results = [...allHotels];

    // Apply room type filter
    if (selectedRoomTypes.length > 0) {
      results = results.filter((hotel) =>
        selectedRoomTypes.some((type) => hotel.roomType === type)
      );
    }

    // Apply star rating filter
    if (selectedStarRatings.length > 0) {
      results = results.filter((hotel) =>
        selectedStarRatings.some((rating) => Math.floor(hotel.rating || 4.5) === rating)
      );
    }

    // Apply amenities filter (hotel must have ALL selected amenities)
    if (selectedAmenities.length > 0) {
      results = results.filter((hotel) => {
        return selectedAmenities.every(amenity => 
          hotel.amenities?.some(a => a.toLowerCase() === amenity.toLowerCase())
        );
      });
    }

    // Apply price filter
    results = results.filter((hotel) => hotel.pricePerNight <= priceRange);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (hotel) =>
          (hotel.name || hotel.hotel?.name || '').toLowerCase().includes(query) ||
          (hotel.city || hotel.hotel?.city || '').toLowerCase().includes(query) ||
          (hotel.address || hotel.hotel?.address || '').toLowerCase().includes(query)
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

    setFilteredHotels(results);
  }, [allHotels, selectedRoomTypes, selectedStarRatings, selectedAmenities, priceRange, sortOption, searchQuery]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedRoomTypes([]);
    setSelectedStarRatings([]);
    setSelectedAmenities([]);
    setPriceRange(PRICE_RANGE.DEFAULT);
    setSortOption(SORT_OPTIONS[0]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-start justify-between pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto">
        {/* Left Section - Hotels List */}
        <div className="w-full lg:flex-1 lg:pr-8">
          {/* Header with Search */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex-1 fade-in">
              <Title
                title={t('hotels.title')}
                subTitle={t('hotels.subtitle')}
                align="left"
              />
            </div>

            {/* Search Bar */}
            <div className="w-full lg:w-64 slide-in-right">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('hotels.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                />
                <img
                  src={assets.searchIcon}
                  alt="Search"
                  className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Search Info Banner */}
          {(urlCity || urlCheckIn || urlCheckOut || urlGuests) && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-accent/10 border border-accent/20 rounded-lg slide-in-left">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <img src={assets.searchIcon} alt="Search" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t('hotels.searchResults')}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                    {urlCity && (
                      <span className="px-2 sm:px-3 py-1 bg-white rounded-full border border-gray-300 flex items-center gap-1">
                        <FontAwesomeIcon icon={faLocationDot} className="text-accent text-xs" /> {urlCity}
                      </span>
                    )}
                    {urlCheckIn && (
                      <span className="px-2 sm:px-3 py-1 bg-white rounded-full border border-gray-300 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-accent text-xs" /> {new Date(urlCheckIn).toLocaleDateString()}
                      </span>
                    )}
                    {urlCheckOut && (
                      <span className="px-2 sm:px-3 py-1 bg-white rounded-full border border-gray-300 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-accent text-xs" /> {new Date(urlCheckOut).toLocaleDateString()}
                      </span>
                    )}
                    {urlGuests && (
                      <span className="px-2 sm:px-3 py-1 bg-white rounded-full border border-gray-300 flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} className="text-accent text-xs" /> {urlGuests} {urlGuests === "1" ? t('hotels.guest') : t('hotels.guests')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate("/hotels");
                    setSearchQuery("");
                  }}
                  className="text-gray-500 hover:text-primary transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center"
                  title={t('hotels.clearSearch')}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              {t('hotels.showing')}{" "}
              <span className="font-semibold text-primary">
                {filteredHotels.length}
              </span>{" "}
              {t('hotels.of')}{" "}
              <span className="font-semibold text-primary">
                {allHotels.length}
              </span>{" "}
              {t('hotels.hotelsText')}
            </p>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setOpenFilters(!openFilters)}
              className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all btn-scale text-sm sm:text-base"
            >
              <img src={assets.filterIcon} alt="Filter" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('hotels.filters')}</span>
              {(selectedRoomTypes.length > 0 || selectedAmenities.length > 0 || selectedStarRatings.length > 0) && (
                <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedRoomTypes.length + selectedAmenities.length + selectedStarRatings.length}
                </span>
              )}
            </button>
          </div>

          {/* Hotels Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="shimmer rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent mx-auto mb-4"></div>
              <p className="mt-4 text-gray-600 text-sm sm:text-base">{t('hotels.loadingHotels')}</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="text-center py-12 sm:py-16 fade-in">
              <img
                src={assets.noResultIcon}
                alt="No results"
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 opacity-50"
              />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {t('hotels.noHotelsFound')}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                {t('hotels.adjustFilters')}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all btn-scale text-sm sm:text-base"
              >
                {t('hotels.clearAllFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
              {filteredHotels.map((room, index) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 card-hover fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    navigate(`/hotels/${room.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  {/* Hotel Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={room.image}
                      alt="hotel"
                      className="w-full h-44 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(room.id);
                      }}
                      className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                        isFavorite(room.id)
                          ? "bg-red-500 text-white scale-110"
                          : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-50 hover:text-red-500"
                      }`}
                      aria-label={isFavorite(room.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <FontAwesomeIcon
                        icon={isFavorite(room.id) ? faHeartSolid : faHeartOutline}
                        className="text-lg"
                      />
                    </button>

                    {/* Compare Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInCompare(room.id)) {
                          removeFromCompare(room.id);
                        } else {
                          addToCompare(room);
                        }
                      }}
                      disabled={!canAddMore && !isInCompare(room.id)}
                      className={`absolute top-14 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                        isInCompare(room.id)
                          ? "bg-blue-500 text-white scale-110"
                          : canAddMore
                          ? "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-blue-50 hover:text-blue-500"
                          : "bg-gray-300/60 text-gray-400 cursor-not-allowed"
                      }`}
                      aria-label={isInCompare(room.id) ? "Remove from comparison" : "Add to comparison"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        {isInCompare(room.id) ? (
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

                    <div className="absolute top-3 lefject-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 sm:px-3 py-1 flex items-center gap-1">
                      <StarRating rating={room.rating} />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {room.rating}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-accent text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                      {formatPrice(room.pricePerNight)}{t('hotels.perNight')}
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-accent text-xs sm:text-sm font-medium mb-1">
                          {room.city || room.hotel?.city}
                        </p>
                        <h3 className="text-base sm:text-lg font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">
                          {room.name || room.hotel?.name}
                        </h3>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-500 mb-3 text-xs sm:text-sm">
                      <img
                        src={assets.locationIcon}
                        alt="location"
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      />
                      <span className="line-clamp-1">{room.address || room.hotel?.address}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4">
                      {room.amenities.slice(0, 3).map((item, index) => {
                        const Icon = facilityIcons[item];
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-accent/40 transition-colors"
                          >
                            {Icon ? (
                              <img
                                src={Icon}
                                alt={item}
                                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                              />
                            ) : (
                              <div className="w-3.5 h-3.5 flex items-center justify-center">
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                              </div>
                            )}
                            <p className="text-xs text-gray-700 font-medium whitespace-nowrap">{item}</p>
                          </div>
                        );
                      })}
                      {room.amenities.length > 3 && (
                        <span className="text-xs text-gray-500 font-medium px-2">
                          +{room.amenities.length - 3} {t('hotels.more')}
                        </span>
                      )}
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">
                          {t('hotels.available')}
                        </span>
                      </div>
                      <button className="text-accent hover:text-accent/80 font-medium text-xs sm:text-sm transition-all group-hover:translate-x-1">
                        {t('hotels.viewDetails')} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Filters - FIXED POSITIONING */}
        <div
          className={`
          w-full lg:w-80 bg-white rounded-2xl shadow-lg lg:sticky lg:top-28 
          transition-all duration-300 card-hover
          ${
            openFilters
              ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md max-h-[90vh] z-50 slide-in-right"
              : "hidden lg:block"
          }
        `}
        >
          {/* Filters Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div>
              <p className="text-base sm:text-lg font-semibold text-primary">{t('hotels.filters')}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('hotels.refineSearch')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="text-xs sm:text-sm text-accent hover:text-accent/80 font-medium transition-colors"
              >
                {t('hotels.clearAll')}
              </button>
              <button
                onClick={() => setOpenFilters(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600 text-lg w-8 h-8 flex items-center justify-center"
              >
                
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Price Range Slider */}
            <PriceRangeSlider
              min={PRICE_RANGE.MIN}
              max={PRICE_RANGE.MAX}
              value={priceRange}
              onChange={setPriceRange}
              t={t}
              formatPrice={formatPrice}
            />

            {/* Room Types */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 border-t border-gray-100">
              <p className="font-medium text-sm sm:text-base text-gray-800 pb-3">{t('hotels.roomTypes')}</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {ROOM_TYPES.map((room, index) => (
                  <CheckBox
                    key={index}
                    label={room}
                    selected={selectedRoomTypes.includes(room)}
                    onChange={handleRoomTypeChange}
                  />
                ))}
              </div>
            </div>

            {/* Star Ratings */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 border-t border-gray-100">
              <p className="font-medium text-sm sm:text-base text-gray-800 pb-3">{t('hotels.starRating')}</p>
              <div className="space-y-1">
                {starRatings.map((rating) => (
                  <CheckBox
                    key={rating}
                    label={`${rating} ${rating > 1 ? t('hotels.stars') : t('hotels.star')}`}
                    selected={selectedStarRatings.includes(rating)}
                    onChange={(checked) => handleStarRatingChange(checked, rating)}
                  />
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 border-t border-gray-100">
              <p className="font-medium text-sm sm:text-base text-gray-800 pb-3">{t('hotels.amenities')}</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {amenitiesList.map((amenity) => (
                  <CheckBox
                    key={amenity}
                    label={amenity}
                    selected={selectedAmenities.includes(amenity)}
                    onChange={(checked) => handleAmenityChange(checked, amenity)}
                  />
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-6 border-t border-gray-100">
              <p className="font-medium text-sm sm:text-base text-gray-800 pb-3">{t('hotels.sortBy')}</p>
              <div className="space-y-1">
                {SORT_OPTIONS.map((option, index) => (
                  <RadioButton
                    key={index}
                    label={option}
                    selected={sortOption === option}
                    onChange={setSortOption}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay - Only show when filters are open on mobile */}
      {openFilters && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden fade-in"
          onClick={() => setOpenFilters(false)}
        />
      )}
    </div>
  );
};

export default AllHotels;
