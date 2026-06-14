import React, { useState, useEffect } from "react";
import Title from "./Title";
import StarRating from "./StarRating";
import { testimonialAPI } from "../services/api";
import { SkeletonTestimonialCard } from "./Skeleton";
import { useTranslation } from "react-i18next";

const Testimonial = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialAPI.getAll();
      if (response.data.success) {
        setTestimonials(response.data.data);
      }
    } catch (error) {
      // Silent fail - testimonials are optional
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-stretch justify-center gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="max-w-sm w-full">
              <SkeletonTestimonialCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show the section if there are no testimonials
  }

  return (
    <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <Title
          title={t('testimonials.title')}
          subTitle={t('testimonials.subtitle')}
          align="center"
        />
        <div className="flex flex-wrap items-stretch justify-center gap-6 mt-12 md:mt-16">
          {testimonials.slice(0, 2).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-sm w-full"
            >
              <div className="flex items-center gap-4 mb-5">
                <img
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-accent/20"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs md:text-sm">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                <StarRating rating={testimonial.rating} />
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                "{testimonial.review}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
