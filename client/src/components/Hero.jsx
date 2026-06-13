import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets, cities } from "../assets/assets";
import { toast } from "../utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { faMagnifyingGlass, faAward } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate dates
    if (searchData.checkIn && searchData.checkOut) {
      const checkIn = new Date(searchData.checkIn);
      const checkOut = new Date(searchData.checkOut);
      
      if (checkOut <= checkIn) {
        toast.warning("Check-out date must be after check-in date");
        return;
      }
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (searchData.destination) params.append("city", searchData.destination);
    if (searchData.checkIn) params.append("checkIn", searchData.checkIn);
    if (searchData.checkOut) params.append("checkOut", searchData.checkOut);
    if (searchData.guests) params.append("guests", searchData.guests);

    // Navigate to hotels page with search params
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className='relative flex flex-col items-start justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center min-h-screen border-b border-primary'>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <p className="bg-accent px-4 py-2 rounded-full mt-24 md:mt-28 lg:mt-32 font-bold text-xs sm:text-sm inline-block shadow-lg animate-pulse">
          <FontAwesomeIcon icon={faAward} className="mr-2" /> Exceptional Hospitality
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold max-w-2xl mt-6 md:mt-8 leading-tight slide-in-left">
          {t('hero.title')}
        </h1>
        <p className="max-w-md lg:max-w-lg mt-5 md:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-gray-100 slide-in-right">
          {t('hero.subtitle')}
        </p>

        {/* Search Input - Enhanced mobile responsiveness */}
        <form 
          onSubmit={handleSearch} 
          className="bg-white/95 backdrop-blur-md text-gray-700 rounded-2xl p-4 sm:p-6 mt-10 md:mt-12 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row gap-4 w-full max-w-6xl shadow-2xl fade-in"
        >
          {/* Destination Input */}
          <div className="w-full lg:flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img src={assets.destination} alt="destination" className="h-4 w-4" />
              <label
                htmlFor="destinationInput"
                className="text-primary font-bold text-xs sm:text-sm"
              >
                Destination
              </label>
            </div>
            <input
              list="destinations"
              id="destinationInput"
              name="destination"
              type="text"
              value={searchData.destination}
              onChange={handleInputChange}
              className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm w-full outline-none focus:border-primary transition-colors"
              placeholder="Where to?"
              required
            />
            <datalist id="destinations">
              {cities.map((city, index) => (
                <option value={city} key={index} />
              ))}
            </datalist>
          </div>

          {/* Check In Date */}
          <div className="w-full lg:flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img src={assets.checkIn} alt="Check In" className="h-4 w-4" />
              <label
                htmlFor="checkIn"
                className="text-primary font-bold text-xs sm:text-sm"
              >
                Check in
              </label>
            </div>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              value={searchData.checkIn}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm w-full outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Check Out Date */}
          <div className="w-full lg:flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img src={assets.checkOut} alt="Check Out" className="h-4 w-4" />
              <label
                htmlFor="checkOut"
                className="text-primary font-bold text-xs sm:text-sm"
              >
                Check out
              </label>
            </div>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              value={searchData.checkOut}
              onChange={handleInputChange}
              min={searchData.checkIn || new Date().toISOString().split('T')[0]}
              className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm w-full outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Guests Input */}
          <div className="w-full lg:flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img src={assets.guests} alt="Guests" className="h-4 w-4" />
              <label
                htmlFor="guests"
                className="text-primary font-bold text-xs sm:text-sm"
              >
                Guests
              </label>
            </div>
            <input
              min={1}
              max={4}
              id="guests"
              name="guests"
              type="number"
              value={searchData.guests}
              onChange={handleInputChange}
              className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm w-full outline-none focus:border-primary transition-colors"
              placeholder="1"
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 px-6 font-bold text-white mt-2 sm:col-span-2 lg:col-span-1 lg:mt-auto h-auto lg:h-14 transition-all duration-300 transform hover:scale-105 hover:shadow-xl btn-scale"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <span className="text-sm sm:text-base">Search Hotels</span>
          </button>
        </form>

        {/* Social Media Icons */}
        <div className="flex justify-start items-center gap-4 mt-8 mb-8">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-accent hover:scale-110 transition-all duration-300"
            aria-label="Visit our Facebook page"
          >
            <FontAwesomeIcon icon={faFacebook} size="lg" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-accent hover:scale-110 transition-all duration-300"
            aria-label="Visit our Instagram page"
          >
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-accent hover:scale-110 transition-all duration-300"
            aria-label="Visit our LinkedIn page"
          >
            <FontAwesomeIcon icon={faLinkedin} size="lg" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
