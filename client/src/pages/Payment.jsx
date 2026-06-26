import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faArrowLeft,
  faCheck,
  faUser,
  faCar,
  faUtensils,
  faInfoCircle,
  faMoneyBillWave,
  faTag,
  faSpinner,
  faTimes,
  faShield,
  faCircleCheck,
  faMobilePhone,
  faCreditCard,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { bookingAPI, promoAPI, servicesAPI } from "../services/api";
import { paymentAPI } from "../services/paymentAPI";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useAuth, useUser } from "../context/AuthContext";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  useAuth();
  const { user } = useUser();

  const [bookingData, setBookingData] = useState(location.state?.bookingData || null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [zmwRate, setZmwRate] = useState(27);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [processing, setProcessing] = useState(false);
  const [momoPhone, setMomoPhone] = useState("");
  const [momoPolling, setMomoPolling] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  
  const [fieldErrors, setFieldErrors] = useState({});

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

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  // Fetch live exchange rate and services
  useEffect(() => {
    servicesAPI.getAll().then(res => {
      const svcs = res.data.data || [];
      setAvailableServices(svcs);
      const initial = {};
      svcs.forEach(s => { initial[s.name] = false; });
      setSelectedServices(initial);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/payments/exchange-rate').then(res => {
      if (res.data?.data?.USD_TO_ZMW) setZmwRate(res.data.data.USD_TO_ZMW);
    }).catch(() => {});
  }, []);

  // Fetch booking from URL param (email payment link)
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId && !bookingData) {
      setLoadingBooking(true);
      bookingAPI.getById(bookingId).then(res => {
        const b = res.data.data;
        const hotel = b.hotelId || {};
        setBookingData({
          hotelId: hotel.id || b.hotelId,
          hotelName: hotel.name || 'Hotel',
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          guests: b.guests,
          totalPrice: b.totalPrice,
          pricePerNight: b.pricePerNight,
          roomTypeId: b.roomTypeId,
          roomTypeName: b.roomTypeName,
        });
        setCreatedBooking(b);
        setBookingStep(2);
        setPersonalInfo(prev => ({
          ...prev,
          firstName: b.userName?.split(' ')[0] || prev.firstName,
          lastName: b.userName?.split(' ').slice(1).join(' ') || prev.lastName,
          email: b.userEmail || prev.email,
          phone: b.userPhone || prev.phone,
        }));
      }).catch(() => {
        toast.error("Booking not found. It may have expired or been cancelled.");
        navigate("/hotels");
      }).finally(() => setLoadingBooking(false));
      return;
    }

    if (!bookingData && !bookingId) {
      toast.error("No booking data found. Please start a new booking.");
      navigate("/");
    }

    if (user) {
      setPersonalInfo(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [searchParams, user]);

  if (loadingBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookingData) {
    return null;
  }

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const validatePersonalInfo = () => {
    const errors = {};
    if (!personalInfo.firstName || personalInfo.firstName.trim().length < 2) errors.firstName = "First name is required (min 2 characters)";
    if (!personalInfo.lastName || personalInfo.lastName.trim().length < 2) errors.lastName = "Last name is required (min 2 characters)";
    if (!personalInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) errors.email = "Please enter a valid email address";
    const effectivePhone = personalInfo.phone?.trim() || "";
    if (!effectivePhone || effectivePhone.length < 9) errors.phone = "Please enter a valid phone number";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.warning("Please fix the highlighted fields");
      return false;
    }
    return true;
  };

  const calculateSubtotal = () => {
    let additionalCost = 0;
    availableServices.forEach(svc => {
      if (selectedServices[svc.name]) additionalCost += svc.cost;
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

  const pollMoMoStatus = (referenceId) => {
    setMomoPolling(true);
    const maxAttempts = 60; // 5 minutes at 5s intervals
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await paymentAPI.checkStatus(referenceId);
        const { status, booking: bookingState } = res.data.data;

        if (status === "Successful" || bookingState?.status === "payment_confirmed") {
          clearInterval(interval);
          setMomoPolling(false);
          toast.success("Payment confirmed! Redirecting...");
          const bookingRes = await bookingAPI.getById(referenceId).catch(() => null);
          navigate("/booking-confirmation", {
            state: {
              booking: bookingRes?.data?.data || { id: referenceId },
              hotel: bookingData,
              paymentMethod: "mobile_money",
            },
          });
          return;
        }

        if (status === "Failed") {
          clearInterval(interval);
          setMomoPolling(false);
          setProcessing(false);
          toast.error("Payment was declined. This may be due to insufficient balance, wrong PIN, or the prompt was not accepted. Please check your mobile money balance and try again.");
          return;
        }
      } catch {
        // Keep polling on transient errors
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setMomoPolling(false);
        setProcessing(false);
        toast.warning("No response received from your mobile money. If you accepted the prompt, your booking will be confirmed shortly — check My Bookings. Otherwise, please try again.");
      }
    }, 5000);
  };

  // Step 1: Create booking and send invoice
  const handleCreateBooking = async (e) => {
    e.preventDefault();

    if (!validatePersonalInfo()) return;
    if (processing) return;
    setProcessing(true);

    try {
      let additionalCost = 0;
      const selectedSvcList = [];
      availableServices.forEach(svc => {
        if (selectedServices[svc.name]) {
          additionalCost += svc.cost;
          selectedSvcList.push({ name: svc.name, cost: svc.cost });
        }
      });

      const totalAmount = ((bookingData.totalPrice || 0) + additionalCost) - getDiscount();
      if (!totalAmount || totalAmount <= 0) {
        toast.error("Invalid booking amount. Please try again.");
        setProcessing(false);
        return;
      }

      const bookingPayload = {
        hotelId: bookingData.hotelId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.guests,
        totalPrice: totalAmount,
        userName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        userEmail: personalInfo.email,
        userPhone: personalInfo.phone,
        specialRequests: personalInfo.specialRequests || null,
        roomPreferences: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
        paymentMethod: "cash",
        paymentStatus: "pending",
        status: "pending_payment",
        ...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
        ...(bookingData.roomTypeId ? { roomTypeId: bookingData.roomTypeId, roomTypeName: bookingData.roomTypeName } : {}),
        additionalServices: selectedSvcList,
      };

      const response = await bookingAPI.create(bookingPayload);
      setCreatedBooking(response.data.data);
      setBookingStep(3);
      toast.success("Booking created! Invoice sent to your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create booking");
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Process payment for existing booking
  const handlePayment = async (e) => {
    e.preventDefault();

    if (processing) return;
    setProcessing(true);

    try {
      // Cash / Pay at Hotel — booking already created, go to confirmation
      if (paymentMethod === "cash") {
        toast.success("You can pay at the hotel on check-in.");
        setTimeout(() => {
          navigate("/booking-confirmation", {
            state: { booking: createdBooking, hotel: bookingData, paymentMethod: "cash" },
          });
        }, 1000);
        return;
      }

      // Use the already-created booking's total (includes services + discounts)
      const paymentTotal = createdBooking?.totalPrice || calculateTotalCost();

      // Mobile Money via Lipila
      if (paymentMethod === "mobile_money") {
        if (!momoPhone || momoPhone.trim().length < 9) {
          toast.warning("Please enter a valid mobile money phone number");
          setProcessing(false);
          return;
        }

        const response = await paymentAPI.initiateMoMo({
          bookingId: createdBooking?.id || createdBooking?._id,
          hotelId: bookingData.hotelId,
          hotelName: bookingData.hotelName,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          guests: bookingData.guests,
          totalPrice: paymentTotal,
          userName: `${personalInfo.firstName} ${personalInfo.lastName}`,
          userEmail: personalInfo.email,
          userPhone: personalInfo.phone || momoPhone.replace(/\s/g, ""),
          specialRequests: personalInfo.specialRequests || null,
          roomPreferences: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
          phoneNumber: momoPhone.replace(/\s/g, ""),
          ...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
          ...(bookingData.roomTypeId ? { roomTypeId: bookingData.roomTypeId, roomTypeName: bookingData.roomTypeName } : {}),
        });

        const { referenceId } = response.data.data;
        toast.success("Check your phone for the mobile money payment prompt!");
        pollMoMoStatus(referenceId);
        return;
      }

      // Card payment via Lipila
    } catch (error) {
      console.error("Booking Error Details:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "An error occurred";
      toast.error(`Payment failed: ${errorMessage}`);
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
                  {availableServices.filter(s => selectedServices[s.name]).map(svc => (
                    <div key={svc.id} className="flex justify-between items-center text-sm text-gray-600">
                      <span>{svc.label}</span>
                      <span>+{formatCurrency(svc.cost)}</span>
                    </div>
                  ))}
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
                    <span className="text-[10px] text-gray-400 block font-normal">All payments processed in USD</span>
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
            {/* Step indicator */}
            {bookingStep !== 3 && (
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center gap-2 ${bookingStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${bookingStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <span className="text-sm font-medium hidden sm:inline">Your Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full transition-all ${bookingStep >= 2 ? 'bg-primary w-full' : 'w-0'}`}></div></div>
              <div className={`flex items-center gap-2 ${bookingStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${bookingStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <span className="text-sm font-medium hidden sm:inline">Payment</span>
              </div>
            </div>
            )}

            {/* Step 3: Booking Confirmed — check email */}
            {bookingStep === 3 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-2">
                  Your invoice <strong>{createdBooking?.invoiceNumber || ''}</strong> has been sent to
                </p>
                <p className="text-primary font-semibold text-lg mb-6">{personalInfo.email}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                  <ol className="text-sm text-blue-700 space-y-2">
                    <li className="flex gap-2"><span className="font-bold">1.</span> Check your email for the invoice and payment link</li>
                    <li className="flex gap-2"><span className="font-bold">2.</span> Click the payment link to choose your payment method</li>
                    <li className="flex gap-2"><span className="font-bold">3.</span> Complete payment to confirm your reservation</li>
                    <li className="flex gap-2"><span className="font-bold">4.</span> Receive your receipt via email once payment is verified</li>
                  </ol>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate("/my-bookings")} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium">
                    View My Bookings
                  </button>
                  <button onClick={() => navigate("/")} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Back to Home
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {bookingStep === 1 && (
            <>
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
                    onChange={(e) => { handlePersonalInfoChange(e); setFieldErrors(prev => ({ ...prev, firstName: undefined })); }}
                    placeholder="John"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors.firstName ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                    required
                  />
                  {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => { handlePersonalInfoChange(e); setFieldErrors(prev => ({ ...prev, lastName: undefined })); }}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors.lastName ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                    required
                  />
                  {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={(e) => { handlePersonalInfoChange(e); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                    required
                  />
                  {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
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
                    onChange={(e) => { handlePersonalInfoChange(e); setFieldErrors(prev => ({ ...prev, phone: undefined })); }}
                    placeholder="+260 XXX XXX XXX"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${fieldErrors.phone ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-green-500'}`}
                    required
                  />
                  {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                  <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                    <FontAwesomeIcon icon={faWhatsapp} className="text-green-500" />
                    Booking confirmation and updates will be sent to this WhatsApp number. Please ensure it is active on WhatsApp.
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
            {availableServices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                Additional Services
              </h2>
              <div className="space-y-3">
                {availableServices.map(svc => (
                  <label key={svc.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faCheck} className="text-blue-600 text-lg" />
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{svc.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-600">+${svc.cost}</span>
                      <input
                        type="checkbox"
                        checked={selectedServices[svc.name] || false}
                        onChange={() => handleServiceToggle(svc.name)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
            )}

            {/* Confirm Booking Button */}
            <button
              onClick={handleCreateBooking}
              disabled={processing}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-accent transition-all shadow-lg text-lg disabled:opacity-50"
            >
              {processing ? (
                <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Creating Booking...</>
              ) : (
                <><FontAwesomeIcon icon={faCheck} className="mr-2" /> Confirm Booking & Send Invoice</>
              )}
            </button>
            </>
            )}

            {/* Step 2: Payment */}
            {bookingStep === 2 && (
            <>
            {/* Payment ready banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <FontAwesomeIcon icon={faCircleCheck} className="text-blue-600 text-3xl mb-2" />
              <h3 className="font-bold text-blue-800 text-lg mb-1">Complete Your Payment</h3>
              <p className="text-blue-700 text-sm">Invoice <strong>{createdBooking?.invoiceNumber || ''}</strong> · Total: <strong>{formatCurrency(createdBooking?.totalPrice || 0)}</strong></p>
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
                      onClick={() => setPaymentMethod("mobile_money")}
                      className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        paymentMethod === "mobile_money"
                          ? "border-yellow-500 bg-yellow-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-yellow-400 hover:shadow-md"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faMobilePhone}
                        className={`text-3xl md:text-4xl mb-2 ${
                          paymentMethod === "mobile_money" ? "text-yellow-600" : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs md:text-sm font-semibold">Mobile Money</span>
                      <span className="text-[10px] text-gray-500 mt-1">MTN / Airtel / Zamtel</span>
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

                {paymentMethod === "mobile_money" && (
                  <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-300 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faMobilePhone} className="text-4xl text-yellow-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Mobile Money Payment</h4>
                        <p className="text-sm text-gray-600">MTN, Airtel Money or Zamtel Kwacha</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                      <p className="text-amber-800">
                        <strong>Amount:</strong> ZK{(calculateTotalCost() * zmwRate).toLocaleString()} (≈ {formatCurrency(calculateTotalCost())} at 1 USD = {zmwRate.toFixed(1)} ZMW)
                      </p>
                    </div>

                    {momoPolling ? (
                      <div className="text-center py-6">
                        <FontAwesomeIcon icon={faHourglassHalf} className="text-4xl text-yellow-500 mb-3 animate-pulse" />
                        <p className="font-semibold text-gray-900 mb-1">Waiting for payment...</p>
                        <p className="text-sm text-gray-600">Check your phone for the mobile money prompt and enter your PIN to confirm.</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Money Number *
                          </label>
                          <input
                            type="tel"
                            value={momoPhone}
                            onChange={(e) => setMomoPhone(e.target.value)}
                            placeholder="260971234567"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter your number in international format: 260XXXXXXXXX</p>
                        </div>
                        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                          <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                          You will receive a payment prompt on your phone. Enter your PIN to complete the payment.
                        </div>
                      </>
                    )}
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
                  disabled={processing || momoPolling}
                  className={`w-full mt-6 py-4 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg ${
                    paymentMethod === "cash"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : paymentMethod === "mobile_money"
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {processing || momoPolling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {momoPolling ? "Awaiting payment..." : "Processing..."}
                    </>
                  ) : paymentMethod === "cash" ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Confirm Booking — {formatCurrency(calculateTotalCost())}
                    </>
                  ) : paymentMethod === "mobile_money" ? (
                    <>
                      <FontAwesomeIcon icon={faMobilePhone} className="mr-2" />
                      Pay with Mobile Money — ZK{(calculateTotalCost() * zmwRate).toLocaleString()}
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
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
