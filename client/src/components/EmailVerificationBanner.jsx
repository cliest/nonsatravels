import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faTimes,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { toast } from "../utils/toast";

const EmailVerificationBanner = () => {
  const { user, isLoaded, refreshUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissedUntil = sessionStorage.getItem("emailBannerDismissed");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
      setDismissed(true);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Don't show if: not loaded, no user, user is verified, or banner dismissed
  if (!isLoaded || !user || user.isVerified || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    // Dismiss for 1 hour in this session
    sessionStorage.setItem(
      "emailBannerDismissed",
      String(Date.now() + 60 * 60 * 1000)
    );
  };

  const handleResendVerification = async () => {
    if (sending || cooldown > 0) return;

    setSending(true);
    try {
      const response = await authAPI.resendVerification(user.email);
      if (response.data.skipped) {
        toast.info("Email service is not configured. Please contact support to verify your account.");
      } else {
        toast.success("Verification email sent! Please check your inbox.");
      }
      setCooldown(60); // 60 second cooldown
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send verification email. Please try again later.";
      
      // If email is already verified, refresh user data and show success
      if (message.toLowerCase().includes("already verified")) {
        toast.success("Your email is already verified!");
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        toast.error(message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 text-white relative z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-sm" />
            </div>
            <div>
              <p className="font-medium text-sm sm:text-base">
                Please verify your email address
              </p>
              <p className="text-xs sm:text-sm text-white/90">
                Check your inbox for a verification link sent to{" "}
                <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResendVerification}
              disabled={sending || cooldown > 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Resend Email
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss"
              title="Dismiss for 1 hour"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
