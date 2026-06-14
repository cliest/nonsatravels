import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/AuthContext";
import { bookingAPI } from "../services/api";
import { toast } from "../utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faDollarSign,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faChevronRight,
  faFilter,
  faSearch,
  faEdit,
  faCalendarXmark,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { SkeletonBookingCard } from "../components/Skeleton";
import BookingModificationModal from "../components/BookingModificationModal";
import { useTranslation } from "react-i18next";

const MyBookings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modifyingBooking, setModifyingBooking] = useState(null);

  // Fetch user's bookings on mount
  useEffect(() => {
    if (!isSignedIn) {
      navigate("/");
      return;
    }
    fetchBookings();
  }, [isSignedIn, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      toast.success("Booking cancelled successfully");
      // Refresh bookings
      fetchBookings();
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  const handleModifySuccess = (updatedBooking) => {
    // Update the booking in the list
    setBookings((prevBookings) =>
      prevBookings.map((b) =>
        b.id === updatedBooking.id ? updatedBooking : b
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBookingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const hotelName = booking.hotelId?.name || booking.hotel?.name || "";
    const matchesSearch = hotelName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Separate bookings into upcoming and past
  const now = new Date();
  const upcomingBookings = filteredBookings.filter(
    (booking) => new Date(booking.checkInDate) >= now
  );
  const pastBookings = filteredBookings.filter(
    (booking) => new Date(booking.checkOutDate) < now
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-6 sm:mb-8 fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
            {t('bookings.myBookings')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and view all your hotel reservations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Total Bookings"
            value={bookings.length}
            color="blue"
          />
          <StatCard
            label="Upcoming"
            value={upcomingBookings.length}
            color="green"
          />
          <StatCard
            label="Completed"
            value={
              bookings.filter((b) => b.status === "completed")
                .length
            }
            color="purple"
          />
          <StatCard
            label="Cancelled"
            value={
              bookings.filter((b) => b.status === "cancelled")
                .length
            }
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 slide-in-left card-hover">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Search by hotel name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <FontAwesomeIcon
                icon={faFilter}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center fade-in">
            <div className="text-5xl sm:text-6xl mb-4 text-gray-300"><FontAwesomeIcon icon={faCalendarXmark} /></div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Start exploring our hotels and make your first booking!"}
            </p>
            <button
              onClick={() => navigate("/hotels")}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:shadow-xl transition-all font-medium btn-scale text-sm sm:text-base"
            >
              Browse Hotels
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Upcoming Trips
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {upcomingBookings.map((booking, index) => (
                    <div key={booking.id} className="fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <BookingCard
                        booking={booking}
                        navigate={navigate}
                        onCancel={handleCancelBooking}
                        onModify={() => setModifyingBooking(booking)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Past Trips
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {pastBookings.map((booking, index) => (
                    <div key={booking.id} className="fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <BookingCard
                        booking={booking}
                        navigate={navigate}
                        isPast={true}
                        onCancel={handleCancelBooking}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modification Modal */}
      {modifyingBooking && (
        <BookingModificationModal
          booking={modifyingBooking}
          onClose={() => setModifyingBooking(null)}
          onSuccess={handleModifySuccess}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 card-hover slide-in-left">
      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

// Booking Card Component
const BookingCard = ({ booking, navigate, isPast = false, onCancel, onModify }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return faCheckCircle;
      case "payment_confirmed":
        return faCheckCircle;
      case "pending_payment":
        return faClock;
      case "pending":
        return faClock;
      case "cancelled":
        return faTimesCircle;
      case "completed":
        return faCheckCircle;
      default:
        return faClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "payment_confirmed":
        return "bg-orange-100 text-orange-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: "Pending Payment",
      payment_confirmed: "Payment Confirmed",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      pending: "Pending",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden card-hover ${
        isPast ? "opacity-90" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Hotel Image */}
        <div className="w-full sm:w-1/3 h-48 sm:h-auto">
          <img
            src={booking.room?.images?.[0] || booking.room?.image || booking.hotel?.image || ''}
            alt={booking.hotel?.name || booking.room?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="w-full sm:w-2/3 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 line-clamp-1">
                  {booking.hotelId?.name || booking.hotel?.name || "Hotel"}
                </h3>
                <span
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${getStatusColor(
                    booking.status
                  )}`}
                >
                  <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 mb-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sm flex-shrink-0" />
                <span className="line-clamp-1">{booking.hotelId?.address || booking.hotel?.address || "Location"}</span>
              </div>
            </div>

            <div className="text-left sm:text-right bg-primary/5 p-3 rounded-lg border border-primary/10">
              <p className="text-xs text-gray-600 mb-1">Total Price</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                ${booking.totalPrice}
              </p>
            </div>
          </div>

          {/* Booking Info Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-primary text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Check-in</p>
                <p className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-1">
                  {formatDate(booking.checkInDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-primary text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Check-out</p>
                <p className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-1">
                  {formatDate(booking.checkOutDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faUsers} className="text-primary text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Guests</p>
                <p className="font-semibold text-xs sm:text-sm text-gray-900">
                  {booking.guests || booking.numberOfGuests || 1}{" "}
                  {(booking.guests || booking.numberOfGuests || 1) === 1 ? "Guest" : "Guests"}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Guests:</span>
              <span>{booking.guests || booking.numberOfGuests || 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Nights:</span>
              <span>{calculateNights()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Booking ID:</span>
              <span className="font-mono">#{booking.id.slice(-8)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate(`/hotels/${booking.hotelId?.id || booking.hotelId}`)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all font-medium btn-scale text-sm sm:text-base"
            >
              View Hotel Details
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>

            {["confirmed", "pending_payment", "payment_confirmed"].includes(booking.status) && !isPast && (
              <>
                <button 
                  onClick={() => onModify && onModify()}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium btn-scale text-sm sm:text-base"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-sm" />
                  Modify Booking
                </button>
                
                <button 
                  onClick={() => onCancel(booking.id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all font-medium btn-scale text-sm sm:text-base"
                >
                  Cancel Booking
                </button>
              </>
            )}

            {isPast && booking.status === "completed" && (
              <button 
                onClick={() => navigate(`/hotels/${booking.hotelId?.id || booking.hotelId}`)}
                className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/5 transition-all font-medium btn-scale text-sm sm:text-base"
              >
                Write a Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  isPast: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onModify: PropTypes.func,
};

export default MyBookings;
