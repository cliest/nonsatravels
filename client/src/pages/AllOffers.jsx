import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import Title from "../components/Title";
import { offerAPI } from "../services/api";
import { SkeletonOfferCard } from "../components/Skeleton";
import { useTranslation } from "react-i18next";

const AllOffers = () => {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, expired

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await offerAPI.getAll();
        setOffers(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter((offer) => {
    const now = new Date();
    const expiryDate = new Date(offer.expiryDate);
    
    if (filter === "active") {
      return expiryDate > now;
    } else if (filter === "expired") {
      return expiryDate <= now;
    }
    return true; // all
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 md:px-12 lg:px-20 xl:px-32 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonOfferCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-primary text-white py-24 md:py-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="px-6 md:px-12 lg:px-20 xl:px-32 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              {t('offers.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t('offers.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === "all"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t('offers.allOffers')} ({offers.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === "active"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t('offers.activeOffers')}
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === "expired"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t('offers.expiredOffers')}
            </button>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {filteredOffers.length === 0 ? (
            <div className="text-center py-24 md:py-32">
              <div className="text-7xl md:text-8xl mb-6 text-gray-200"><FontAwesomeIcon icon={faTag} /></div>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
                {t('offers.noOffers')}
              </h3>
              <p className="text-base md:text-lg text-gray-500">
                {t('offers.checkBack')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {filteredOffers.map((offer) => {
                const now = new Date();
                const expiryDate = new Date(offer.expiryDate);
                const isExpired = expiryDate <= now;
                const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                return (
                  <Link
                    key={offer.id}
                    to={`/offers/${offer.id}`}
                    className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                      isExpired ? "opacity-75" : ""
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${offer.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: "450px",
                    }}
                  >
                    {/* Badges */}
                    <div className="absolute top-5 left-5 flex flex-col gap-2">
                      <span className="px-4 py-2 bg-white text-gray-900 font-bold rounded-full text-sm shadow-md">
                        {offer.priceOff}% {t('exclusiveOffers.off')}
                      </span>
                      {isExpired && (
                        <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-full text-sm shadow-md">
                          {t('offers.expiredOffers')}
                        </span>
                      )}
                      {!isExpired && daysLeft <= 7 && (
                        <span className="px-4 py-2 bg-accent text-gray-900 font-bold rounded-full text-sm shadow-md animate-pulse">
                          {daysLeft} {t('common.days')} left
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-7 text-white transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <h3 className="text-2xl font-bold mb-3 line-clamp-2">
                        {offer.title}
                      </h3>
                      <p className="text-gray-200 mb-5 line-clamp-2">
                        {offer.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-300 mb-1">
                            {t('offers.validUntil')}
                          </p>
                          <p className="text-sm font-semibold">
                            {expiryDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <span className="font-semibold">{t('hotels.viewDetails')}</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="group-hover:translate-x-1 transition-transform"
                          >
                            <path
                              d="M5 12H19M19 12L12 5M19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-primary text-white py-20 md:py-24 mt-16 md:mt-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="px-6 md:px-12 lg:px-20 xl:px-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Don't Miss Out on These Amazing Deals!
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
              Book your perfect stay today and enjoy exclusive discounts on premium hotels
            </p>
            <Link
              to="/hotels"
              className="inline-block bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-accent hover:text-gray-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t('common.browseHotels')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOffers;
