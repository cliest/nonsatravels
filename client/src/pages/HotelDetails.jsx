import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facilityIcons, roomCommonData, assets } from "../assets/assets";
import StarRating from "../components/StarRating";
import { SkeletonDetailPage } from "../components/Skeleton";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import DynamicPriceDisplay from "../components/DynamicPriceDisplay";
import ShareButtons from "../components/ShareButtons";
import ImageLightbox from "../components/ImageLightbox";
import WeatherWidget from "../components/WeatherWidget";
import WhatsAppButton, { generateBookingMessage } from "../components/WhatsAppButton";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMapMarkerAlt,
  faPhone,
  faCalendarAlt,
  faUsers,
  faCheck,
  faStar,
  faThumbsUp,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/AuthContext";
import { hotelAPI, reviewAPI, availabilityAPI, savedSearchAPI, bookingAPI } from "../services/api";
import { toast } from "../utils/toast";
import { optimizeImage } from "../utils/cloudinary";
import { Helmet } from "react-helmet-async";


const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [hotel, setHotel] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [similarHotels, setSimilarHotels] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSortBy, setReviewSortBy] = useState("recent"); // recent, helpful, rating
  const [showCalendar, setShowCalendar] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewPhotos, setReviewPhotos] = useState([""]);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        const [hotelRes, reviewsRes, allHotelsRes] = await Promise.all([
          hotelAPI.getById(id),
          reviewAPI.getByHotel(id),
          hotelAPI.getAll(),
        ]);
        
        setHotel(hotelRes.data.data);
        if (hotelRes.data.data.roomTypes?.length > 0) {
          setSelectedRoomType(hotelRes.data.data.roomTypes[0]);
        }
        setReviews(reviewsRes.data.data);

        // Check if user can review (has a completed booking)
        try {
          const bookingsRes = await bookingAPI.getAll({ status: 'completed' });
          const myBookings = bookingsRes.data.data || [];
          setCanReview(myBookings.some(b => (b.hotelId?.id || b.hotelId) === id));
        } catch { setCanReview(false); }
        
        // Filter similar hotels (same city or similar price range)
        const currentHotel = hotelRes.data.data;
        const similar = allHotelsRes.data.data
          .filter(h => h.id !== currentHotel.id)
          .slice(0, 3);
        setSimilarHotels(similar);
      } catch (error) {
        toast.error("Hotel not found");
        navigate("/hotels");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      toast.warning("Please select check-in and check-out dates");
      return;
    }

    try {
      // Check availability first using API service
      const availabilityRes = await availabilityAPI.check(
        hotel.id,
        checkInDate.toISOString(),
        checkOutDate.toISOString(),
        guests
      );
      const availabilityData = availabilityRes.data;

      if (!availabilityData.success || !availabilityData.data.available) {
        toast.error(`Sorry, only ${availabilityData.data.availableRooms} rooms available for these dates`);
        return;
      }

      // Get dynamic pricing using API service
      const pricingRes = await availabilityAPI.getPricing(
        hotel.id,
        checkInDate.toISOString(),
        checkOutDate.toISOString(),
        guests,
        selectedRoomType?.id
      );
      const pricingData = pricingRes.data;

      if (!pricingData.success) {
        toast.error("Error calculating pricing");
        return;
      }

      // Calculate total price
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * pricingData.data.pricePerNight * guests;

      // Prepare booking data
      const bookingData = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        guests,
        totalPrice,
        pricePerNight: pricingData.data.pricePerNight,
        userName: user?.fullName || user?.username || "",
        userEmail: user?.email || "",
        roomTypeId: selectedRoomType?.id || null,
        roomTypeName: selectedRoomType?.name || hotel.roomType,
      };

      // Navigate to payment page with booking data
      navigate("/payment", { state: { bookingData } });
    } catch (error) {
      toast.error("Error processing booking. Please try again.");
    }
  };

  const handleDateSelect = ({ checkIn, checkOut }) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.warning("Please sign in to leave a review");
      return;
    }

    if (!newReview.comment.trim()) {
      toast.warning("Please write a review comment");
      return;
    }
    
    try {
      const validPhotos = reviewPhotos.filter(p => p.trim());
      const reviewData = {
        hotelId: hotel.id,
        rating: newReview.rating,
        comment: newReview.comment,
        photos: validPhotos,
        userName: user.fullName || user.username || "Anonymous User",
        userAvatar: user.imageUrl || "https://i.pravatar.cc/150?img=8",
      };

      const response = await reviewAPI.create(reviewData);
      setReviews([response.data.data, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      setReviewPhotos([""]);
      setShowReviewForm(false);
      toast.success(response.data.message || "Review submitted for approval!");
      
      // Refresh hotel data to get updated rating
      const hotelRes = await hotelAPI.getById(id);
      setHotel(hotelRes.data.data);
    } catch (error) {
      // Error toast already shown by interceptor
    }
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch (reviewSortBy) {
      case "helpful":
        return sorted.sort((a, b) => b.helpful - a.helpful);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "recent":
      default:
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPrice = calculateNights() * (hotel?.pricePerNight || 0);

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleLightboxNavigate = (direction) => {
    if (direction === "prev" && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (direction === "next" && lightboxIndex < hotel.images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else if (typeof direction === "number") {
      setLightboxIndex(direction);
    }
  };

  if (loading) {
    return <SkeletonDetailPage />;
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <img src={assets.noResultIcon} alt="Not found" className="w-32 h-32 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Not Found</h2>
        <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/hotels")}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
        >
          Browse All Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16">
      <Helmet>
        <title>{hotel.name} - Book Now | Nonsa Travels</title>
        <meta name="description" content={`Book ${hotel.name} in ${hotel.city}, ${hotel.address}. Starting from $${hotel.pricePerNight}/night. ${hotel.amenities?.slice(0, 4).join(', ')}.`} />
        <meta property="og:title" content={`${hotel.name} | Nonsa Travels`} />
        <meta property="og:description" content={`${hotel.name} in ${hotel.city}. From $${hotel.pricePerNight}/night. ${hotel.rating} star rating.`} />
        {hotel.images?.[0] && <meta property="og:image" content={hotel.images[0]} />}
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: hotel.name,
          address: { "@type": "PostalAddress", streetAddress: hotel.address, addressLocality: hotel.city, addressCountry: "ZM" },
          starRating: { "@type": "Rating", ratingValue: hotel.rating },
          priceRange: `$${hotel.pricePerNight}+`,
          image: hotel.images?.[0],
          telephone: hotel.contact,
        })}</script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-accent transition-all mb-6 group btn-scale"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Hotels</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Section - Hotel Details */}
          <div className="lg:col-span-2 space-y-6 fade-in">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
              {/* Main Image */}
              <div 
                className="relative h-64 sm:h-80 md:h-96 bg-gray-200 overflow-hidden cursor-pointer group"
                onClick={() => handleImageClick(selectedImage)}
              >
                <img
                  src={optimizeImage(hotel.images[selectedImage], { width: 1200, height: 800, quality: 85 })}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Expand Icon Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full">
                    <FontAwesomeIcon icon={faExpand} className="text-primary" />
                    <span className="text-sm font-medium text-gray-800">View Full Size</span>
                  </div>
                </div>
                {/* Best Seller Badge */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent text-gray-900 text-xs sm:text-sm font-bold rounded-full shadow-lg slide-in-left">
                  Featured
                </div>
                {/* Rating Badge */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg slide-in-right">
                  <StarRating rating={hotel.rating || 4.5} />
                  <span className="font-bold text-gray-800 text-sm sm:text-base">{hotel.rating || 4.5}</span>
                </div>
                {/* Image Counter */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full">
                  {selectedImage + 1} / {hotel.images.length}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50">
                {hotel.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 sm:h-20 rounded-lg overflow-hidden transition-all duration-300 group ${
                      selectedImage === index
                        ? "ring-2 sm:ring-4 ring-accent scale-105 opacity-100"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={optimizeImage(image, { width: 200, height: 150, quality: 75 })}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <FontAwesomeIcon 
                        icon={faExpand} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-lg"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hotel Information */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 card-hover">
              {/* Header */}
              <div className="border-b border-gray-200 pb-5 sm:pb-6 mb-5 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full mb-3">
                      {hotel.roomTypes?.length || 0} Room Type{hotel.roomTypes?.length !== 1 ? 's' : ''} Available
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
                      {hotel.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-accent flex-shrink-0" />
                      <span className="line-clamp-2">{hotel.address}, {hotel.city}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-xs sm:text-sm text-gray-500">Starting from</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      ${hotel.pricePerNight}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">per night</p>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Share this hotel:</p>
                  <ShareButtons
                    url={window.location.href}
                    title={`Check out ${hotel.name} on Nonsa Travels!`}
                    description={`${hotel.name} - ${hotel.city}. Starting from $${hotel.pricePerNight}/night`}
                    hashtags={["NonsaTravels", "Travel", hotel.city.replace(/\s/g, "")]}
                  />
                </div>

                {/* Contact Info */}
                {hotel.contact && (
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FontAwesomeIcon icon={faPhone} className="text-accent flex-shrink-0" />
                    <a href={`tel:${hotel.contact}`} className="hover:text-accent transition-colors">
                      {hotel.contact}
                    </a>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {hotel.amenities.map((amenity, index) => {
                      const Icon = facilityIcons[amenity];
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-accent hover:bg-accent/5 hover:shadow-md transition-all duration-200 group"
                        >
                          {Icon ? (
                            <img
                              src={Icon}
                              alt={amenity}
                              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-8 h-8 flex items-center justify-center bg-accent/20 rounded-full">
                              <FontAwesomeIcon icon={faCheck} className="text-accent text-sm" />
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
                            {amenity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Room Features */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">What This Place Offers</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {roomCommonData.map((item, index) => (
                    <div key={index} className="flex gap-3 sm:gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <img src={item.icon} alt={item.title} className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">About This Stay</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Experience luxury and comfort at {hotel.name}, located in the heart of {hotel.city}. 
                  Our {(selectedRoomType?.name || hotel.roomType || 'room').toLowerCase()} offers a perfect blend of modern amenities and classic elegance. 
                  Whether you're traveling for business or leisure, our dedicated staff ensures your stay is memorable 
                  and exceeds your expectations. Enjoy world-class facilities, exceptional service, and a prime location 
                  that puts you close to all major attractions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Booking Card */}
          <div className="lg:col-span-1">
            {/* Room Type Selection */}
            {hotel.roomTypes && hotel.roomTypes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-4 card-hover">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Room Type</h3>
                <div className="space-y-2.5">
                  {hotel.roomTypes.map((rt) => (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => setSelectedRoomType(rt)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                        selectedRoomType?.id === rt.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{rt.name}</p>
                            {selectedRoomType?.id === rt.id && (
                              <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                          </div>
                          {rt.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{rt.description}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">Up to {rt.maxGuests} guests · {rt.roomCount} room{rt.roomCount !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-lg font-bold text-primary">${rt.pricePerNight}</p>
                          <p className="text-[10px] text-gray-500">per night</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:sticky lg:top-24 slide-in-right card-hover">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Reserve Your Stay</h3>
              
              <form onSubmit={handleBooking} className="space-y-4">
                {/* Calendar Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-primary text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {checkInDate && checkOutDate 
                        ? `${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`
                        : 'Select Dates'
                      }
                    </span>
                    <span>{showCalendar ? '▲' : '▼'}</span>
                  </button>
                </div>

                {/* Availability Calendar */}
                {showCalendar && (
                  <div className="border-t border-gray-200 pt-4">
                    <AvailabilityCalendar
                      hotelId={hotel.id}
                      onDateSelect={handleDateSelect}
                      selectedCheckIn={checkInDate}
                      selectedCheckOut={checkOutDate}
                    />
                  </div>
                )}

                {/* Guests */}
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faUsers} className="text-accent" />
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    min={1}
                    max={hotel.totalRooms || 10}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Dynamic Price Display */}
                {checkInDate && checkOutDate && (
                  <div className="border-t border-gray-200 pt-4">
                    <DynamicPriceDisplay
                      hotelId={hotel.id}
                      checkIn={checkInDate}
                      checkOut={checkOutDate}
                      roomsNeeded={guests}
                      roomTypeId={selectedRoomType?.id}
                    />
                  </div>
                )}

                {/* Scarcity Indicator */}
                {hotel.availableRooms <= 3 && hotel.availableRooms > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-red-600 font-bold text-sm animate-pulse">Only {hotel.availableRooms} room{hotel.availableRooms !== 1 ? 's' : ''} left!</p>
                  </div>
                )}

                {/* Book Button */}
                <button
                  type="submit"
                  disabled={!checkInDate || !checkOutDate}
                  className="w-full py-3 sm:py-4 bg-primary text-white font-bold rounded-lg hover:shadow-xl transition-all shadow-lg text-base sm:text-lg btn-scale disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkInDate && checkOutDate ? 'Reserve Now' : 'Select Dates to Continue'}
                </button>

                {/* WhatsApp Booking Option */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <WhatsAppButton
                  variant="full"
                  message={generateBookingMessage(hotel, checkInDate, checkOutDate, guests)}
                >
                  Book via WhatsApp
                </WhatsAppButton>

                {isSignedIn && checkInDate && checkOutDate && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await savedSearchAPI.create({
                          city: hotel.city,
                          checkIn: checkInDate.toISOString(),
                          checkOut: checkOutDate.toISOString(),
                          guests,
                          maxPrice: selectedRoomType?.pricePerNight || hotel.pricePerNight,
                        });
                        toast.success("Search saved! We'll notify you of price drops.");
                      } catch { toast.error("Failed to save search"); }
                    }}
                    className="w-full py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors font-medium"
                  >
                    Save Search & Get Price Alerts
                  </button>
                )}

                <p className="text-xs text-gray-500 text-center">
                  You won't be charged yet
                </p>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Cancellation Policy</p>
                    <p className="text-xs text-gray-600">{hotel.cancellationLabel || 'Free cancellation up to 24 hours before check-in'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Instant confirmation</p>
                    <p className="text-xs text-gray-600">Your booking is confirmed immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Real-time pricing</p>
                    <p className="text-xs text-gray-600">Prices adjust based on demand and availability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          {hotel.location && hotel.location.coordinates && (
            <div className="mb-16">
              <WeatherWidget
                latitude={hotel.location.coordinates[1]}
                longitude={hotel.location.coordinates[0]}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                city={hotel.city}
              />
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-10 sm:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Guest Reviews</h2>
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating rating={parseFloat(getAverageRating())} />
                  <span className="text-2xl font-bold text-primary">{getAverageRating()}</span>
                  <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              </div>
            </div>
            {isSignedIn && !showReviewForm && canReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Write a Review
              </button>
            )}
            {isSignedIn && !canReview && !showReviewForm && (
              <p className="text-xs text-gray-400 italic">Only guests who completed a stay can leave reviews</p>
            )}
          </div>

          {/* Rating Distribution */}
          {reviews.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const distribution = getRatingDistribution();
                  const count = distribution[star];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium text-gray-700">{star}</span>
                        <FontAwesomeIcon icon={faStar} className="text-accent text-xs" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white border-2 border-accent/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Write Your Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  
                </button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <FontAwesomeIcon
                          icon={faStar}
                          className={`text-2xl ${star <= newReview.rating ? 'text-accent' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optional)</label>
                  <div className="space-y-2">
                    {reviewPhotos.map((url, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => { const arr = [...reviewPhotos]; arr[idx] = e.target.value; setReviewPhotos(arr); }}
                          placeholder="Paste image URL..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        />
                        {reviewPhotos.length > 1 && (
                          <button type="button" onClick={() => setReviewPhotos(reviewPhotos.filter((_, i) => i !== idx))}
                            className="px-2 text-red-400 hover:text-red-600 text-sm">✕</button>
                        )}
                      </div>
                    ))}
                    {reviewPhotos.length < 5 && (
                      <button type="button" onClick={() => setReviewPhotos([...reviewPhotos, ""])}
                        className="text-sm text-primary hover:text-accent font-medium">+ Add photo</button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Sort */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Reviews ({reviews.length})</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={reviewSortBy}
                  onChange={(e) => setReviewSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {getSortedReviews().map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating rating={review.rating} />
                          <span className="ml-1 font-medium text-gray-900">{review.rating}.0</span>
                        </div>
                      </div>
                      {review.isVerifiedGuest && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium mb-2">
                          <FontAwesomeIcon icon={faCheck} className="text-[8px]" /> Verified Guest
                        </span>
                      )}
                      <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                      {review.photos?.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {review.photos.map((photo, i) => (
                            <img key={i} src={photo} alt={`Review photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(photo, '_blank')} />
                          ))}
                        </div>
                      )}
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors">
                        <FontAwesomeIcon icon={faThumbsUp} />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FontAwesomeIcon icon={faStar} className="text-5xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
              {isSignedIn && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors"
                >
                  Write the First Review
                </button>
              )}
            </div>
          )}
        </div>

        {/* Similar Hotels Section */}
        <div className="mt-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Similar Hotels You Might Like</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarHotels.map((room) => (
                <div
                  key={room.id}
                  onClick={() => {
                    navigate(`/hotels/${room.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.images?.[0] || room.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=75'}
                      alt={room.name || room.hotel?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <StarRating rating={room.rating || 4.5} />
                      <span className="text-sm font-medium">{room.rating || 4.5}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                      {room.name || room.hotel?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">{room.city || room.hotel?.city}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">${room.pricePerNight}</span>
                      <span className="text-sm text-gray-600">per night</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={hotel.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
};

HotelDetails.propTypes = {
  // No props needed as we use URL params
};

export default HotelDetails;
