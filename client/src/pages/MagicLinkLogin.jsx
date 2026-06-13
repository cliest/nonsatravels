import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faCheckCircle, faMagic, faArrowLeft, faLock, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { toast } from '../utils/toast';

const MagicLinkLogin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/magic-link', { email });
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Failed to send magic link');
      }
    } catch (error) {
      console.error('Magic link request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email!</h1>
            
            <p className="text-gray-600 mb-4">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 mb-2">
                <strong>What to do next:</strong>
              </p>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Check your email inbox</li>
                <li>2. Click the magic link in the email</li>
                <li>3. You'll be signed in automatically!</li>
              </ol>
            </div>
            
            <p className="text-xs text-gray-500 mb-6">
              <FontAwesomeIcon icon={faLock} className="mr-1 text-gray-400" /> The link expires in 15 minutes for security
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Send Another Link
              </button>
              
              <Link
                to="/login"
                className="block w-full text-center text-primary hover:text-secondary font-medium py-2"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FontAwesomeIcon icon={faMagic} className="text-3xl text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Magic Link Login</h1>
            <p className="text-gray-600">Sign in without a password</p>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong className="text-purple-700 flex items-center gap-1 mb-1"><FontAwesomeIcon icon={faLightbulb} /> How it works:</strong>
              Enter your email and we'll send you a secure link to sign in instantly. No password needed!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:bg-purple-700 hover:shadow-xl"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMagic} />
                  Send Magic Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to regular login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkLogin;
