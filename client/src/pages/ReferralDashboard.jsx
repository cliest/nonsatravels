import { useEffect, useState } from "react";
import { useUser } from "../context/AuthContext";
import { referralAPI } from "../services/api";
import ShareButtons from "../components/ShareButtons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faCheck,
  faUsers,
  faGift,
  faDollarSign,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "../utils/toast";

const ReferralDashboard = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    }
  }, [user]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await referralAPI.getMyCode();
      setStats(response.data.data);
    } catch (error) {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopiedCode(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopiedCode(false), 3000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="shimmer rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent mx-auto mb-4"></div>
          <p className="mt-4 text-gray-600">Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Referral Program
          </h1>
          <p className="text-gray-600">
            Share your referral code and earn rewards when your friends book hotels!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Referrals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-2xl text-blue-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalReferrals || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Discount Earned */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="text-2xl text-green-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">You Earned</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats?.totalDiscountEarned?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Discount Given */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faGift}
                  className="text-2xl text-purple-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Friends Saved</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${stats?.totalDiscountGiven?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-primary rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Referral Code</h2>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl font-bold tracking-widest">
                {stats?.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  copiedCode
                    ? "bg-green-500"
                    : "bg-white/30 hover:bg-white/40"
                }`}
              >
                <FontAwesomeIcon
                  icon={copiedCode ? faCheck : faCopy}
                  className="mr-2"
                />
                {copiedCode ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <p className="text-white/90 text-sm">
              Share this code with friends to give them 10% off (up to $50) on their first booking!
            </p>
          </div>

          {/* Share Buttons */}
          <div>
            <p className="mb-3 font-semibold">Share via:</p>
            <ShareButtons
              url={stats?.shareUrl || window.location.origin}
              title={`Join Nonsa Travels with my referral code ${stats?.referralCode} and get 10% off your first booking!`}
              description="Book amazing hotels at great prices"
              hashtags={["NonsaTravels", "Travel", "Hotels"]}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Share Your Code</h3>
              <p className="text-gray-600 text-sm">
                Send your unique referral code to friends and family
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">They Book & Save</h3>
              <p className="text-gray-600 text-sm">
                Your friends get 10% off (up to $50) on their first booking
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">You Earn Rewards</h3>
              <p className="text-gray-600 text-sm">
                Earn 10% of the discount given as credit for future bookings
              </p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        {stats?.recentReferrals && stats.recentReferrals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Referrals
            </h2>
            <div className="space-y-4">
              {stats.recentReferrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {referral.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {referral.email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        {new Date(referral.referredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${referral.discountAmount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">saved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;
