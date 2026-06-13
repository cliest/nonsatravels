import { useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { useCurrency } from "../context/CurrencyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faMapMarkerAlt,
  faStar,
  faWifi,
  faParking,
  faSwimmingPool,
  faDumbbell,
  faUtensils,
  faConciergeBell,
  faBed,
  faCheckCircle,
  faTimesCircle,
  faScaleBalanced,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const Compare = () => {
  const navigate = useNavigate();
  const { compareHotels, removeFromCompare, clearCompare } = useCompare();
  const { formatPrice } = useCurrency();

  if (compareHotels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4 text-gray-300"><FontAwesomeIcon icon={faScaleBalanced} /></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No Hotels to Compare
          </h2>
          <p className="text-gray-600 mb-8">
            Add hotels to your comparison list to see them side-by-side
          </p>
          <button
            onClick={() => navigate("/hotels")}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Browse Hotels
          </button>
        </div>
      </div>
    );
  }

  if (compareHotels.length === 1) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4 text-gray-300"><FontAwesomeIcon icon={faPlus} /></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Add More Hotels
          </h2>
          <p className="text-gray-600 mb-8">
            You need at least 2 hotels to compare. Add more hotels from the browse page.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/hotels")}
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Add More Hotels
            </button>
            <button
              onClick={clearCompare}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Clear Comparison
            </button>
          </div>
        </div>
      </div>
    );
  }

  const amenityIcons = {
    wifi: faWifi,
    parking: faParking,
    pool: faSwimmingPool,
    gym: faDumbbell,
    restaurant: faUtensils,
    "room service": faConciergeBell,
    spa: faBed,
  };

  const checkAmenity = (hotel, amenityName) => {
    const amenities = hotel.amenities || [];
    return amenities.some(
      (a) => a.toLowerCase().includes(amenityName.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold gradient-text">
              Compare Hotels
            </h1>
            <button
              onClick={clearCompare}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
          <p className="text-gray-600">
            Comparing {compareHotels.length} {compareHotels.length === 1 ? "hotel" : "hotels"} side-by-side
          </p>
        </div>

        {/* Comparison Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(compareHotels.length, 3)} gap-6`}>
          {compareHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Hotel Image */}
              <div className="relative h-56">
                <img
                  src={hotel.images?.[0] || hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCompare(hotel.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                  aria-label="Remove"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                  <span className="font-semibold">{hotel.rating || 4.5}</span>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span className="text-sm">{hotel.location || hotel.address}</span>
                </div>

                {/* Price */}
                <div className="bg-primary/10 rounded-xl p-4 mb-6">
                  <div className="text-sm text-gray-600 mb-1">Price per night</div>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(hotel.pricePerNight)}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Amenities</h4>
                  <div className="space-y-2">
                    {Object.entries(amenityIcons).map(([amenity, icon]) => {
                      const hasAmenity = checkAmenity(hotel, amenity);
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3"
                        >
                          <FontAwesomeIcon
                            icon={hasAmenity ? faCheckCircle : faTimesCircle}
                            className={
                              hasAmenity ? "text-green-500" : "text-gray-300"
                            }
                          />
                          <FontAwesomeIcon
                            icon={icon}
                            className={hasAmenity ? "text-gray-700" : "text-gray-400"}
                          />
                          <span
                            className={`text-sm capitalize ${
                              hasAmenity ? "text-gray-700" : "text-gray-400"
                            }`}
                          >
                            {amenity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">Reviews</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={
                            i < Math.floor(hotel.rating || 4.5)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({hotel.totalReviews || Math.floor(Math.random() * 200) + 50} reviews)
                    </span>
                  </div>
                </div>

                {/* Description */}
                {hotel.description && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-2">About</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {hotel.description}
                    </p>
                  </div>
                )}

                {/* Rooms */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">Capacity</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faBed} />
                    <span className="text-sm">
                      {hotel.totalRooms || 10} rooms available
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/hotels")}
            className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
          >
            Browse More Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compare;
