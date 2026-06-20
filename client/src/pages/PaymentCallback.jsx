import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { paymentAPI } from "../services/paymentAPI";
import { bookingAPI } from "../services/api";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const referenceId = searchParams.get("referenceId");

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!referenceId) {
      navigate("/");
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentAPI.checkStatus(referenceId);
        const data = res.data.data;
        setPaymentStatus(data.status);

        if (data.status === "Successful" || data.booking?.paymentStatus === "completed") {
          const bookingRes = await bookingAPI.getById(referenceId).catch(() => null);
          if (bookingRes?.data?.data) {
            setTimeout(() => {
              navigate("/booking-confirmation", {
                state: { booking: bookingRes.data.data, paymentMethod: "card" },
              });
            }, 2000);
          }
        }
      } catch {
        setPaymentStatus(status === "success" ? "Successful" : "Failed");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [referenceId, status, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary mb-4" />
          <p className="text-gray-600 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus === "Successful" || status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <FontAwesomeIcon
          icon={isSuccess ? faCheckCircle : faTimesCircle}
          className={`text-6xl mb-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isSuccess
            ? "Your card payment was processed. Redirecting to your booking confirmation..."
            : "Your card payment could not be completed. Please try again or choose a different payment method."}
        </p>

        {!isSuccess && (
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
