import React, { lazy, Suspense } from "react";
import Hero from "../components/Hero";
import { SkeletonHotelGrid } from "../components/Skeleton";

// Lazy load components below the fold
const FeaturedDestination = lazy(() => import("../components/FeaturedDestination"));
const ExclusiveOffers = lazy(() => import("../components/ExclusiveOffers"));
const FeaturedBlog = lazy(() => import("../components/FeaturedBlog"));
const Testimonial = lazy(() => import("../components/Testimonial"));
const Newsletter = lazy(() => import("../components/Newsletter"));

const Home = () => {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-12"><SkeletonHotelGrid count={3} /></div>}>
        <FeaturedDestination />
        <ExclusiveOffers />
        <FeaturedBlog />
        <Testimonial />
        <Newsletter />
      </Suspense>
    </>
  );
};

export default Home;
