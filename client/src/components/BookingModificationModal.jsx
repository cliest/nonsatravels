import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCalendarAlt,
  faUsers,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faPenToSquare,
  faCircleXmark,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { useCurrency } from "../context/CurrencyContext";
import api, { bookingAPI } from "../services/api";
import { toast } from "../utils/toast";

const formatDateToInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const BookingModificationModal = ({ booking, onClose, onSuccess }) => {
  const { formatPrice, currency } = useCurrency();
  
  const [checkInDate, setCheckInDate] = useState(
    formatDateToInput(booking.checkInDate)
  );
  const [checkOutDate, setCheckOutDate] = useState(
    formatDateToInput(booking.checkOutDate)
  );
  const [guests, setGuests] = useState(booking.guests);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [newPrice, setNewPrice] = useState(null);
  const [error, setError] = useState(null);

  const minDate = formatDateToInput(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow

  // Check if dates have changed
  const hasChanges =
    checkInDate !== formatDateToInput(booking.checkInDate) ||
    checkOutDate !== formatDateToInput(booking.checkOutDate) ||
    guests !== booking.guests;

  // Calculate nights
  const calculateNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diff = checkOut - checkIn;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  // Check availability and get new pricing when dates change
  useEffect(() => {
    const checkAvailabilityAndPrice = async () => {
      if (!hasChanges || nights <= 0) {
        setAvailability(null);
        setNewPrice(null);
        return;
      }

      setChecking(true);
      setError(null);

      try {
        // Check availability - exclude current booking from check
        const availResponse = await api.get(
          `/availability/check/${booking.hotelId.id}`,
          {
            params: {
              checkIn: checkInDate,
              checkOut: checkOutDate,
              roomsNeeded: 1,
              excludeBookingId: booking.id,
            },
          }
        );

        setAvailability(availResponse.data.data || availResponse.data);

        // Get new pricing
        const pricingResponse = await api.get(
          `/availability/pricing/${booking.hotelId.id}`,
          {
            params: {
              checkIn: checkInDate,
              checkOut: checkOutDate,
            },
          }
        );

        setNewPrice(pricingResponse.data.data || pricingResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to check availability");
        setAvailability(null);
        setNewPrice(null);
      } finally {
        setChecking(false);
      }
    };

    const debounce = setTimeout(() => {
      checkAvailabilityAndPrice();
    }, 500);

    return () => clearTimeout(debounce);
  }, [checkInDate, checkOutDate, guests, hasChanges, nights, booking.hotelId.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges) {
      toast.error("No changes detected");
      return;
    }

    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    if (!availability?.available) {
      toast.error("Selected dates are not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await bookingAPI.modify(booking.id, {
        checkInDate,
        checkOutDate,
        guests,
        roomsRequested: 1,
      });

      toast.success("Booking modified successfully!");
      onSuccess(response.data.data);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to modify booking";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const priceDifference = newPrice ? newPrice.totalPrice - booking.totalPrice : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2"><FontAwesomeIcon icon={faPenToSquare} /> Modify Booking</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hotel Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-bold text-lg text-gray-800">
              {booking.hotelId.name}
            </h3>
            <p className="text-sm text-gray-600">{booking.hotelId.location}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Booking ID: {booking.id}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-yellow-600 mt-1"
              />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Modification Policy
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  • Modifications must be made at least 24 hours before check-in
                  <br />• Price may change based on new dates and availability
                  <br />• {priceDifference > 0 ? 'Additional charges' : priceDifference < 0 ? 'Refunds' : 'No changes'} will be processed automatically
                </p>
              </div>
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="mr-2 text-primary"
                />
                Check-in Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={minDate}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {formatDateDisplay(booking.checkInDate)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="mr-2 text-primary"
                />
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {formatDateDisplay(booking.checkOutDate)}
              </p>
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary" />
              Number of Guests
            </label>
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              min="1"
              max="4"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </p>
          </div>

          {/* Nights Display */}
          {nights > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>{nights}</strong> {nights === 1 ? "night" : "nights"} stay
              </p>
            </div>
          )}

          {/* Availability Status */}
          {checking && (
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-primary text-2xl mb-2"
              />
              <p className="text-sm text-gray-600">
                Checking availability and pricing...
              </p>
            </div>
          )}

          {!checking && hasChanges && availability && (
            <div
              className={`p-4 rounded-xl border-2 ${
                availability.available
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={availability.available ? faCheckCircle : faTimes}
                  className={`text-2xl ${
                    availability.available ? "text-green-600" : "text-red-600"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      availability.available ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {availability.available
                      ? <><FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Dates Available!</>
                      : <><FontAwesomeIcon icon={faCircleXmark} className="mr-1" /> Dates Not Available</>}
                  </p>
                  <p
                    className={`text-sm ${
                      availability.available ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {availability.available
                      ? `${availability.availableRooms} room(s) available`
                      : "Please select different dates"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Comparison */}
          {!checking && hasChanges && newPrice && availability?.available && (
            <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-gray-800 mb-4">Price Comparison</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 line-through">
                    Original Price:
                  </span>
                  <span className="text-gray-500 line-through">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-primary">New Price:</span>
                  <span className="text-primary">
                    {formatPrice(newPrice.totalPrice)}
                  </span>
                </div>

                {priceDifference !== 0 && (
                  <div
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      priceDifference > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <span className="font-semibold">
                      {priceDifference > 0
                        ? <><FontAwesomeIcon icon={faArrowUp} className="mr-1" /> Additional Cost:</>
                        : <><FontAwesomeIcon icon={faArrowDown} className="mr-1" /> You Save:</>}
                    </span>
                    <span className="font-bold text-lg">
                      {formatPrice(Math.abs(priceDifference))}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-4">
                * Prices shown in {currency}. {priceDifference > 0 ? 'Additional charges' : priceDifference < 0 ? 'Refunds' : 'No changes'} will be processed to your original payment method.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                checking ||
                !hasChanges ||
                !availability?.available ||
                nights <= 0
              }
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Modifying...
                </>
              ) : (
                "Confirm Modification"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModificationModal;
