import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faArrowLeft,
  faCheck,
  faUser,
  faCar,
  faUtensils,
  faInfoCircle,
  faUniversity,
  faMoneyBillWave,
  faCopy,
  faTag,
  faSpinner,
  faTimes,
  faShield,
  faTriangleExclamation,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { bookingAPI, promoAPI } from "../services/api";
import { toast } from "../utils/toast";
import { useAuth, useUser } from "../context/AuthContext";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  const bookingData = location.state?.bookingData;

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [processing, setProcessing] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    country: "Zambia",
    specialRequests: "",
  });

  const [additionalServices, setAdditionalServices] = useState({
    airportTransfer: false,
    earlyCheckIn: false,
    lateCheckOut: false,
    extraBed: false,
    breakfast: false,
  });

  useEffect(() => {
    if (!bookingData) {
      toast.error("No booking data found. Please start a new booking.");
      navigate("/");
    } else {
      console.log("Payment Page - Booking Data Received:");
      console.log("- hotelId:", bookingData.hotelId);
      console.log("- totalPrice:", bookingData.totalPrice);
      console.log("- checkInDate:", bookingData.checkInDate);
      console.log("- checkOutDate:", bookingData.checkOutDate);
      console.log("- guests:", bookingData.guests);
      console.log("Full object:", bookingData);
    }
    
    if (user) {
      setPersonalInfo(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [bookingData, navigate, user]);

  // Validate booking data exists
  if (!bookingData) {
    return null;
  }

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleServiceToggle = (service) => {
    setAdditionalServices({
      ...additionalServices,
      [service]: !additionalServices[service],
    });
  };

  const validatePersonalInfo = () => {
    if (!personalInfo.firstName || personalInfo.firstName.trim().length < 2) {
      toast.warning("Please enter your first name");
      return false;
    }
    if (!personalInfo.lastName || personalInfo.lastName.trim().length < 2) {
      toast.warning("Please enter your last name");
      return false;
    }
    if (!personalInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      toast.warning("Please enter a valid email address");
      return false;
    }
    if (!personalInfo.phone || personalInfo.phone.trim().length < 9) {
      toast.warning("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const calculateSubtotal = () => {
    const serviceCosts = {
      airportTransfer: 50,
      earlyCheckIn: 30,
      lateCheckOut: 30,
      extraBed: 25,
      breakfast: 15,
    };

    let additionalCost = 0;
    Object.keys(additionalServices).forEach((service) => {
      if (additionalServices[service]) {
        additionalCost += serviceCosts[service];
      }
    });

    return bookingData.totalPrice + additionalCost;
  };

  const calculateTotalCost = () => {
    const subtotal = calculateSubtotal();
    if (appliedPromo) {
      return Math.max(0, subtotal - appliedPromo.discount);
    }
    return subtotal;
  };

  const getDiscount = () => {
    return appliedPromo ? appliedPromo.discount : 0;
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const response = await promoAPI.validate(
        promoCode.trim(),
        calculateSubtotal(),
        bookingData.hotelId
      );

      if (response.data.success) {
        setAppliedPromo(response.data.data);
        toast.success(`Promo code applied! You save $${response.data.data.discount.toFixed(2)}`);
      }
    } catch (error) {
      setPromoError(error.response?.data?.message || "Invalid promo code");
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  // Copy bank details to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const completeBooking = async (paymentId, method = paymentMethod) => {
    try {
      const serviceCosts = {
        airportTransfer: 50,
        earlyCheckIn: 30,
        lateCheckOut: 30,
        extraBed: 25,
        breakfast: 15,
      };

      let additionalCost = 0;
      Object.keys(additionalServices).forEach((service) => {
        if (additionalServices[service]) {
          additionalCost += serviceCosts[service];
        }
      });

      const totalAmount = bookingData.totalPrice + additionalCost;

      // Prepare comprehensive booking payload
      const bookingPayload = {
        hotelId: bookingData.hotelId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.guests,
        roomsRequested: bookingData.guests || 1, // Number of rooms needed
        totalPrice: totalAmount,
        userName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        userEmail: personalInfo.email,
        userPhone: personalInfo.phone,
        specialRequests: personalInfo.specialRequests || null,
        roomPreferences: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
        paymentId,
        paymentMethod: method,
        paymentStatus: "completed",
        status: "payment_confirmed",
      };

      const response = await bookingAPI.create(bookingPayload);

      if (method === "bank_transfer") {
        toast.success("Booking submitted! Bank details and invoice have been sent to your email.");
      } else {
        toast.success("Booking submitted successfully! An invoice has been sent to your email.");
      }
      
      setTimeout(() => {
        navigate("/booking-confirmation", { 
          state: { 
            booking: response.data.data,
            hotel: bookingData,
            paymentMethod: method
          } 
        });
      }, 1500);
    } catch (error) {
      toast.error("Booking submission failed. Please contact support with your payment reference.");
      setProcessing(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validatePersonalInfo()) {
      return;
    }

    setProcessing(true);

    try {
      // For bank transfer or cash, create booking with pending payment
      if (paymentMethod === "bank_transfer" || paymentMethod === "cash") {
        const serviceCosts = {
          airportTransfer: 50,
          earlyCheckIn: 30,
          lateCheckOut: 30,
          extraBed: 25,
          breakfast: 15,
        };

        let additionalCost = 0;
        Object.keys(additionalServices).forEach((service) => {
          if (additionalServices[service]) {
            additionalCost += serviceCosts[service];
          }
        });

        const totalAmount = (bookingData.totalPrice || 0) + additionalCost;
        
        // Validate total amount
        if (!totalAmount || totalAmount <= 0) {
          toast.error("Invalid booking amount. Please try again.");
          console.error(" Invalid totalAmount:");
          console.error("- bookingData.totalPrice:", bookingData.totalPrice, "type:", typeof bookingData.totalPrice);
          console.error("- additionalCost:", additionalCost);
          console.error("- totalAmount:", totalAmount);
          return;
        }

        const bookingPayload = {
          hotelId: bookingData.hotelId,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          guests: bookingData.guests,
          roomsRequested: bookingData.guests || 1,
          totalPrice: totalAmount,
          userName: `${personalInfo.firstName} ${personalInfo.lastName}`,
          userEmail: personalInfo.email,
          userPhone: personalInfo.phone,
          specialRequests: personalInfo.specialRequests || null,
          roomPreferences: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
          paymentMethod: paymentMethod,
          paymentStatus: "pending",
          status: "pending_payment",
        };

        console.log(" Booking Payload to send:");
        console.log("- hotelId:", bookingPayload.hotelId);
        console.log("- totalPrice:", bookingPayload.totalPrice, "type:", typeof bookingPayload.totalPrice);
        console.log("- userName:", bookingPayload.userName);
        console.log("- userEmail:", bookingPayload.userEmail);
        console.log("Full payload:", JSON.stringify(bookingPayload, null, 2));
        const response = await bookingAPI.create(bookingPayload);

        if (paymentMethod === "bank_transfer") {
          toast.success("Booking confirmed! Bank details and invoice have been sent to your email.");
        } else {
          toast.success("Booking confirmed! An invoice has been sent to your email.");
        }
        
        setTimeout(() => {
          navigate("/booking-confirmation", { 
            state: { 
              booking: response.data.data,
              hotel: bookingData,
              paymentMethod: paymentMethod
            } 
          });
        }, 1500);
        return;
      }

      // For other payment methods
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await completeBooking(paymentId);
    } catch (error) {
      console.error("Booking Error Details:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "An error occurred";
      toast.error(paymentMethod === "bank_transfer" 
        ? `Failed to submit booking: ${errorMessage}` 
        : `Payment failed: ${errorMessage}`);
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 md:mb-8 transition-colors font-semibold group"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Hotel Details
        </button>

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8 h-fit fade-in">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Booking Summary</h2>
            
            <div className="space-y-5">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Hotel</p>
                <p className="font-bold text-lg text-gray-900">{bookingData.hotelName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Check-in</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(bookingData.checkInDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Check-out</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(bookingData.checkOutDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Guests</p>
                <p className="font-semibold text-gray-900">{bookingData.guests} guest(s)</p>
              </div>

              <div className="pt-2">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Room Cost</span>
                    <span className="font-semibold">{formatCurrency(bookingData.totalPrice)}</span>
                  </div>
                  {additionalServices.airportTransfer && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Airport Transfer</span>
                      <span>+{formatCurrency(50)}</span>
                    </div>
                  )}
                  {additionalServices.earlyCheckIn && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Early Check-in</span>
                      <span>+{formatCurrency(30)}</span>
                    </div>
                  )}
                  {additionalServices.lateCheckOut && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Late Check-out</span>
                      <span>+{formatCurrency(30)}</span>
                    </div>
                  )}
                  {additionalServices.extraBed && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Extra Bed</span>
                      <span>+{formatCurrency(25)}</span>
                    </div>
                  )}
                  {additionalServices.breakfast && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Breakfast (per day)</span>
                      <span>+{formatCurrency(15)}</span>
                    </div>
                  )}
                  {/* Promo Code Discount */}
                  {appliedPromo && (
                    <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faTag} />
                        Promo: {appliedPromo.code}
                      </span>
                      <span>-{formatCurrency(appliedPromo.discount)}</span>
                    </div>
                  )}
                </div>
                
                {/* Promo Code Input */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faTag} className="mr-1 text-primary" />
                    Have a promo code?
                  </label>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                      >
                        {promoLoading ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-green-700">
                        <FontAwesomeIcon icon={faCheck} />
                        <span className="font-medium">{appliedPromo.code}</span>
                        <span className="text-sm">(-{formatCurrency(appliedPromo.discount)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-red-500 text-xs mt-1">{promoError}</p>
                  )}
                </div>

                <div className="flex justify-between items-center text-xl md:text-2xl font-bold pt-3 border-t-2 border-gray-200">
                  <span className="text-gray-700">Total Amount</span>
                  <div className="text-right">
                    {appliedPromo && (
                      <span className="text-sm text-gray-400 line-through block">
                        {formatCurrency(calculateSubtotal())}
                      </span>
                    )}
                    <span className="text-blue-600">
                      {formatCurrency(calculateTotalCost())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-6">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-blue-600 mt-1 mr-3 text-xl"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-bold mb-1 text-blue-900 flex items-center gap-1"><FontAwesomeIcon icon={faShield} /> Secure Payment</p>
                    <p className="leading-relaxed">
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                    placeholder="John"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FontAwesomeIcon icon={faWhatsapp} className="text-green-500 mr-1" />
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    placeholder="+260 XXX XXX XXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                    <FontAwesomeIcon icon={faWhatsapp} className="text-green-500" />
                    Bank details and booking confirmation will be sent to this WhatsApp number. Please ensure it is active on WhatsApp.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={personalInfo.address}
                    onChange={handlePersonalInfoChange}
                    placeholder="Street Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={personalInfo.city}
                    onChange={handlePersonalInfoChange}
                    placeholder="Lusaka"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={personalInfo.country}
                    onChange={handlePersonalInfoChange}
                    placeholder="Zambia"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={personalInfo.specialRequests}
                    onChange={handlePersonalInfoChange}
                    rows="3"
                    placeholder="Any special requests..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                Additional Services
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCar} className="text-blue-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">Airport Transfer</p>
                      <p className="text-sm text-gray-600">Pick up and drop off service</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">+$50</span>
                    <input
                      type="checkbox"
                      checked={additionalServices.airportTransfer}
                      onChange={() => handleServiceToggle("airportTransfer")}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">Early Check-in</p>
                      <p className="text-sm text-gray-600">Before 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">+$30</span>
                    <input
                      type="checkbox"
                      checked={additionalServices.earlyCheckIn}
                      onChange={() => handleServiceToggle("earlyCheckIn")}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCheck} className="text-orange-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">Late Check-out</p>
                      <p className="text-sm text-gray-600">After 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">+$30</span>
                    <input
                      type="checkbox"
                      checked={additionalServices.lateCheckOut}
                      onChange={() => handleServiceToggle("lateCheckOut")}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faUser} className="text-purple-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">Extra Bed</p>
                      <p className="text-sm text-gray-600">Additional bed in room</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">+$25</span>
                    <input
                      type="checkbox"
                      checked={additionalServices.extraBed}
                      onChange={() => handleServiceToggle("extraBed")}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faUtensils} className="text-red-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">Daily Breakfast</p>
                      <p className="text-sm text-gray-600">Buffet breakfast per day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">+$15/day</span>
                    <input
                      type="checkbox"
                      checked={additionalServices.breakfast}
                      onChange={() => handleServiceToggle("breakfast")}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900">Payment Details</h2>

              <form onSubmit={handlePayment}>
                <div className="mb-8">
                  <label className="block text-sm font-bold mb-4 text-gray-700">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        paymentMethod === "bank_transfer"
                          ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faUniversity}
                        className={`text-3xl md:text-4xl mb-2 ${
                          paymentMethod === "bank_transfer" ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs md:text-sm font-semibold">Bank Transfer</span>
                      <span className="text-[10px] text-gray-500 mt-1">Direct deposit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        paymentMethod === "cash"
                          ? "border-green-600 bg-green-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-green-400 hover:shadow-md"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className={`text-3xl md:text-4xl mb-2 ${
                          paymentMethod === "cash" ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs md:text-sm font-semibold">Cash</span>
                      <span className="text-[10px] text-gray-500 mt-1">Pay at hotel</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faUniversity} className="text-4xl text-blue-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Bank Transfer Details</h4>
                        <p className="text-sm text-gray-600">Transfer to our account below</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bank Name:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Stanbic Bank Zambia</span>
                          <button onClick={() => copyToClipboard('Stanbic Bank Zambia')} className="text-blue-600 hover:text-blue-800">
                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Account Name:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Nonsa Travels Ltd</span>
                          <button onClick={() => copyToClipboard('Nonsa Travels Ltd')} className="text-blue-600 hover:text-blue-800">
                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 font-mono">9130002541234</span>
                          <button onClick={() => copyToClipboard('9130002541234')} className="text-blue-600 hover:text-blue-800">
                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Branch Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 font-mono">040001</span>
                          <button onClick={() => copyToClipboard('040001')} className="text-blue-600 hover:text-blue-800">
                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Swift Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 font-mono">SBICZMLX</span>
                          <button onClick={() => copyToClipboard('SBICZMLX')} className="text-blue-600 hover:text-blue-800">
                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" /><strong>Important:</strong> Use your <strong>email address</strong> as the payment reference. 
                        Send proof of payment to <strong>payments@nonsatravels.com</strong>
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="text-4xl text-green-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Pay Cash at Hotel</h4>
                        <p className="text-sm text-gray-600">Payment upon arrival</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 text-sm text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1" />
                        <span>Pay in <strong>USD</strong> or <strong>Zambian Kwacha (ZMW)</strong> at the hotel reception</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1" />
                        <span>Present your <strong>booking confirmation</strong> at check-in</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1" />
                        <span>Full payment required before room keys are issued</span>
                      </li>
                    </ul>

                    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <FontAwesomeIcon icon={faCircleCheck} className="mr-1" /><strong>Note:</strong> Your booking will be held for <strong>24 hours</strong>. 
                        Please contact us if you need to make changes.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full mt-6 py-4 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg ${
                    paymentMethod === "cash" 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : paymentMethod === "cash" ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Confirm Booking - {formatCurrency(calculateTotalCost())}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="mr-2" />
                      Submit & Pay {formatCurrency(calculateTotalCost())}
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By confirming this booking, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
