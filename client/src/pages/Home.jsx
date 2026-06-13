import React, { lazy, Suspense } from "react";
import Hero from "../components/Hero";
import Loading from "../components/Loading";

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
      <Suspense fallback={<Loading />}>
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
