import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCalendarCheck,
  faHotel,
  faUser,
  faEnvelope,
  faPhone,
  faClock,
  faMapMarkerAlt,
  faCreditCard,
  faDownload,
  faShare,
  faHome,
  faCopy,
  faUniversity,
  faMoneyBillWave,
  faInfoCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { toast } from "../utils/toast";
import confetti from "canvas-confetti";
import WhatsAppButton, { generateConfirmationMessage } from "../components/WhatsAppButton";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Get booking data from navigation state
  const booking = location.state?.booking;
  const hotel = location.state?.hotel;
  const paymentMethod = location.state?.paymentMethod;

  // Celebrate on mount
  useEffect(() => {
    if (booking) {
      // Fire confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [booking]);

  // Redirect if no booking data
  useEffect(() => {
    if (!booking) {
      navigate("/my-bookings");
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const copyBookingId = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    toast.success("Booking ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusInfo = () => {
    if (paymentMethod === "bank_transfer") {
      return {
        color: "yellow",
        icon: faUniversity,
        title: "Awaiting Payment Verification",
        message: "We've sent bank transfer details along with an invoice to your email. Please complete the transfer within 24 hours.",
        steps: [
          "Check your email for bank transfer details and invoice",
          "Make the transfer using your booking ID as reference",
          "Send proof of payment to payments@nonsatravels.com",
          "We'll confirm your booking within 24 hours"
        ]
      };
    } else if (paymentMethod === "cash") {
      return {
        color: "green",
        icon: faMoneyBillWave,
        title: "Booking Confirmed - Pay at Hotel",
        message: "Your reservation is confirmed. An invoice has been sent to your email. Please pay at the hotel reception during check-in.",
        steps: [
          "Save this confirmation for check-in",
          "Arrive at the hotel after 2:00 PM",
          "Present your ID and booking reference",
          "Pay the full amount at reception"
        ]
      };
    }
    if (paymentMethod === "mobile_money") {
      return {
        color: "green",
        icon: faCheckCircle,
        title: "Mobile Money Payment Confirmed!",
        message: "Your mobile money payment was received and your booking is confirmed. An invoice has been sent to your email.",
        steps: [
          "Booking confirmation and invoice sent to your email",
          "Save your booking reference number",
          "Arrive at the hotel after 2:00 PM",
          "Contact us on WhatsApp if you need assistance"
        ]
      };
    }
    if (paymentMethod === "card") {
      return {
        color: "green",
        icon: faCheckCircle,
        title: "Card Payment Confirmed!",
        message: "Your card payment was successfully processed and your booking is confirmed. An invoice has been sent to your email.",
        steps: [
          "Booking confirmation and invoice sent to your email",
          "Save your booking reference number",
          "Arrive at the hotel after 2:00 PM",
          "Contact us on WhatsApp if you need assistance"
        ]
      };
    }
    return {
      color: "green",
      icon: faCheckCircle,
      title: "Booking Confirmed!",
      message: "Your payment has been received and your booking is confirmed. An invoice has been sent to your email.",
      steps: [
        "Confirmation email and invoice have been sent",
        "Save your booking ID for reference",
        "Contact the hotel if you need assistance",
        "Arrive at the hotel after 2:00 PM"
      ]
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className={`${
          statusInfo.color === "yellow"
            ? "bg-yellow-500"
            : "bg-green-500"
        } rounded-t-3xl p-8 text-white text-center shadow-xl`}>
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <FontAwesomeIcon icon={statusInfo.icon} className="text-4xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{statusInfo.title}</h1>
          <p className="text-white/90 text-lg">{statusInfo.message}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-3xl shadow-xl">
          {/* Booking ID */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                    {booking.id}
                  </code>
                  <button
                    onClick={copyBookingId}
                    className={`p-2 rounded-lg transition-colors ${
                      copied ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${booking.totalPrice?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
              Next Steps
            </h2>
            <div className="space-y-3">
              {statusInfo.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    statusInfo.color === "yellow" ? "bg-yellow-500" : "bg-green-500"
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Details Toggle */}
          <div className="p-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-gray-900 font-semibold"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-primary" />
                Booking Details
              </span>
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className={`transition-transform ${showDetails ? "rotate-90" : ""}`}
              />
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4 animate-fadeIn">
                {/* Hotel Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    {hotel?.images?.[0] && (
                      <img 
                        src={hotel.images[0]} 
                        alt={hotel.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{hotel?.name || booking.hotelId?.name || "Hotel"}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                        {hotel?.address || booking.hotelId?.address || "Address"}, {hotel?.city || booking.hotelId?.city || "City"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">CHECK-IN</p>
                    <p className="font-semibold text-gray-900">
                      {checkIn.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600">After 2:00 PM</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-xs text-purple-600 font-medium mb-1">CHECK-OUT</p>
                    <p className="font-semibold text-gray-900">
                      {checkOut.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600">Before 11:00 AM</p>
                  </div>
                </div>

                {/* Guest & Room Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{nights} Night{nights > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Room(s)</p>
                      <p className="font-semibold text-gray-900">{booking.guests}</p>
                    </div>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Guest Information</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4" />
                    <span>{booking.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-4" />
                    <span>{booking.userEmail}</span>
                  </div>
                  {booking.userPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FontAwesomeIcon icon={faPhone} className="text-gray-400 w-4" />
                      <span>{booking.userPhone}</span>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCreditCard} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Payment Method</span>
                    </div>
                    <span className="font-medium text-gray-900 capitalize">
                      {paymentMethod === "bank_transfer" ? "Bank Transfer" : paymentMethod === "cash" ? "Pay at Hotel" : paymentMethod === "mobile_money" ? "Mobile Money" : paymentMethod === "card" ? "Card" : paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Important Notes for Bank Transfer */}
          {paymentMethod === "bank_transfer" && (
            <div className="mx-6 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUniversity} />
                Bank Transfer Instructions
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Check your email for complete bank details and invoice</li>
                <li>• Use your Booking ID as payment reference</li>
                <li>• Transfer must be completed within 24 hours</li>
                <li>• Send proof of payment to payments@nonsatravels.com</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/my-bookings"
                className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-semibold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCalendarCheck} />
                View My Bookings
              </Link>
              <Link
                to="/"
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faHome} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Our support team is available 24/7 to assist you
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
            <a
              href="mailto:support@nonsatravels.com"
              className="text-primary hover:underline flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faEnvelope} />
              support@nonsatravels.com
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="tel:+260970462777"
              className="text-primary hover:underline flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPhone} />
              +260 977 123 456
            </a>
          </div>
          {/* WhatsApp Support Button */}
          <WhatsAppButton
            variant="inline"
            message={generateConfirmationMessage(booking)}
            className="mx-auto"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-1" />
            Chat on WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
