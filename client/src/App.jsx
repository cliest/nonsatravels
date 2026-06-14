import React, { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import PageLoadingBar from "./components/PageLoadingBar";
import ChatWidget from "./components/ChatWidget";
import CompareBar from "./components/CompareBar";
import SkipLink from "./components/SkipLink";
import ScrollToTop from "./components/ScrollToTop";
import EmailVerificationBanner from "./components/EmailVerificationBanner";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { useReferralTracking } from "./hooks/useReferralTracking";
import { WeatherProvider } from "./context/WeatherContext";
import { AuthProvider } from "./context/AuthContext";

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const AllHotels = lazy(() => import("./pages/AllHotels"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const OfferDetails = lazy(() => import("./pages/OfferDetails"));
const AllOffers = lazy(() => import("./pages/AllOffers"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Favorites = lazy(() => import("./pages/Favorites"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Payment = lazy(() => import("./pages/Payment"));
const Compare = lazy(() => import("./pages/Compare"));
const ReferralDashboard = lazy(() => import("./pages/ReferralDashboard"));
const LoyaltyDashboard = lazy(() => import("./pages/LoyaltyDashboard"));
const MapView = lazy(() => import("./pages/MapView"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));
const MyTrips = lazy(() => import("./pages/MyTrips"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const SharedTrip = lazy(() => import("./pages/SharedTrip"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"));
const FacebookCallback = lazy(() => import("./pages/FacebookCallback"));
const AppleCallback = lazy(() => import("./pages/AppleCallback"));
const MagicLinkLogin = lazy(() => import("./pages/MagicLinkLogin"));
const MagicLinkVerify = lazy(() => import("./pages/MagicLinkVerify"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const location = useLocation();
  const isOwnerPath = location.pathname.includes("admin");
  
  // Monitor network status
  useNetworkStatus();
  
  // Track referral codes from URL
  useReferralTracking();

  return (
    <AuthProvider>
      <WeatherProvider>
        <ScrollToTop />
        <SkipLink />
        <EmailVerificationBanner />
        {!isOwnerPath && <Navbar />}
        <main id="main-content" tabIndex="-1" className="min-h-[70vh]">
          <Suspense fallback={<PageLoadingBar />}>
            <div key={location.pathname} className="page-enter">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hotels" element={<AllHotels />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/offers" element={<AllOffers />} />
              <Route path="/offers/:id" element={<OfferDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/referrals" element={<ReferralDashboard />} />
              <Route path="/loyalty" element={<LoyaltyDashboard />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/trip-planner" element={<TripPlanner />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/trips/:id" element={<TripDetails />} />
              <Route path="/trips/shared/:token" element={<SharedTrip />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/auth/facebook/callback" element={<FacebookCallback />} />
              <Route path="/auth/apple/callback" element={<AppleCallback />} />
              <Route path="/auth/magic-link" element={<MagicLinkLogin />} />
              <Route path="/auth/magic-link/:token" element={<MagicLinkVerify />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </Suspense>
        </main>
        <Footer />
        {!isOwnerPath && <ChatWidget />}
        {!isOwnerPath && <CompareBar />}
      </WeatherProvider>
    </AuthProvider>
  );
};

export default App;
