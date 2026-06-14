import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faList,
  faFilter,
  faLocationDot,
  faStar,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { hotelAPI } from "../services/api";
import { useCurrency } from "../context/CurrencyContext";
import { toast } from "../utils/toast";
import { SkeletonImage } from "../components/Skeleton";
import HotelCard from "../components/HotelCard";

// Fix for default marker icons in Leaflet with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom price marker icon
const createPriceIcon = (price, isSelected = false) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `
      <div style="
        background: ${isSelected ? "#ffa500" : "#2b3990"};
        color: white;
        padding: 6px 10px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        transform: translate(-50%, -50%);
      ">
        $${price}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
};

// Calculate distance using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Component to fit map bounds to markers
const FitBounds = ({ hotels }) => {
  const map = useMap();

  useEffect(() => {
    if (hotels.length > 0) {
      const bounds = L.latLngBounds(
        hotels.map((hotel) => {
          const [lng, lat] = hotel.location.coordinates;
          return [lat, lng];
        })
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [hotels, map]);

  return null;
};

// Component to handle map center changes
const MapCenterTracker = ({ onCenterChange }) => {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    };

    map.on("moveend", handleMoveEnd);
    return () => map.off("moveend", handleMoveEnd);
  }, [map, onCenterChange]);

  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("map");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: -13.1339, lng: 27.8493 }); // Zambia center
  const [radiusFilter, setRadiusFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch hotels
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getAll();
      const hotelsData = response.data.data;

      // Filter hotels with valid location data
      const hotelsWithLocation = hotelsData.filter(
        (hotel) => hotel.location && hotel.location.coordinates
      );

      setHotels(hotelsWithLocation);
      setFilteredHotels(hotelsWithLocation);
    } catch (error) {
      toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const handleCenterChange = (newCenter) => {
    setMapCenter(newCenter);
    if (radiusFilter) {
      filterHotelsByRadius(newCenter, radiusFilter);
    }
  };

  const filterHotelsByRadius = (center, radius) => {
    const filtered = hotels.filter((hotel) => {
      const [lng, lat] = hotel.location.coordinates;
      const distance = calculateDistance(center.lat, center.lng, lat, lng);
      return distance <= radius;
    });
    setFilteredHotels(filtered);
  };

  const handleRadiusChange = (radius) => {
    setRadiusFilter(radius);
    if (radius) {
      filterHotelsByRadius(mapCenter, radius);
    } else {
      setFilteredHotels(hotels);
    }
  };

  const handleResetFilters = () => {
    setRadiusFilter(null);
    setFilteredHotels(hotels);
  };

  // Memoize markers for performance
  const markers = useMemo(() => {
    return filteredHotels.map((hotel) => {
      if (!hotel.location?.coordinates) return null;
      const [lng, lat] = hotel.location.coordinates;
      return {
        hotel,
        position: [lat, lng],
        icon: createPriceIcon(hotel.pricePerNight, selectedHotel?.id === hotel.id),
      };
    }).filter(Boolean);
  }, [filteredHotels, selectedHotel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary py-16 md:py-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8 -mt-8 relative z-10">
          <SkeletonImage className="w-full h-16 rounded-xl mb-6" />
          <SkeletonImage className="w-full h-[600px] sm:h-[700px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-primary text-white py-16 md:py-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="px-6 md:px-12 lg:px-20 xl:px-32 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 animate-fade-in">
              Explore Hotels on Map
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Discover {filteredHotels.length} hand-picked {filteredHotels.length === 1 ? "hotel" : "hotels"} across Zambia
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8 -mt-8 relative z-10">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 fade-in">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-lg font-medium transition-all button-press ${
                  viewMode === "map"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon icon={faMap} className="mr-2" />
                Map
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-all button-press ${
                  viewMode === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon icon={faList} className="mr-2" />
                List
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-all button-press ${
                showFilters || radiusFilter
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filters
              {radiusFilter && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {radiusFilter} km
                </span>
              )}
            </button>

            {/* Results Count */}
            <div className="ml-auto text-gray-600 font-medium">
              {filteredHotels.length} {filteredHotels.length === 1 ? "hotel" : "hotels"}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 menu-slide-down">
              <h3 className="font-semibold text-gray-900 mb-3">
                <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-primary" />
                Filter by Distance from Map Center
              </h3>
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 100, 200].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleRadiusChange(radius)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all button-press ${
                      radiusFilter === radius
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
                {radiusFilter && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all button-press"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map or List View */}
        {viewMode === "map" ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden fade-in">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={6}
              className="w-full h-[600px] sm:h-[700px]"
              scrollWheelZoom={true}
            >
              {/* OpenStreetMap Tiles - 100% Free! */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Fit bounds to show all markers */}
              <FitBounds hotels={filteredHotels} />

              {/* Track map center for radius filtering */}
              <MapCenterTracker onCenterChange={handleCenterChange} />

              {/* Hotel Markers */}
              {markers.map(({ hotel, position, icon }) => (
                <Marker
                  key={hotel.id}
                  position={position}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedHotel(hotel),
                  }}
                >
                  <Popup maxWidth={300} className="hotel-popup">
                    <div className="p-1 animate-fadeIn">
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-36 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {hotel.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                        <FontAwesomeIcon icon={faLocationDot} className="text-accent text-xs" /> {hotel.city}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <span className="font-semibold">{hotel.rating || 4.5}</span>
                        </div>
                        <div className="text-primary font-bold text-lg">
                          {formatPrice(hotel.pricePerNight)}
                          <span className="text-gray-500 text-sm font-normal">/night</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                        className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-all button-press"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          filteredHotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center fade-in">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-5xl text-gray-300"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hotels found in this area
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or expanding the search radius
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-all button-press"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {filteredHotels.map((hotel, index) => (
                <HotelCard key={hotel.id} room={hotel} index={index} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Custom styles for Leaflet popups */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 8px;
          min-width: 250px;
        }
        .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .custom-price-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default MapView;
