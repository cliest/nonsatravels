import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { referralAPI } from "../services/api";
import { toast } from "../utils/toast";

export const useReferralTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    
    if (referralCode) {
      // Check if already used a referral code
      const usedReferral = localStorage.getItem("usedReferralCode");
      if (usedReferral) {

        return;
      }

      // Validate and store referral code
      validateAndStoreReferral(referralCode);
    }
  }, [searchParams]);

  const validateAndStoreReferral = async (code) => {
    try {
      const response = await referralAPI.validate(code);
      
      if (response.data.success) {
        // Store referral code in localStorage
        localStorage.setItem("pendingReferralCode", code);
        toast.success(
          `Referral code applied! Get ${response.data.data.discountPercentage}% off your first booking!`
        );
      }
    } catch (error) {
      // Don't show error toast - invalid codes should fail silently
    }
  };

  const getReferralCode = () => {
    return localStorage.getItem("pendingReferralCode");
  };

  const markReferralUsed = () => {
    const code = localStorage.getItem("pendingReferralCode");
    if (code) {
      localStorage.setItem("usedReferralCode", code);
      localStorage.removeItem("pendingReferralCode");
    }
  };

  const clearReferralCode = () => {
    localStorage.removeItem("pendingReferralCode");
  };

  return {
    getReferralCode,
    markReferralUsed,
    clearReferralCode,
  };
};
