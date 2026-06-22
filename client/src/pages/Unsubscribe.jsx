import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { contactAPI } from "../services/api";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await contactAPI.unsubscribe(email);
      if (res.data.success) {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribed</h1>
            <p className="text-gray-600 mb-6">
              You have been successfully unsubscribed from our newsletter. You will no longer receive marketing emails from us.
            </p>
            <Link to="/" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium">
              Back to Home
            </Link>
          </>
        ) : status === "error" ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We couldn't process your request. Please try again or contact support@nonsatravels.com.</p>
            <button onClick={() => setStatus(null)} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium">
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe</h1>
            <p className="text-gray-600 mb-6">Enter your email to unsubscribe from the Nonsa Travels newsletter.</p>
            <form onSubmit={handleUnsubscribe} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? "Processing..." : "Unsubscribe"}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4">
              Changed your mind? You can always <Link to="/" className="text-primary hover:underline">resubscribe</Link> from our website.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
