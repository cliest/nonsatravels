import React, { useState, useEffect } from "react";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import { hotelAPI } from "../services/api";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { SkeletonHotelGrid } from "./Skeleton";

const FeaturedDestination = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      try {
        setLoading(true);
        const response = await hotelAPI.getFeatured();
        const hotels = response.data.data.map(hotel => ({
          id: hotel.id,
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
        }));
        setFeaturedHotels(hotels);
      } catch (error) {
        // Silent fail - featured hotels are optional
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHotels();
  }, []);

  return (
    <div className="flex flex-col items-center px-6 md:px-12 lg:px-20 xl:px-32 bg-slate-50 py-16 md:py-20 lg:py-24">
      <Title
        title={t('featuredDestinations.title')}
        subTitle={t('featuredDestinations.subtitle')}
      />

      {loading ? (
        <div className="w-full mt-10">
          <SkeletonHotelGrid count={3} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 stagger-children">
            {featuredHotels.slice(0, 3).map((room, index) => (
              <HotelCard key={room.id} room={room} index={index} />
            ))}
          </div>

          <button
            onClick={() => {
              navigate("/hotels");
              scrollTo(0, 0);
            }}
            className="my-16 px-4 py-2 text-sm text-white font-medium rounded bg-primary hover:bg-accent transition-all cursor-pointer"
          >
            {t('featuredDestinations.viewAll')}
          </button>
        </>
      )}
    </div>
  );
};

export default FeaturedDestination;
