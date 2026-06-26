import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faTag,
  faClock,
  faCheckCircle,
  faHotel,
  faPercent,
  faShare,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { SkeletonDetailPage } from "../components/Skeleton";
import { offerAPI, hotelAPI } from "../services/api";
import { toast } from "../utils/toast";

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch offer by ID
        const offerRes = await offerAPI.getById(id);
        const offerData = offerRes.data.data;

        if (!offerData) {
          throw new Error("Offer not found");
        }

        setOffer(offerData);

        // Fetch linked hotel or all hotels
        const hotelsRes = await hotelAPI.getAll();
        const allHotels = hotelsRes.data.data || [];
        if (offerData.hotelId) {
          const linked = allHotels.filter(h => h.id === offerData.hotelId);
          setHotels(linked.length > 0 ? linked : allHotels.slice(0, 3));
        } else {
          setHotels(allHotels.slice(0, 6));
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Offer not found";
        toast.error(errorMessage);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetails();
  }, [id, navigate]);

  const offerCode = offer?.promoCode || `OFFER${offer?.priceOff}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offerCode);
    setCopiedCode(true);
    toast.success("Offer code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: offer.title,
      text: `Check out this exclusive offer: ${offer.priceOff}% OFF - ${offer.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Share failed or cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const calculateDaysRemaining = () => {
    const expiryDate = new Date(offer.expiryDate);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isExpiringSoon = () => {
    const daysRemaining = calculateDaysRemaining();
    return daysRemaining > 0 && daysRemaining <= 7;
  };

  const isExpired = () => {
    return calculateDaysRemaining() <= 0;
  };

  if (loading) {
    return <SkeletonDetailPage />;
  }

  if (!offer) {
    return null;
  }

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${offer.image})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 group"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faShare} />
          Share
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 text-white">
          <div className="max-w-7xl mx-auto">
            {/* Discount Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-6 py-3 bg-accent text-white font-bold rounded-full text-2xl shadow-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faPercent} className="text-xl" />
                {offer.priceOff}% OFF
              </span>
              {isExpiringSoon() && !isExpired() && (
                <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full text-sm animate-pulse">
                  Expires Soon!
                </span>
              )}
              {isExpired() && (
                <span className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-full text-sm">
                  Expired
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {offer.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-6">
              {offer.description}
            </p>

            {/* Offer Info Bar */}
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                <span>Valid until {new Date(offer.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {!isExpired() && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-accent" />
                  <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-16">
        {/* Offer Code Section */}
        {!isExpired() && (
          <div className="bg-accent text-white rounded-2xl shadow-xl p-8 md:p-10 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm uppercase tracking-wider mb-2 opacity-90">Your Exclusive Code</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-wider font-mono">
                  {offerCode}
                </h2>
                <p className="text-sm mt-2 opacity-90">Use this code when booking to get {offer.priceOff}% off</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-white text-accent px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-3 shadow-lg"
              >
                <FontAwesomeIcon icon={copiedCode ? faCheckCircle : faCopy} />
                {copiedCode ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
        )}

        {/* Offer Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FontAwesomeIcon icon={faTag} className="text-accent" />
            Offer Details
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What's Included?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                  <span className="text-gray-700">{offer.priceOff}% discount on room rates</span>
                </li>
                {offer.packageDetails && offer.packageDetails.split(',').map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                    <span className="text-gray-700">{item.trim()}</span>
                  </li>
                ))}
                {!offer.packageDetails && (
                <>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                  <span className="text-gray-700">Valid for all available room types</span>
                </li>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                  <span className="text-gray-700">No minimum stay required</span>
                </li>
                </>
                )}
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                  <span className="text-gray-700">Free cancellation up to 24 hours before check-in</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 pl-6 py-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Redeem</h3>
              <ol className="space-y-2 text-blue-800">
                <li>1. Browse and select your preferred hotel</li>
                <li>2. Choose your dates and room preferences</li>
                <li>3. Enter the offer code <span className="font-mono font-bold">{offerCode}</span> at checkout</li>
                <li>4. Enjoy your {offer.priceOff}% discount!</li>
              </ol>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 pl-6 py-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Terms & Conditions</h3>
              <ul className="space-y-2 text-amber-800 text-sm">
                <li>• Offer valid until {new Date(offer.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
                <li>• Cannot be combined with other offers or promotions</li>
                <li>• Subject to availability</li>
                <li>• Discount applies to room rate only, excluding taxes and fees</li>
                <li>• Valid for new bookings only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Available Hotels Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faHotel} className="text-accent" />
              Available Hotels
            </h2>
            <Link
              to="/hotels"
              className="text-accent hover:text-accent-dark font-semibold flex items-center gap-2 transition-colors"
            >
              View All Hotels
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Link
                key={hotel.id}
                to={`/hotels/${hotel.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={hotel.images?.[0] || hotel.imageUrls?.[0] || '/placeholder-hotel.jpg'}
                    alt={hotel.name || hotel.hotelName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Save {offer.priceOff}%
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                    {hotel.name || hotel.hotelName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{hotel.city}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">From</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-400 line-through">
                          ${hotel.pricePerNight}
                        </span>
                        <span className="text-xl font-bold text-accent">
                          ${Math.round(hotel.pricePerNight * (1 - offer.priceOff / 100))}
                        </span>
                        <span className="text-sm text-gray-600">/night</span>
                      </div>
                    </div>
                    <span className="text-accent font-semibold group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {!isExpired() && (
          <div className="bg-primary text-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Miss Out on This Exclusive Offer!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Book now and save {offer.priceOff}% on your next stay
            </p>
            <Link
              to="/hotels"
              className="inline-block bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Browse All Hotels
            </Link>
          </div>
        )}

        {isExpired() && (
          <div className="bg-gray-100 text-gray-700 rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              This Offer Has Expired
            </h2>
            <p className="text-xl mb-8">
              Check out our other exclusive offers and deals
            </p>
            <Link
              to="/"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg"
            >
              View Current Offers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferDetails;
