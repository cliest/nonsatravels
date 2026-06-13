import { useEffect, useState } from "react";
import { useUser } from "../context/AuthContext";
import { loyaltyAPI } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCoins,
  faTrophy,
  faGift,
  faCalendar,
  faArrowUp,
  faArrowDown,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "../utils/toast";

const LoyaltyDashboard = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState(null);
  const [history, setHistory] = useState([]);
  const [redeemAmount, setRedeemAmount] = useState(100);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [loyaltyRes, historyRes] = await Promise.all([
        loyaltyAPI.getMyPoints(),
        loyaltyAPI.getHistory(20)
      ]);
      setLoyalty(loyaltyRes.data.data);
      setHistory(historyRes.data.data);
    } catch (error) {
      toast.error("Failed to load loyalty data");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (redeemAmount < 100) {
      toast.error("Minimum 100 points required");
      return;
    }

    if (redeemAmount > loyalty.points) {
      toast.error("Insufficient points");
      return;
    }

    try {
      const response = await loyaltyAPI.redeemPoints(redeemAmount);
      toast.success(`Redeemed ${redeemAmount} points for $${response.data.data.discountAmount} discount!`);
      fetchLoyaltyData();
    } catch (error) {
      toast.error("Failed to redeem points");
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: "bg-amber-700",
      silver: "bg-gray-500",
      gold: "bg-yellow-500",
      platinum: "bg-purple-600",
    };
    return colors[tier] || colors.bronze;
  };

  const getTierIcon = (tier) => {
    if (tier === "platinum") return faCrown;
    return faTrophy;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="shimmer rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent mx-auto mb-4"></div>
          <p className="mt-4 text-gray-600">Loading loyalty dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Loyalty Rewards
          </h1>
          <p className="text-gray-600">
            Earn points on every booking and unlock exclusive benefits!
          </p>
        </div>

        {/* Tier Card */}
        <div className={`${getTierColor(loyalty?.tier)} rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-10 text-9xl">
            <FontAwesomeIcon icon={getTierIcon(loyalty?.tier)} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon icon={getTierIcon(loyalty?.tier)} className="text-4xl" />
              <div>
                <p className="text-sm opacity-90">Current Tier</p>
                <h2 className="text-3xl font-bold capitalize">{loyalty?.tier}</h2>
              </div>
            </div>
            
            {/* Progress to Next Tier */}
            {loyalty?.nextTier && loyalty.nextTier.pointsNeeded > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>{loyalty.nextTier.pointsNeeded} points to {loyalty.nextTier.tier}</span>
                  <span>{loyalty.nextTier.progress}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${loyalty.nextTier.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Points */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCoins} className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Available Points</p>
                <p className="text-3xl font-bold text-gray-900">{loyalty?.points || 0}</p>
                <p className="text-xs text-gray-500">${(loyalty?.points / 100 || 0).toFixed(2)} value</p>
              </div>
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faStar} className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900">{loyalty?.totalPointsEarned || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Redeemed */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faGift} className="text-2xl text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Redeemed</p>
                <p className="text-3xl font-bold text-gray-900">{loyalty?.totalPointsRedeemed || 0}</p>
                <p className="text-xs text-gray-500">${(loyalty?.totalPointsRedeemed / 100 || 0).toFixed(2)} saved</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Benefits</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="font-semibold text-gray-900">Tier Discount</span>
                <span className="text-2xl font-bold text-green-600">{loyalty?.benefits?.discount}%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="font-semibold text-gray-900">Points Multiplier</span>
                <span className="text-2xl font-bold text-blue-600">{loyalty?.benefits?.pointsMultiplier}x</span>
              </div>
              <div className="space-y-2">
                {loyalty?.benefits?.prioritySupport && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span>Priority Customer Support</span>
                  </div>
                )}
                {loyalty?.benefits?.earlyCheckIn && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span>Early Check-In</span>
                  </div>
                )}
                {loyalty?.benefits?.lateCheckOut && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span>Late Check-Out</span>
                  </div>
                )}
                {loyalty?.benefits?.freeWifi && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span>Free WiFi</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Redeem Points */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Redeem Points</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Points to Redeem (100 points = $1)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  max={loyalty?.points}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-sm text-gray-600">Discount Value</p>
                <p className="text-3xl font-bold text-primary">
                  ${(redeemAmount / 100).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleRedeem}
                disabled={redeemAmount < 100 || redeemAmount > loyalty?.points}
                className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Redeem Now
              </button>
              <p className="text-xs text-gray-500 text-center">
                Minimum 100 points • Use discount on your next booking
              </p>
            </div>
          </div>
        </div>

        {/* Points History */}
        {history && history.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Points History</h2>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <FontAwesomeIcon
                        icon={item.type === 'earned' ? faArrowUp : faArrowDown}
                        className={item.type === 'earned' ? 'text-green-600' : 'text-red-600'}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'earned' ? '+' : ''}{item.amount}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
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

export default LoyaltyDashboard;
