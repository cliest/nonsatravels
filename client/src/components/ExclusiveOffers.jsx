import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Title from "./Title";
import { assets } from "../assets/assets";
import { offerAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import { SkeletonOfferCard } from "./Skeleton";

const ExclusiveOffers = () => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await offerAPI.getAll();
        setOffers(response.data?.data || []);
      } catch (error) {
        // Silent fail - offers are optional
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return (
    <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <Title
            title={t('exclusiveOffers.title')}
            subTitle={t('exclusiveOffers.subtitle')}
            align="left"
          />
          <Link 
            to="/offers"
            className="group flex items-center gap-2 font-semibold text-primary hover:text-accent-dark transition-colors px-4 py-2 rounded-lg hover:bg-accent/5 mt-6 md:mt-0"
          >
            {t('exclusiveOffers.viewAllOffers')}
            <svg
              width="20"
              height="20"
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
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonOfferCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {offers.map((item) => (
            <Link
              key={item.id}
              to={`/offers/${item.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "400px",
              }}
            >
              <div className="absolute top-5 left-5">
                <span className="px-4 py-2 bg-white text-gray-900 font-bold rounded-full text-sm shadow-md">
                  {item.priceOff}% OFF
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-200 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-300">
                    Expires {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <button className="flex items-center gap-2 font-semibold text-white hover:text-accent transition-colors">
                    View Offer
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
                  </button>
                </div>
              </div>

              {/* Hover overlay effect */}
              <div
                className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  hoveredCard === item.id ? "opacity-100" : "opacity-0"
                }`}
              ></div>
            </Link>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
