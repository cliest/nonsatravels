import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hotelAPI } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faHotel, faArrowRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet-async";

const PROVINCES = [
  {
    name: "Lusaka Province",
    image: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&q=80",
    description: "Zambia's capital and economic hub, home to vibrant markets and modern amenities.",
    cities: ["Lusaka", "Kafue", "Chongwe", "Chilanga", "Chirundu"],
  },
  {
    name: "Southern Province",
    image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80",
    description: "Home to the majestic Victoria Falls, one of the Seven Natural Wonders of the World.",
    cities: ["Livingstone", "Choma", "Mazabuka", "Monze", "Kalomo", "Siavonga"],
  },
  {
    name: "Copperbelt Province",
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&q=80",
    description: "The mining heartland of Zambia, offering a mix of industry and natural beauty.",
    cities: ["Ndola", "Kitwe", "Chingola", "Mufulira", "Luanshya", "Kalulushi"],
  },
  {
    name: "Central Province",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    description: "Gateway to the country's national parks and wildlife reserves.",
    cities: ["Kabwe", "Kapiri Mposhi", "Mkushi", "Serenje", "Mumbwa"],
  },
  {
    name: "Eastern Province",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
    description: "Rich cultural heritage and home to the famous South Luangwa National Park.",
    cities: ["Chipata", "Katete", "Lundazi", "Petauke"],
  },
  {
    name: "Northern Province",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Stunning waterfalls, ancient rock art, and pristine wilderness.",
    cities: ["Kasama", "Mbala", "Mpika", "Chinsali", "Nakonde"],
  },
  {
    name: "Luapula Province",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    description: "Beautiful lakeside province bordering Lake Mweru and the Congo.",
    cities: ["Mansa", "Nchelenge", "Samfya", "Kawambwa"],
  },
  {
    name: "Western Province",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
    description: "Home to the Barotse Floodplain and the famous Kuomboka ceremony.",
    cities: ["Mongu", "Senanga", "Kaoma", "Lukulu", "Kalabo"],
  },
  {
    name: "North-Western Province",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    description: "Mineral-rich province with vast forests and the source of the Zambezi River.",
    cities: ["Solwezi", "Mwinilunga", "Zambezi", "Kasempa"],
  },
  {
    name: "Muchinga Province",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    description: "Zambia's newest province, offering untouched wilderness and adventure.",
    cities: ["Chinsali", "Isoka", "Mpika", "Chama"],
  },
];

const Destinations = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelAPI.getAll().then(res => {
      setHotels(res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getHotelCount = (cities) => {
    return hotels.filter(h => cities.includes(h.city)).length;
  };

  const getMinPrice = (cities) => {
    const cityHotels = hotels.filter(h => cities.includes(h.city));
    if (cityHotels.length === 0) return null;
    return Math.min(...cityHotels.map(h => h.pricePerNight));
  };

  const filteredProvinces = searchQuery
    ? PROVINCES.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : PROVINCES;

  const handleCityClick = (city) => {
    navigate(`/hotels?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16">
      <Helmet>
        <title>Destinations in Zambia | Nonsa Travels</title>
        <meta name="description" content="Explore hotels across all 10 provinces of Zambia. From Victoria Falls in Livingstone to the vibrant capital Lusaka." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore <span className="text-primary">Zambia</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mb-6">
            Discover hotels across all 10 provinces — from the thundering Victoria Falls to the serene shores of Lake Bangweulu.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search provinces or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">10</p>
            <p className="text-xs sm:text-sm text-gray-500">Provinces</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{new Set(hotels.map(h => h.city)).size}</p>
            <p className="text-xs sm:text-sm text-gray-500">Cities</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{hotels.length}</p>
            <p className="text-xs sm:text-sm text-gray-500">Hotels</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredProvinces.map((province) => {
              const hotelCount = getHotelCount(province.cities);
              const minPrice = getMinPrice(province.cities);

              return (
                <div key={province.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-72 lg:w-80 flex-shrink-0">
                      <img
                        src={province.image}
                        alt={province.name}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{province.name}</h2>
                          <p className="text-sm text-gray-600 mt-1">{province.description}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-center bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                            <p className="text-lg font-bold text-primary">{hotelCount}</p>
                            <p className="text-[10px] text-gray-500">Hotels</p>
                          </div>
                          {minPrice && (
                            <div className="text-center bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                              <p className="text-lg font-bold text-green-700">${minPrice}</p>
                              <p className="text-[10px] text-gray-500">From/night</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cities */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {province.cities.map((city) => {
                          const cityHotelCount = hotels.filter(h => h.city === city).length;
                          return (
                            <button
                              key={city}
                              onClick={() => handleCityClick(city)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-xs sm:text-sm font-medium transition-colors"
                            >
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                              {city}
                              {cityHotelCount > 0 && (
                                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  {cityHotelCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hotelCount > 0 && (
                        <button
                          onClick={() => handleCityClick(province.cities[0])}
                          className="mt-4 inline-flex items-center gap-2 text-primary hover:text-accent font-medium text-sm transition-colors"
                        >
                          View all {hotelCount} hotels <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProvinces.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-5xl mb-3 text-gray-200" />
                <p className="font-medium">No destinations match "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
